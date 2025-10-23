"""
Categories API endpoints.
"""

from django.urls import path
from ..views import categories

urlpatterns = [
    path('', categories.CategoryListView.as_view(), name='category-list'),
]