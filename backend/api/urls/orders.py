"""
Orders API endpoints.
"""

from django.urls import path
from ..views import orders

urlpatterns = [
    path('', orders.OrderListView.as_view(), name='order-list'),
    path('<uuid:pk>/', orders.OrderDetailView.as_view(), name='order-detail'),
    path('checkout/', orders.CheckoutView.as_view(), name='checkout'),
]