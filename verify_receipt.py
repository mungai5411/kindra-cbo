import os
import sys
import django
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kindra_cbo.settings')
django.setup()

from donations.utils import amount_to_words, get_date_digits

def generate_sample_receipt():
    now = datetime.now()
    context = {
        'receipt': {'receipt_number': 'REC-TEST1234'},
        'donation': {
            'donor_name': 'John Doe',
            'amount': 5000.00,
            'currency': 'KES',
            'payment_method': 'MPESA',
            'transaction_id': 'QWE123RTY',
            'donation_date': now,
            'campaign': {'title': 'Education Fund'}
        },
        'date': now.strftime('%d %b %Y'),
        'date_digits': get_date_digits(now),
        'amount_in_words': amount_to_words(5000.00, 'KES'),
        'logo_path': os.path.abspath('backend/donations/static/donations/images/logo.jpg'),
        'bg_path': os.path.abspath('backend/donations/static/donations/images/background.png'),
    }
    
    html_string = render_to_string('donations/receipt.html', context)
    output_filename = "sample_receipt.pdf"
    
    with open(output_filename, "wb") as f:
        pisa_status = pisa.CreatePDF(html_string, dest=f)
    
    if pisa_status.err:
        print("Error generating PDF")
    else:
        print(f"Successfully generated {output_filename}")
        print(f"Absolute path: {os.path.abspath(output_filename)}")

if __name__ == "__main__":
    generate_sample_receipt()
