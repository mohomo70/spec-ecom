"""
Article views.
"""

import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import CursorPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.db import transaction, DatabaseError, OperationalError
import os
from ..models import Article, ArticleCategory, ArticleImage
from ..serializers import (
    ArticleSummarySerializer,
    ArticleDetailSerializer,
    ArticleCategorySerializer,
    ArticleCreateSerializer,
    ArticleCategoryCreateSerializer,
    ArticleImageSerializer
)
from ..validators import validate_image_file
from ..permissions import IsAdminOnly

logger = logging.getLogger(__name__)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Custom permission: only admins can create/edit/delete articles."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'


class ArticleCursorPagination(CursorPagination):
    page_size = 20
    ordering = '-published_at'


class ArticleViewSet(viewsets.ModelViewSet):
    """ViewSet for Article model."""
    queryset = Article.objects.select_related('category', 'author')
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category']
    ordering_fields = ['published_at', 'created_at']
    ordering = ['-published_at']
    pagination_class = ArticleCursorPagination
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ['list', 'retrieve']:
            user = self.request.user
            if not user.is_authenticated or user.role != 'admin':
                queryset = queryset.filter(status='published')
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ArticleCreateSerializer
        elif self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleSummarySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'admin_list']:
            return [permissions.IsAuthenticated(), IsAdminOrReadOnly()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        """Create article with logging."""
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            article = Article.objects.get(id=response.data['id'])
            logger.info(
                f"Article created: {article.slug} by {request.user.email}",
                extra={'article_id': str(article.id), 'user_id': str(request.user.id)}
            )
        return response

    def update(self, request, *args, **kwargs):
        """Update article with logging."""
        response = super().update(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            article = self.get_object()
            logger.info(
                f"Article updated: {article.slug} by {request.user.email}",
                extra={'article_id': str(article.id), 'user_id': str(request.user.id)}
            )
        return response

    def destroy(self, request, *args, **kwargs):
        """Delete article with logging."""
        article = self.get_object()
        article_slug = article.slug
        article_id = str(article.id)
        response = super().destroy(request, *args, **kwargs)
        if response.status_code == status.HTTP_204_NO_CONTENT:
            logger.info(
                f"Article deleted: {article_slug} by {request.user.email}",
                extra={'article_id': article_id, 'user_id': str(request.user.id)}
            )
        return response

    @action(detail=False, methods=['get'], url_path='admin', permission_classes=[permissions.IsAuthenticated])
    def admin_list(self, request):
        """Admin-only endpoint to list all articles including drafts."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ArticleCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for ArticleCategory model."""
    queryset = ArticleCategory.objects.all()
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ArticleCategoryCreateSerializer
        return ArticleCategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminOrReadOnly()]
        return [permissions.AllowAny()]

    def list(self, request, *args, **kwargs):
        """List categories with caching."""
        cache_key = 'article_categories_list'
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)
        
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, 3600)
        return response

    def create(self, request, *args, **kwargs):
        """Create category and invalidate cache."""
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            cache.delete('article_categories_list')
            logger.info(
                f"Category created: {response.data.get('name')} by {request.user.email}",
                extra={'category_id': response.data.get('id'), 'user_id': str(request.user.id)}
            )
        return response

    def update(self, request, *args, **kwargs):
        """Update category and invalidate cache."""
        response = super().update(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            cache.delete('article_categories_list')
        return response

    def destroy(self, request, *args, **kwargs):
        """Delete category and invalidate cache."""
        response = super().destroy(request, *args, **kwargs)
        if response.status_code == status.HTTP_204_NO_CONTENT:
            cache.delete('article_categories_list')
        return response


class ArticleImageUploadView(APIView):
    """Upload, update, and delete featured images for articles."""
    
    permission_classes = [IsAdminOnly]
    
    def post(self, request, article_id):
        """Upload a new article featured image."""
        try:
            article = get_object_or_404(Article, id=article_id)
            
            if 'image' not in request.FILES:
                return Response(
                    {
                        'error': 'image_required',
                        'message': 'Image file is required',
                        'field': 'image'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            image_file = request.FILES['image']
            
            try:
                validate_image_file(image_file)
            except Exception as e:
                error_message = str(e)
                if 'format' in error_message.lower():
                    return Response(
                        {
                            'error': 'invalid_format',
                            'message': 'Unsupported file format. Only JPEG, PNG, and WebP formats are supported.',
                            'field': 'image'
                        },
                        status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
                    )
                elif 'size' in error_message.lower():
                    return Response(
                        {
                            'error': 'file_too_large',
                            'message': error_message,
                            'field': 'image'
                        },
                        status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                    )
                elif 'dimensions' in error_message.lower():
                    return Response(
                        {
                            'error': 'dimensions_exceeded',
                            'message': error_message,
                            'field': 'image'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    return Response(
                        {
                            'error': 'invalid_image',
                            'message': 'Invalid or corrupted image file',
                            'field': 'image'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            alt_text = request.data.get('alt_text', '')
            
            try:
                with transaction.atomic():
                    article_image = ArticleImage.objects.create(
                        article=article,
                        image=image_file,
                        alt_text=alt_text
                    )
                    
                    serializer = ArticleImageSerializer(article_image, context={'request': request})
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
            except (OSError, IOError) as e:
                # Handle disk space errors and storage issues
                return Response(
                    {
                        'error': 'storage_error',
                        'message': 'Storage unavailable. Unable to save image file. Insufficient storage space or storage error.',
                        'field': 'image'
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except (DatabaseError, OperationalError) as e:
                # Handle database connection errors during maintenance
                return Response(
                    {
                        'error': 'database_error',
                        'message': 'Database temporarily unavailable. Please try again later.',
                        'field': 'image'
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except Exception as e:
                return Response(
                    {
                        'error': 'upload_failed',
                        'message': f'Failed to upload image: {str(e)}',
                        'field': 'image'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {
                    'error': 'server_error',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, article_id, image_id):
        """Update/replace an existing article featured image."""
        try:
            article = get_object_or_404(Article, id=article_id)
            article_image = get_object_or_404(ArticleImage, id=image_id, article=article)
            
            old_image_path = article_image.image.path if article_image.image else None
            
            if 'image' in request.FILES:
                image_file = request.FILES['image']
                
                try:
                    validate_image_file(image_file)
                except Exception as e:
                    error_message = str(e)
                    if 'format' in error_message.lower():
                        return Response(
                            {
                                'error': 'invalid_format',
                                'message': 'Unsupported file format. Only JPEG, PNG, and WebP formats are supported.',
                                'field': 'image'
                            },
                            status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
                        )
                    elif 'size' in error_message.lower():
                        return Response(
                            {
                                'error': 'file_too_large',
                                'message': error_message,
                                'field': 'image'
                            },
                            status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                        )
                    else:
                        return Response(
                            {
                                'error': 'invalid_image',
                                'message': 'Invalid or corrupted image file',
                                'field': 'image'
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                article_image.image = image_file
            
            alt_text = request.data.get('alt_text', article_image.alt_text)
            
            try:
                with transaction.atomic():
                    article_image.alt_text = alt_text
                    article_image.save()
                    
                    if old_image_path and os.path.isfile(old_image_path):
                        try:
                            os.remove(old_image_path)
                        except OSError:
                            pass
                    
                    serializer = ArticleImageSerializer(article_image, context={'request': request})
                    return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {
                        'error': 'update_failed',
                        'message': f'Failed to update image: {str(e)}',
                        'field': 'image'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {
                    'error': 'server_error',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, article_id, image_id):
        """Delete an article featured image."""
        try:
            article = get_object_or_404(Article, id=article_id)
            article_image = get_object_or_404(ArticleImage, id=image_id, article=article)
            
            image_path = article_image.image.path if article_image.image else None
            article_image.delete()
            
            if image_path and os.path.isfile(image_path):
                try:
                    os.remove(image_path)
                except OSError:
                    pass
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {
                    'error': 'server_error',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

