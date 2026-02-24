from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User, VerificationToken
from donations.models import Donor
from volunteers.models import Volunteer, Skill
from django.utils import timezone
from datetime import timedelta
import uuid

class TestPhase2Fixes(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User',
            role=User.Role.VOLUNTEER
        )

    def test_health_check_endpoint(self):
        """Verify health check returns 200"""
        url = reverse('health_check')
        print(f"DEBUG: health_check URL: {url}")
        response = self.client.get(url, follow=True)
        print(f"DEBUG: health_check status: {response.status_code}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertIn('database', response.data['checks'])

    def test_resend_verification_ratelimit(self):
        """Verify resend verification has cooldown period"""
        url = reverse('accounts:resend_verification', kwargs={'version': 'v1'})
        print(f"DEBUG: resend_verification URL: {url}")
        
        # First attempt
        response = self.client.post(url, {'email': self.user.email}, follow=True)
        print(f"DEBUG: resend_verification first attempt status: {response.status_code}")
        self.assertEqual(response.status_code, 200)
        
        # Immediate second attempt should fail (429)
        response = self.client.post(url, {'email': self.user.email}, follow=True)
        print(f"DEBUG: resend_verification second attempt status: {response.status_code}")
        self.assertEqual(response.status_code, 429)
        self.assertIn('wait', response.data['detail'].lower())

    def test_donor_pii_sync(self):
        """Verify Donor profile syncs with User model"""
        donor_user = User.objects.create_user(
            email='donor@example.com',
            password='password123',
            first_name='John',
            last_name='Doe',
            role=User.Role.DONOR
        )
        
        # Manually create donor profile
        donor = Donor.objects.create(
            user=donor_user,
            full_name='John Doe',
            email='donor@example.com',
            donor_type='INDIVIDUAL'
        )
        
        # Update User
        donor_user.first_name = 'Jane'
        donor_user.save()
        
        donor.refresh_from_db()
        self.assertEqual(donor.full_name, 'Jane Doe')

    def test_volunteer_relational_skills(self):
        """Verify volunteer skills use relational model"""
        skill = Skill.objects.create(name='Python-Test-Random')
        volunteer = self.user.volunteer_profile
        volunteer.skills_list.add(skill)
        
        self.assertEqual(volunteer.skills_list.count(), 1)
        self.assertEqual(volunteer.skills_list.first().name, 'Python-Test-Random')

    def test_api_versioning_path(self):
        """Verify API versioning with v1 prefix"""
        url = reverse('accounts:profile', kwargs={'version': 'v1'})
        print(f"DEBUG: profile URL: {url}")
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url, follow=True)
        print(f"DEBUG: profile status: {response.status_code}")
        self.assertEqual(response.status_code, 200)
