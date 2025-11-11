"""
Authentication API endpoints.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from ..views import auth

urlpatterns = [
    path('register/', auth.UserRegistrationView.as_view(), name='user-register'),
    path('login/', auth.UserLoginView.as_view(), name='user-login'),
    path('logout/', auth.UserLogoutView.as_view(), name='user-logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token-verify'),
    path('me/', auth.UserProfileView.as_view(), name='user-profile'),
]