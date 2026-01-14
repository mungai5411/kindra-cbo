"""
Sample Data Fixtures for Kindra CBO
Run with: python manage.py loaddata sample_data.json
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from blog.models import Category, Tag, BlogPost
from donations.models import Campaign, Donor, Donation
from volunteers.models import Volunteer
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates sample data for demonstration'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')

        # Create admin user if not exists
        if not User.objects.filter(email='admin@kindra.org').exists():
            admin = User.objects.create_superuser(
                email='admin@kindra.org',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user'))
        else:
            admin = User.objects.get(email='admin@kindra.org')

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
        
        self.stdout.write(self.style.SUCCESS('Created blog categories'))

        # Create tags
        tags_data = ['children', 'education', 'health', 'community', 'fundraising']
        for tag_name in tags_data:
            Tag.objects.get_or_create(
                name=tag_name,
                defaults={'slug': tag_name.lower()}
            )
        
        self.stdout.write(self.style.SUCCESS('Created tags'))

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

The impact has been tremendous. Parents report improved confidence in their children, and teachers note excellent academic progress. This is just the beginning of our mission to ensure every child has access to quality education.''',
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

We partnered with local healthcare providers to ensure quality care. The response from the community has been overwhelming, with families expressing gratitude for accessible healthcare.''',
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

The evening will feature:
- Dinner and entertainment
- Silent auction
- Inspiring success stories
- Keynote speech by our founder

All proceeds will go directly to our education and health programs. Tickets are available now!''',
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
                # Add tags
                education_tag = Tag.objects.get(name='education')
                children_tag = Tag.objects.get(name='children')
                post.tags.add(education_tag, children_tag)
        
        self.stdout.write(self.style.SUCCESS('Created blog posts'))

        # Create donation campaigns
        campaigns_data = [
            {
                'title': 'Education Support Program 2025',
                'slug': 'education-support-2025',
                'description': 'Help us provide quality education to 100 vulnerable children',
                'goal_amount': 1000000,
                'currency': 'KES',
                'start_date': timezone.now().date(),
                'end_date': (timezone.now() + timedelta(days=90)).date(),
                'status': 'ACTIVE',
            },
            {
                'title': 'Nutrition Program',
                'slug': 'nutrition-program',
                'description': 'Ensure children have access to nutritious meals every day',
                'goal_amount': 500000,
                'currency': 'KES',
                'start_date': timezone.now().date(),
                'end_date': (timezone.now() + timedelta(days=60)).date(),
                'status': 'ACTIVE',
            },
            {
                'title': 'Shelter Home Support',
                'slug': 'shelter-home-support',
                'description': 'Support our partner shelter homes with essential supplies',
                'goal_amount': 750000,
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
        
        self.stdout.write(self.style.SUCCESS('Created donation campaigns'))

        # Create sample donors and donations
        donors_data = [
            {'first_name': 'John', 'last_name': 'Doe', 'email': 'john.doe@example.com', 'phone': '+254712345678'},
            {'first_name': 'Jane', 'last_name': 'Smith', 'email': 'jane.smith@example.com', 'phone': '+254723456789'},
            {'first_name': 'Michael', 'last_name': 'Johnson', 'email': 'michael.j@example.com', 'phone': '+254734567890'},
        ]

        for donor_data in donors_data:
            donor, created = Donor.objects.get_or_create(
                email=donor_data['email'],
                defaults=donor_data
            )
            
            if created:
                # Create donations for each donor
                campaign = Campaign.objects.get(slug='education-support-2025')
                Donation.objects.create(
                    donor=donor,
                    campaign=campaign,
                    amount=10000 + (Donor.objects.count() * 5000),
                    currency='KES',
                    payment_method='MPESA',
                    status='COMPLETED',
                    transaction_id=f'MPESA{timezone.now().timestamp()}'
                )
        
        self.stdout.write(self.style.SUCCESS('Created donors and donations'))

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write(self.style.WARNING('Admin credentials: admin@kindra.org / admin123'))
