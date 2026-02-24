from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import connections
from django.db.utils import OperationalError
from django.core.cache import cache

class HealthCheckView(APIView):
    """
    Health check endpoint for DevOps monitoring.
    Verifies Database and Cache connectivity.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        health_status = {
            'status': 'healthy',
            'checks': {
                'database': 'unknown',
                'cache': 'unknown'
            }
        }
        
        # Check Database
        db_conn = connections['default']
        try:
            db_conn.cursor()
            health_status['checks']['database'] = 'connected'
        except OperationalError:
            health_status['checks']['database'] = 'disconnected'
            health_status['status'] = 'unhealthy'
            
        # Check Cache
        try:
            cache.set('health_check', 'ok', timeout=5)
            if cache.get('health_check') == 'ok':
                health_status['checks']['cache'] = 'connected'
            else:
                health_status['checks']['cache'] = 'disconnected'
                health_status['status'] = 'unhealthy'
        except Exception:
            health_status['checks']['cache'] = 'error'
            health_status['status'] = 'unhealthy'
            
        status_code = status.HTTP_200_OK if health_status['status'] == 'healthy' else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(health_status, status=status_code)
