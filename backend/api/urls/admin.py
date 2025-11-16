"""
Admin API endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.admin import (
    UserAdminViewSet, UserProfileAdminViewSet, ProductAdminViewSet,
    CategoryAdminViewSet, OrderAdminViewSet, ArticleAdminViewSet,
    ArticleCategoryAdminViewSet, DashboardStatsView
)

router = DefaultRouter()
router.register(r'users', UserAdminViewSet, basename='admin-user')
router.register(r'users/(?P<user_id>[^/.]+)/profile', UserProfileAdminViewSet, basename='admin-user-profile')
router.register(r'products', ProductAdminViewSet, basename='admin-product')
router.register(r'categories', CategoryAdminViewSet, basename='admin-category')
router.register(r'orders', OrderAdminViewSet, basename='admin-order')
router.register(r'articles', ArticleAdminViewSet, basename='admin-article')
router.register(r'article-categories', ArticleCategoryAdminViewSet, basename='admin-article-category')

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='admin-dashboard-stats'),
] + router.urls

