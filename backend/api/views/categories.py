"""
Category views.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction, DatabaseError, OperationalError
import os
from ..models import Category, CategoryImage
from ..serializers import CategorySerializer, CategoryImageSerializer
from ..validators import validate_image_file
from ..permissions import IsAdminOnly


class CategoryListView(generics.ListAPIView):
    """List all active categories."""

    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.filter(is_active=True).order_by('display_order', 'name')


class CategoryImageUploadView(APIView):
    """Upload, update, and delete images for a category."""
    
    permission_classes = [IsAdminOnly]
    
    def post(self, request, category_id):
        """Upload a new category image."""
        try:
            category = get_object_or_404(Category, id=category_id)
            
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
                    category_image = CategoryImage.objects.create(
                        category=category,
                        image=image_file,
                        alt_text=alt_text
                    )
                    
                    serializer = CategoryImageSerializer(category_image, context={'request': request})
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
    
    def put(self, request, category_id, image_id):
        """Update/replace an existing category image."""
        try:
            category = get_object_or_404(Category, id=category_id)
            category_image = get_object_or_404(CategoryImage, id=image_id, category=category)
            
            old_image_path = category_image.image.path if category_image.image else None
            
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
                
                category_image.image = image_file
            
            alt_text = request.data.get('alt_text', category_image.alt_text)
            
            try:
                with transaction.atomic():
                    category_image.alt_text = alt_text
                    category_image.save()
                    
                    if old_image_path and os.path.isfile(old_image_path):
                        try:
                            os.remove(old_image_path)
                        except OSError:
                            pass
                    
                    serializer = CategoryImageSerializer(category_image, context={'request': request})
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
    
    def delete(self, request, category_id, image_id):
        """Delete a category image."""
        try:
            category = get_object_or_404(Category, id=category_id)
            category_image = get_object_or_404(CategoryImage, id=image_id, category=category)
            
            image_path = category_image.image.path if category_image.image else None
            category_image.delete()
            
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