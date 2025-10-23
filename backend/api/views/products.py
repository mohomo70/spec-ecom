"""
Product views.
"""

from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.db.models import Q
from ..models import FishProduct
from ..serializers import FishProductSerializer


class ProductListView(generics.ListAPIView):
    """List products with optional search and filtering."""

    serializer_class = FishProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = FishProduct.objects.filter(is_available=True).prefetch_related('categories')

        # Search functionality
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(species_name__icontains=search) |
                Q(scientific_name__icontains=search) |
                Q(description__icontains=search)
            )

        # Category filter
        category = self.request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(categories__slug=category)

        # Difficulty filter
        difficulty = self.request.query_params.get('difficulty', '')
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Tank size filter
        min_tank_size = self.request.query_params.get('min_tank_size')
        if min_tank_size:
            queryset = queryset.filter(min_tank_size_gallons__gte=min_tank_size)

        return queryset.order_by('species_name')


class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve a single product."""

    serializer_class = FishProductSerializer
    permission_classes = [AllowAny]
    queryset = FishProduct.objects.filter(is_available=True).prefetch_related('categories')