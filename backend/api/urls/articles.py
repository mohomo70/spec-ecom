"""
Articles API endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.articles import ArticleViewSet, ArticleCategoryViewSet

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'article-categories', ArticleCategoryViewSet, basename='article-category')

urlpatterns = router.urls

