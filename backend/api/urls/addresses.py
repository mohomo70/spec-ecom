"""
Addresses API endpoints.
"""

from django.urls import path
from ..views import addresses

urlpatterns = [
    path('', addresses.AddressListCreateView.as_view(), name='address-list-create'),
    path('<uuid:pk>/', addresses.AddressDetailView.as_view(), name='address-detail'),
]