"""
Health check views.
"""

from django.http import JsonResponse
from django.db import connection
import os


def health_check(request):
    """
    Simple health check endpoint for monitoring.
    """
    health_status = {
        'status': 'healthy',
        'timestamp': None,
        'services': {}
    }

    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['services']['database'] = 'healthy'
    except Exception as e:
        health_status['services']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'

    # Application check
    health_status['services']['application'] = 'healthy'

    # Set timestamp
    from django.utils import timezone
    health_status['timestamp'] = timezone.now().isoformat()

    status_code = 200 if health_status['status'] == 'healthy' else 503

    return JsonResponse(health_status, status=status_code)