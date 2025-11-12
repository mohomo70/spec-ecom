"""
Custom permissions for image upload endpoints.
"""

from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows read-only access to all users,
    but requires admin role for write operations (including image uploads).
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOnly(permissions.BasePermission):
    """
    Permission class that requires admin role for all operations.
    Used for image upload endpoints.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

