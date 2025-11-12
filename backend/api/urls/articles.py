"""
Articles API endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.articles import ArticleViewSet, ArticleCategoryViewSet, ArticleImageUploadView

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'article-categories', ArticleCategoryViewSet, basename='article-category')

urlpatterns = router.urls + [
    path('articles/<uuid:article_id>/images/', ArticleImageUploadView.as_view(), name='article-image-upload'),
    path('articles/<uuid:article_id>/images/<uuid:image_id>/', ArticleImageUploadView.as_view(), name='article-image-update-delete'),
]

