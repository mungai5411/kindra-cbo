"""
Quick Data Population Script
Creates sample data directly without management command
"""

import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kindra_cbo.settings')
django.setup()

from django.contrib.auth import get_user_model
from blog.models import Category, Tag, BlogPost
from donations.models import Campaign, Donor, Donation
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

print("Creating sample data...")

# Create admin user if not exists
if not User.objects.filter(email='admin@kindra.org').exists():
    admin = User.objects.create_superuser(
        email='admin@kindra.org',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    print("✓ Created admin user (admin@kindra.org / admin123)")
else:
    admin = User.objects.get(email='admin@kindra.org')
    print("✓ Admin user already exists")

# Create blog categories
categories_data = [
    {'name': 'Success Stories', 'slug': 'success-stories', 'description': 'Inspiring stories of transformation'},
    {'name': 'News & Updates', 'slug': 'news-updates', 'description': 'Latest news from Kindra CBO'},
    {'name': 'Events', 'slug': 'events', 'description': 'Upcoming and past events'},
]

for cat_data in categories_data:
    Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults=cat_data
    )

print("✓ Created blog categories")

# Create tags
tags_data = ['children', 'education', 'health', 'community', 'fundraising']
for tag_name in tags_data:
    Tag.objects.get_or_create(
        name=tag_name,
        defaults={'slug': tag_name.lower()}
    )

print("✓ Created tags")

# Create blog posts
posts_data = [
    {
        'title': 'Empowering 50 Children Through Education',
        'slug': 'empowering-50-children-education',
        'excerpt': 'This year, we successfully enrolled 50 vulnerable children in quality schools.',
        'content': '''This year marks a significant milestone for Kindra CBO. Through the generous support of our donors and volunteers, we have successfully enrolled 50 vulnerable children in quality schools across Nairobi.

Each child received:
- School fees for the entire year
- Complete school uniform
- Learning materials and books
- Daily nutritious meals

The impact has been tremendous. Parents report improved confidence in their children, and teachers note excellent academic progress.''',
        'category': Category.objects.get(slug='success-stories'),
        'status': 'PUBLISHED',
        'published_at': timezone.now() - timedelta(days=10),
    },
    {
        'title': 'Community Health Initiative Reaches 200 Families',
        'slug': 'community-health-initiative-200-families',
        'excerpt': 'Our health outreach program has provided essential healthcare to 200 families.',
        'content': '''Our community health initiative has reached a major milestone, providing essential healthcare services to over 200 families in underserved communities.

Services provided include:
- Free health screenings
- Vaccination programs
- Nutrition counseling
- Mental health support

We partnered with local healthcare providers to ensure quality care.''',
        'category': Category.objects.get(slug='news-updates'),
        'status': 'PUBLISHED',
        'published_at': timezone.now() - timedelta(days=5),
    },
    {
        'title': 'Annual Fundraising Gala - Save the Date!',
        'slug': 'annual-fundraising-gala-2025',
        'excerpt': 'Join us for our biggest fundraising event of the year.',
        'content': '''We are excited to announce our Annual Fundraising Gala, scheduled for next month!

Event Details:
- Date: January 15, 2025
- Time: 6:00 PM - 10:00 PM
- Venue: Nairobi Serena Hotel
- Dress Code: Formal

All proceeds will go directly to our education and health programs.''',
        'category': Category.objects.get(slug='events'),
        'status': 'PUBLISHED',
        'published_at': timezone.now() - timedelta(days=2),
    },
]

for post_data in posts_data:
    post, created = BlogPost.objects.get_or_create(
        slug=post_data['slug'],
        defaults={**post_data, 'author': admin}
    )
    if created:
        education_tag = Tag.objects.get(name='education')
        children_tag = Tag.objects.get(name='children')
        post.tags.add(education_tag, children_tag)

print("✓ Created blog posts")

# Create donation campaigns
campaigns_data = [
    {
        'title': 'Education Support Program 2025',
        'slug': 'education-support-2025',
        'description': 'Help us provide quality education to 100 vulnerable children',
        'target_amount': 1000000,
        'currency': 'KES',
        'start_date': timezone.now().date(),
        'end_date': (timezone.now() + timedelta(days=90)).date(),
        'status': 'ACTIVE',
    },
    {
        'title': 'Nutrition Program',
        'slug': 'nutrition-program',
        'description': 'Ensure children have access to nutritious meals every day',
        'target_amount': 500000,
        'currency': 'KES',
        'start_date': timezone.now().date(),
        'end_date': (timezone.now() + timedelta(days=60)).date(),
        'status': 'ACTIVE',
    },
    {
        'title': 'Shelter Home Support',
        'slug': 'shelter-home-support',
        'description': 'Support our partner shelter homes with essential supplies',
        'target_amount': 750000,
        'currency': 'KES',
        'start_date': timezone.now().date(),
        'end_date': (timezone.now() + timedelta(days=120)).date(),
        'status': 'ACTIVE',
    },
]

for campaign_data in campaigns_data:
    Campaign.objects.get_or_create(
        slug=campaign_data['slug'],
        defaults=campaign_data
    )

print("✓ Created donation campaigns")

# Create sample donors and donations
donors_data = [
    {'full_name': 'John Doe', 'email': 'john.doe@example.com', 'phone_number': '+254712345678', 'country': 'Kenya'},
    {'full_name': 'Jane Smith', 'email': 'jane.smith@example.com', 'phone_number': '+254723456789', 'country': 'Kenya'},
    {'full_name': 'Michael Johnson', 'email': 'michael.j@example.com', 'phone_number': '+254734567890', 'country': 'Kenya'},
]

donor_count = 0
for donor_data in donors_data:
    donor, created = Donor.objects.get_or_create(
        email=donor_data['email'],
        defaults=donor_data
    )
    
    if created:
        donor_count += 1
        campaign = Campaign.objects.get(slug='education-support-2025')
        Donation.objects.create(
            donor=donor,
            campaign=campaign,
            amount=10000 + (donor_count * 5000),
            currency='KES',
            payment_method='MPESA',
            status='COMPLETED',
            transaction_id=f'MPESA{int(timezone.now().timestamp())}{donor_count}'
        )

from volunteers.models import Volunteer
from shelter_homes.models import ShelterHome
from case_management.models import Family, Child, Case

# ... (Existing code ends at line 201)

print("✓ Created donors and donations")

# Create Volunteers
volunteers_data = [
    {
        'full_name': 'Sarah Kamau',
        'email': 'sarah.k@example.com',
        'phone_number': '+254711223344',
        'county': 'Nairobi',
        'skills': 'Teaching, Counseling',
        'availability': 'Weekends',
        'status': 'ACTIVE',
        'join_date': timezone.now().date()
    },
    {
        'full_name': 'David Omondi',
        'email': 'david.o@example.com',
        'phone_number': '+254722334455',
        'county': 'Kisumu',
        'skills': 'First Aid, Logistics',
        'availability': 'Weekdays',
        'status': 'ACTIVE',
        'join_date': timezone.now().date()
    },
    {
        'full_name': 'Grace Wanjiku',
        'email': 'grace.w@example.com',
        'phone_number': '+254733445566',
        'county': 'Nakuru',
        'skills': 'Fundraising, Event Planning',
        'availability': 'Flexible',
        'status': 'ON_LEAVE',
        'join_date': timezone.now().date()
    }
]

for vol_data in volunteers_data:
    Volunteer.objects.get_or_create(
        email=vol_data['email'],
        defaults=vol_data
    )

print("✓ Created volunteers")

# Create Shelter Homes
shelters_data = [
    {
        'name': 'Hope Children\'s Home',
        'registration_number': 'REG/2023/001',
        'contact_person': 'Mary Mutua',
        'phone_number': '+254700000001',
        'email': 'hope@kindra.org',
        'county': 'Nairobi',
        'physical_address': 'Langata Road, Nairobi',
        'total_capacity': 50,
        'current_occupancy': 35,
        'compliance_status': 'ACTIVE'
    },
    {
        'name': 'Safe Haven Center',
        'registration_number': 'REG/2023/002',
        'contact_person': 'Peter Njoroge',
        'phone_number': '+254700000002',
        'email': 'haven@kindra.org',
        'county': 'Kiambu',
        'physical_address': 'Thika Road, Ruiru',
        'total_capacity': 30,
        'current_occupancy': 10,
        'compliance_status': 'ACTIVE'
    }
]

for shelter_data in shelters_data:
    ShelterHome.objects.get_or_create(
        registration_number=shelter_data['registration_number'],
        defaults=shelter_data
    )

print("✓ Created shelter homes")

# Create Families and Cases
if not Family.objects.exists():
    family = Family.objects.create(
        family_code='FAM001',
        primary_contact_name='Alice Achieng',
        primary_contact_phone='+254799887766',
        county='Nairobi',
        physical_address='Kibera Drive',
        vulnerability_score=85,
        vulnerability_level='HIGH'
    )
    
    child = Child.objects.create(
        family=family,
        first_name='Kevin',
        last_name='Achieng',
        date_of_birth=timezone.now().date() - timedelta(days=365*10), # 10 years old
        gender='M',
        legal_status='WITH_PARENTS'
    )
    
    Case.objects.create(
        case_number='CASE/2025/001',
        family=family,
        title='Educational Support for Kevin',
        description='Child requires school fees support and uniform.',
        priority='HIGH',
        status='OPEN',
        intervention_plan='Enroll in scholarship program.'
    )
    print("✓ Created sample family, child, and case")
else:
    print("✓ Families already exist")

print("\n" + "="*50)
print("Sample data created successfully!")
print("="*50)
print("\nAdmin credentials:")
print("  Email: admin@kindra.org")
print("  Password: admin123")
print("\nYou can now:")
print("  1. Start the server: python manage.py runserver")
print("  2. Access admin panel: http://localhost:8000/admin")
print("  3. View API docs: http://localhost:8000/api/docs")
