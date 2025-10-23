"""
Products API endpoints.
"""

from django.urls import path
from ..views import products

urlpatterns = [
    path('', products.ProductListView.as_view(), name='product-list'),
    path('<uuid:pk>/', products.ProductDetailView.as_view(), name='product-detail'),
]