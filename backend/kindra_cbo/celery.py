"""
Celery Configuration for Kindra CBO Management System
"""

import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kindra_cbo.settings')

# Create Celery app
app = Celery('kindra_cbo')

# Load configuration from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()

# Celery Beat Schedule for periodic tasks
app.conf.beat_schedule = {
    # Generate daily reports at 6 AM
    'generate-daily-reports': {
        'task': 'reporting.tasks.generate_daily_reports',
        'schedule': crontab(hour=6, minute=0),
    },
    # Generate weekly reports every Monday at 7 AM
    'generate-weekly-reports': {
        'task': 'reporting.tasks.generate_weekly_reports',
        'schedule': crontab(day_of_week=1, hour=7, minute=0),
    },
    # Generate monthly reports on the 1st of each month at 8 AM
    'generate-monthly-reports': {
        'task': 'reporting.tasks.generate_monthly_reports',
        'schedule': crontab(day_of_month=1, hour=8, minute=0),
    },
    # Send newsletter every Friday at 10 AM
    'send-weekly-newsletter': {
        'task': 'blog.tasks.send_weekly_newsletter',
        'schedule': crontab(day_of_week=5, hour=10, minute=0),
    },
    # Backup database daily at 2 AM
    'backup-database': {
        'task': 'kindra_cbo.tasks.backup_database',
        'schedule': crontab(hour=2, minute=0),
    },
    # Clean up old analytics events (older than 90 days) weekly
    'cleanup-old-analytics': {
        'task': 'reporting.tasks.cleanup_old_analytics',
        'schedule': crontab(day_of_week=0, hour=3, minute=0),
    },
    # Send volunteer reminders every day at 9 AM
    'send-volunteer-reminders': {
        'task': 'volunteers.tasks.send_daily_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
    # Check and send donation receipts every hour
    'process-pending-receipts': {
        'task': 'donations.tasks.process_pending_receipts',
        'schedule': crontab(minute=0),
    },
}

# Celery configuration
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Africa/Nairobi',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery"""
    print(f'Request: {self.request!r}')
