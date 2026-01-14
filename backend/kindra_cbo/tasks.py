"""
Common Celery tasks for Kindra CBO
"""

from celery import shared_task
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)


@shared_task
def backup_database():
    """
    Create a database backup
    """
    try:
        logger.info("Starting database backup...")
        # This would call your backup script or use Django's dumpdata
        call_command('dumpdata', '--natural-foreign', '--natural-primary', 
                    '--exclude=contenttypes', '--exclude=auth.permission',
                    output='backups/db_backup.json')
        logger.info("Database backup completed successfully")
        return "Backup completed"
    except Exception as e:
        logger.error(f"Database backup failed: {str(e)}")
        raise


@shared_task
def send_email_notification(recipient, subject, message, html_message=None):
    """
    Send email notification
    """
    from django.core.mail import send_mail
    from django.conf import settings
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Email sent to {recipient}: {subject}")
        return f"Email sent to {recipient}"
    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {str(e)}")
        raise


@shared_task
def send_sms_notification(phone_number, message):
    """
    Send SMS notification via Africa's Talking
    """
    try:
        # Import Africa's Talking SDK
        import africastalking
        from django.conf import settings
        
        # Initialize SDK
        africastalking.initialize(
            username=settings.AFRICASTALKING_USERNAME,
            api_key=settings.AFRICASTALKING_API_KEY
        )
        
        # Get SMS service
        sms = africastalking.SMS
        
        # Send SMS
        response = sms.send(message, [phone_number])
        logger.info(f"SMS sent to {phone_number}: {response}")
        return f"SMS sent to {phone_number}"
    except Exception as e:
        logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
        raise
