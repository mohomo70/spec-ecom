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

        # Enhanced search functionality
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(species_name__icontains=search) |
                Q(scientific_name__icontains=search) |
                Q(description__icontains=search) |
                Q(care_instructions__icontains=search) |
                Q(compatibility_notes__icontains=search)
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

        # pH range filter
        ph_min = self.request.query_params.get('ph_min')
        ph_max = self.request.query_params.get('ph_max')
        if ph_min:
            queryset = queryset.filter(ph_range_min__lte=ph_min, ph_range_max__gte=ph_min)
        if ph_max:
            queryset = queryset.filter(ph_range_min__lte=ph_max, ph_range_max__gte=ph_max)

        # Temperature range filter
        temp_min = self.request.query_params.get('temp_min')
        temp_max = self.request.query_params.get('temp_max')
        if temp_min:
            queryset = queryset.filter(temperature_range_min__lte=temp_min, temperature_range_max__gte=temp_min)
        if temp_max:
            queryset = queryset.filter(temperature_range_min__lte=temp_max, temperature_range_max__gte=temp_max)

        # Diet type filter
        diet_type = self.request.query_params.get('diet_type')
        if diet_type:
            queryset = queryset.filter(diet_type=diet_type)

        # Max size filter
        max_size = self.request.query_params.get('max_size')
        if max_size:
            queryset = queryset.filter(max_size_inches__lte=max_size)

        return queryset.order_by('species_name')


class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve a single product."""

    serializer_class = FishProductSerializer
    permission_classes = [AllowAny]
    queryset = FishProduct.objects.filter(is_available=True).prefetch_related('categories')