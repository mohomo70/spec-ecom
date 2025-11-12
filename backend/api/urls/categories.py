"""
Categories API endpoints.
"""

from django.urls import path
from ..views import categories

urlpatterns = [
    path('', categories.CategoryListView.as_view(), name='category-list'),
    path('<uuid:category_id>/images/', categories.CategoryImageUploadView.as_view(), name='category-image-upload'),
    path('<uuid:category_id>/images/<uuid:image_id>/', categories.CategoryImageUploadView.as_view(), name='category-image-update-delete'),
]