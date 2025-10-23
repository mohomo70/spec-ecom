"""
Category views.
"""

from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import Category
from ..serializers import CategorySerializer


class CategoryListView(generics.ListAPIView):
    """List all active categories."""

    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.filter(is_active=True).order_by('display_order', 'name')