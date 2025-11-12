"""
Admin dashboard viewsets.
"""

import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from ..models import UserProfile, FishProduct, ProductImage, Category, CategoryImage, Order, Article, ArticleCategory, ArticleImage
from ..serializers.admin import (
    UserAdminSerializer,
    UserAdminCreateSerializer,
    UserAdminUpdateSerializer,
    UserDetailAdminSerializer,
    UserProfileAdminSerializer,
    ProductAdminSerializer,
    ProductAdminCreateSerializer,
    ProductAdminUpdateSerializer,
    ProductDetailAdminSerializer,
    ProductImageAdminSerializer,
    CategoryAdminSerializer,
    CategoryAdminCreateSerializer,
    CategoryAdminUpdateSerializer,
    CategoryDetailAdminSerializer,
    CategoryImageAdminSerializer,
    OrderAdminSerializer,
    OrderAdminUpdateSerializer,
    OrderDetailAdminSerializer,
    ArticleAdminSerializer,
    ArticleAdminCreateSerializer,
    ArticleAdminUpdateSerializer,
    ArticleDetailAdminSerializer,
    ArticleImageAdminSerializer
)
from ..permissions import IsAdminOnly

User = get_user_model()
logger = logging.getLogger(__name__)


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserAdminViewSet(viewsets.ModelViewSet):
    """Admin viewset for User management."""
    
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    pagination_class = AdminPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'email', 'username']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserAdminCreateSerializer
        elif self.action == 'retrieve':
            return UserDetailAdminSerializer
        elif self.action in ['update', 'partial_update']:
            return UserAdminUpdateSerializer
        return UserAdminSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            queryset = queryset.select_related('userprofile')
        return queryset

    def create(self, request, *args, **kwargs):
        """Create user - role always set to 'user'."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info(
            f"User created via admin dashboard: {user.email} by {request.user.email}",
            extra={'user_id': str(user.id), 'admin_id': str(request.user.id)}
        )
        headers = self.get_success_headers(serializer.data)
        return Response(
            UserAdminSerializer(user).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        """Update user - prevent role changes."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if 'role' in request.data:
            return Response(
                {
                    "error": "Role modification not allowed",
                    "message": "Role changes must be done through Django admin interface."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info(
            f"User updated via admin dashboard: {instance.email} by {request.user.email}",
            extra={'user_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Delete user - prevent self-deletion."""
        instance = self.get_object()
        
        if instance.id == request.user.id:
            return Response(
                {
                    "error": "Self-deletion not allowed",
                    "message": "You cannot delete your own account."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        logger.info(
            f"User deleted via admin dashboard: {instance.email} by {request.user.email}",
            extra={'user_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'patch'])
    def profile(self, request, pk=None):
        """Get or update user profile."""
        user = self.get_object()
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if request.method == 'GET':
            serializer = UserProfileAdminSerializer(profile)
            return Response(serializer.data)
        
        serializer = UserProfileAdminSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProductAdminViewSet(viewsets.ModelViewSet):
    """Admin viewset for Product management."""
    
    queryset = FishProduct.objects.all().prefetch_related('categories', 'product_images')
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    pagination_class = AdminPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_available', 'difficulty_level', 'diet_type']
    search_fields = ['species_name', 'scientific_name', 'description']
    ordering_fields = ['species_name', 'price', 'stock_quantity', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductAdminCreateSerializer
        elif self.action == 'retrieve':
            return ProductDetailAdminSerializer
        elif self.action in ['update', 'partial_update']:
            return ProductAdminUpdateSerializer
        return ProductAdminSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(categories__id=category_id)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        return queryset.distinct()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        logger.info(
            f"Product created via admin dashboard: {product.species_name} by {request.user.email}",
            extra={'product_id': str(product.id), 'admin_id': str(request.user.id)}
        )
        headers = self.get_success_headers(serializer.data)
        return Response(
            ProductDetailAdminSerializer(product, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info(
            f"Product updated via admin dashboard: {instance.species_name} by {request.user.email}",
            extra={'product_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(ProductDetailAdminSerializer(instance, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        logger.info(
            f"Product deleted via admin dashboard: {instance.species_name} by {request.user.email}",
            extra={'product_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'post', 'delete'])
    def images(self, request, pk=None):
        """Manage product images."""
        product = self.get_object()
        
        if request.method == 'GET':
            images = product.product_images.all().order_by('-is_primary', 'display_order', 'created_at')
            serializer = ProductImageAdminSerializer(images, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            image_file = request.FILES.get('image')
            if not image_file:
                return Response(
                    {'error': 'image_required', 'message': 'Image file is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            is_primary = request.data.get('is_primary', 'false').lower() == 'true'
            if is_primary:
                ProductImage.objects.filter(product=product, is_primary=True).update(is_primary=False)
            
            image = ProductImage.objects.create(
                product=product,
                image=image_file,
                is_primary=is_primary,
                alt_text=request.data.get('alt_text', ''),
                caption=request.data.get('caption', ''),
                display_order=request.data.get('display_order', 0)
            )
            serializer = ProductImageAdminSerializer(image, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=True, methods=['patch', 'delete'], url_path='images/(?P<image_id>[^/.]+)')
    def image_detail(self, request, pk=None, image_id=None):
        """Update or delete a specific product image."""
        product = self.get_object()
        try:
            image = ProductImage.objects.get(id=image_id, product=product)
        except ProductImage.DoesNotExist:
            return Response(
                {'error': 'not_found', 'message': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'PATCH':
            serializer = ProductImageAdminSerializer(image, data=request.data, partial=True, context={'request': request})
            serializer.is_valid(raise_exception=True)
            
            if request.data.get('is_primary') and not image.is_primary:
                ProductImage.objects.filter(product=product, is_primary=True).update(is_primary=False)
            
            serializer.save()
            return Response(serializer.data)
        
        elif request.method == 'DELETE':
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


class CategoryAdminViewSet(viewsets.ModelViewSet):
    """Admin viewset for Category management."""
    
    queryset = Category.objects.all().select_related('parent_category').prefetch_related('category_images', 'products')
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    pagination_class = AdminPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'parent_category']
    search_fields = ['name', 'slug', 'description']
    ordering_fields = ['name', 'display_order', 'created_at']
    ordering = ['display_order', 'name']

    def get_serializer_class(self):
        if self.action == 'create':
            return CategoryAdminCreateSerializer
        elif self.action == 'retrieve':
            return CategoryDetailAdminSerializer
        elif self.action in ['update', 'partial_update']:
            return CategoryAdminUpdateSerializer
        return CategoryAdminSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        logger.info(
            f"Category created via admin dashboard: {category.name} by {request.user.email}",
            extra={'category_id': str(category.id), 'admin_id': str(request.user.id)}
        )
        headers = self.get_success_headers(serializer.data)
        return Response(
            CategoryDetailAdminSerializer(category, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info(
            f"Category updated via admin dashboard: {instance.name} by {request.user.email}",
            extra={'category_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(CategoryDetailAdminSerializer(instance, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        product_count = instance.products.count()
        if product_count > 0:
            return Response(
                {
                    "error": "Cannot delete category with products",
                    "message": f"This category has {product_count} product(s). Please remove or reassign products before deleting."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        logger.info(
            f"Category deleted via admin dashboard: {instance.name} by {request.user.email}",
            extra={'category_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'post'])
    def images(self, request, pk=None):
        """Manage category images."""
        category = self.get_object()
        
        if request.method == 'GET':
            images = category.category_images.all().order_by('created_at')
            serializer = CategoryImageAdminSerializer(images, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            image_file = request.FILES.get('image')
            if not image_file:
                return Response(
                    {'error': 'image_required', 'message': 'Image file is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            image = CategoryImage.objects.create(
                category=category,
                image=image_file,
                alt_text=request.data.get('alt_text', '')
            )
            serializer = CategoryImageAdminSerializer(image, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def image_detail(self, request, pk=None, image_id=None):
        """Delete a specific category image."""
        category = self.get_object()
        try:
            image = CategoryImage.objects.get(id=image_id, category=category)
        except CategoryImage.DoesNotExist:
            return Response(
                {'error': 'not_found', 'message': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin viewset for Order management (read-only list/retrieve, update allowed)."""
    
    queryset = Order.objects.all().select_related('user', 'shipping_address', 'billing_address').prefetch_related('items__product')
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    pagination_class = AdminPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    search_fields = ['order_number', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'total_amount', 'order_number']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailAdminSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderAdminUpdateSerializer
        return OrderAdminSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info(
            f"Order updated via admin dashboard: {instance.order_number} by {request.user.email}",
            extra={'order_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(OrderDetailAdminSerializer(instance, context={'request': request}).data)


class ArticleAdminViewSet(viewsets.ModelViewSet):
    """Admin viewset for Article management."""
    
    queryset = Article.objects.all().select_related('category', 'author').prefetch_related('article_images')
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    pagination_class = AdminPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'slug', 'content', 'excerpt']
    ordering_fields = ['created_at', 'published_at', 'title']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ArticleAdminCreateSerializer
        elif self.action == 'retrieve':
            return ArticleDetailAdminSerializer
        elif self.action in ['update', 'partial_update']:
            return ArticleAdminUpdateSerializer
        return ArticleAdminSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = serializer.save()
        logger.info(
            f"Article created via admin dashboard: {article.title} by {request.user.email}",
            extra={'article_id': str(article.id), 'admin_id': str(request.user.id)}
        )
        headers = self.get_success_headers(serializer.data)
        return Response(
            ArticleDetailAdminSerializer(article, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info(
            f"Article updated via admin dashboard: {instance.title} by {request.user.email}",
            extra={'article_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(ArticleDetailAdminSerializer(instance, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        logger.info(
            f"Article deleted via admin dashboard: {instance.title} by {request.user.email}",
            extra={'article_id': str(instance.id), 'admin_id': str(request.user.id)}
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'post', 'delete'])
    def images(self, request, pk=None):
        """Manage article images."""
        article = self.get_object()
        
        if request.method == 'GET':
            images = article.article_images.all().order_by('created_at')
            serializer = ArticleImageAdminSerializer(images, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            image_file = request.FILES.get('image')
            if not image_file:
                return Response(
                    {'error': 'image_required', 'message': 'Image file is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            image = ArticleImage.objects.create(
                article=article,
                image=image_file,
                alt_text=request.data.get('alt_text', '')
            )
            serializer = ArticleImageAdminSerializer(image, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def image_detail(self, request, pk=None, image_id=None):
        """Delete a specific article image."""
        article = self.get_object()
        try:
            image = ArticleImage.objects.get(id=image_id, article=article)
        except ArticleImage.DoesNotExist:
            return Response(
                {'error': 'not_found', 'message': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
