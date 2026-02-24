import io
import logging
from django.template.loader import render_to_string
from django.conf import settings
import os

logger = logging.getLogger('kindra_cbo')

class CertificateService:
    @staticmethod
    def generate_training_certificate(completion):
        """
        Generate a professional certificate for training completion
        Returns bytes (PDF content)
        """
        from weasyprint import HTML
        try:
            # Logo path
            logo_path = os.path.join(settings.BASE_DIR, 'donations', 'static', 'donations', 'images', 'logo.jpg')
            if not os.path.exists(logo_path):
                logo_path = None
                
            context = {
                'volunteer': completion.volunteer,
                'training': completion.training,
                'completion_date': completion.completed_date,
                'certificate_number': completion.certificate_number,
                'logo_path': logo_path,
                'organization_name': "Kindra CBO",
            }
            
            # Use a specialized certificate template
            template_name = 'volunteers/certificate_template.html'
            
            html_string = render_to_string(template_name, context)
            
            buffer = io.BytesIO()
            HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf(buffer)
            
            buffer.seek(0)
            return buffer.read()
            
        except Exception as e:
            logger.error(f"Error generating certificate for completion {completion.id}: {str(e)}")
            return None
