"""
API URL configuration for freshwater fish ecommerce platform.
"""

from django.urls import path, include

urlpatterns = [
    path('auth/', include('api.urls.auth')),
    path('products/', include('api.urls.products')),
    path('categories/', include('api.urls.categories')),
    path('cart/', include('api.urls.cart')),
    path('orders/', include('api.urls.orders')),
    path('addresses/', include('api.urls.addresses')),
]