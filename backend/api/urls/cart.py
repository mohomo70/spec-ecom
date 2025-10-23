"""
Cart API endpoints.
"""

from django.urls import path
from ..views import cart

urlpatterns = [
    path('', cart.CartView.as_view(), name='cart'),
]