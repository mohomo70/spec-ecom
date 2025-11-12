"""
Products API endpoints.
"""

from django.urls import path
from ..views import products

urlpatterns = [
    path('', products.ProductListView.as_view(), name='product-list'),
    path('<uuid:pk>/', products.ProductDetailView.as_view(), name='product-detail'),
    path('<uuid:product_id>/images/', products.ProductImageUploadView.as_view(), name='product-image-upload'),
    path('<uuid:product_id>/images/<uuid:image_id>/', products.ProductImageUploadView.as_view(), name='product-image-update-delete'),
]