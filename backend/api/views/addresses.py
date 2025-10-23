"""
Address views.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from ..models import ShippingAddress
from ..serializers import ShippingAddressSerializer


class AddressListCreateView(generics.ListCreateAPIView):
    """List and create user addresses."""

    serializer_class = ShippingAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # If this is set as default, unset other defaults for this user and type
        if serializer.validated_data.get('is_default'):
            ShippingAddress.objects.filter(
                user=self.request.user,
                address_type=serializer.validated_data['address_type'],
                is_default=True
            ).update(is_default=False)

        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a user address."""

    serializer_class = ShippingAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        # If this is set as default, unset other defaults for this user and type
        if serializer.validated_data.get('is_default'):
            ShippingAddress.objects.filter(
                user=self.request.user,
                address_type=serializer.instance.address_type,
                is_default=True
            ).exclude(pk=serializer.instance.pk).update(is_default=False)

        serializer.save()