"""
Kindra CBO — Core Test Suite
Covers critical paths: auth, donation permissions, double-finalization guard,
VerificationToken expiry, and MaterialDonation status.
Run with: python manage.py test tests
"""

from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase, RequestFactory
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User, Notification, VerificationToken
from accounts.utils import get_client_ip
from donations.models import Campaign, Donation, Receipt, MaterialDonation
from donations.services import DonationService


# ─────────────────────────────────────────────
# Account / Auth Tests
# ─────────────────────────────────────────────

class GetClientIpTest(TestCase):
    """Test shared get_client_ip utility."""

    def setUp(self):
        self.factory = RequestFactory()

    def test_returns_remote_addr_when_no_proxy(self):
        req = self.factory.get('/')
        req.META['REMOTE_ADDR'] = '1.2.3.4'
        self.assertEqual(get_client_ip(req), '1.2.3.4')

    def test_returns_first_ip_from_x_forwarded_for(self):
        req = self.factory.get('/')
        req.META['HTTP_X_FORWARDED_FOR'] = '10.0.0.1, 192.168.1.1'
        self.assertEqual(get_client_ip(req), '10.0.0.1')


class VerificationTokenExpiryTest(TestCase):
    """Verify that token expiry is differentiated by type."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='Str0ng!Pass',
            first_name='Test',
            last_name='User',
        )

    def test_verification_token_expires_in_24h(self):
        token = VerificationToken.objects.create(
            user=self.user,
            token_type=VerificationToken.TokenType.VERIFICATION,
        )
        expected = timezone.now() + timedelta(hours=24)
        diff = abs((token.expires_at - expected).total_seconds())
        self.assertLess(diff, 5, "Verification token should expire in ~24 hours")

    def test_password_reset_token_expires_in_1h(self):
        token = VerificationToken.objects.create(
            user=self.user,
            token_type=VerificationToken.TokenType.PASSWORD_RESET,
        )
        expected = timezone.now() + timedelta(hours=1)
        diff = abs((token.expires_at - expected).total_seconds())
        self.assertLess(diff, 5, "Password reset token should expire in ~1 hour")


# ─────────────────────────────────────────────
# Donation Permission Tests
# ─────────────────────────────────────────────

class DonationPermissionTest(TestCase):
    """Ensure anonymous users cannot access donation endpoints."""

    def setUp(self):
        self.client = APIClient()

    def test_anonymous_cannot_list_donations(self):
        response = self.client.get('/api/v1/donations/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_anonymous_cannot_retrieve_donation(self):
        import uuid
        fake_id = str(uuid.uuid4())
        response = self.client.get(f'/api/v1/donations/{fake_id}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DonationOwnershipTest(TestCase):
    """Donors can only see their own donations."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='Str0ng!Pass',
            role=User.Role.ADMIN,
        )
        self.donor_user = User.objects.create_user(
            email='donor@example.com',
            password='Str0ng!Pass',
            role=User.Role.DONOR,
        )

    def test_admin_can_list_all_donations(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/donations/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT])

    def test_donor_sees_empty_list_without_profile(self):
        self.client.force_authenticate(user=self.donor_user)
        response = self.client.get('/api/v1/donations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count', 0), 0)


# ─────────────────────────────────────────────
# DonationService Tests
# ─────────────────────────────────────────────

class DonationFinalizeTest(TestCase):
    """Test DonationService.finalize_donation idempotency guard."""

    def setUp(self):
        self.campaign = Campaign.objects.create(
            title='Test Campaign',
            description='Test',
            target_amount=Decimal('10000.00'),
            raised_amount=Decimal('0.00'),
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30),
        )
        self.donation = Donation.objects.create(
            campaign=self.campaign,
            amount=Decimal('500.00'),
            payment_method=Donation.PaymentMethod.MPESA,
            status=Donation.Status.PENDING,
        )

    @patch('donations.services.ReceiptService.generate_pdf_receipt', return_value=None)
    @patch('donations.services.NotificationService.notify_donation_completed')
    def test_finalize_increments_campaign_once(self, mock_notify, mock_pdf):
        """Calling finalize_donation on a PENDING donation should update raised_amount once."""
        DonationService.finalize_donation(self.donation)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.raised_amount, Decimal('500.00'))

    @patch('donations.services.ReceiptService.generate_pdf_receipt', return_value=None)
    @patch('donations.services.NotificationService.notify_donation_completed')
    def test_double_finalize_does_not_double_count(self, mock_notify, mock_pdf):
        """Calling finalize_donation twice must NOT double the raised_amount."""
        DonationService.finalize_donation(self.donation)
        self.donation.refresh_from_db()
        DonationService.finalize_donation(self.donation)  # second call — should be no-op
        self.campaign.refresh_from_db()
        self.assertEqual(
            self.campaign.raised_amount, Decimal('500.00'),
            "raised_amount must not be doubled when finalize_donation is called twice"
        )


# ─────────────────────────────────────────────
# MaterialDonation Status Tests
# ─────────────────────────────────────────────

class MaterialDonationStatusTest(TestCase):
    """MaterialDonation.Status.REJECTED must exist and be a valid choice."""

    def test_rejected_status_exists(self):
        choices = [c[0] for c in MaterialDonation.Status.choices]
        self.assertIn('REJECTED', choices, "REJECTED must be a valid MaterialDonation status")

    def test_can_set_rejected_status(self):
        mat = MaterialDonation(
            category=MaterialDonation.Category.CLOTHING,
            description='Old clothes',
            quantity=5,
            status=MaterialDonation.Status.REJECTED,
        )
        self.assertEqual(mat.status, 'REJECTED')


# ─────────────────────────────────────────────
# Campaign.recalculate_raised_amount Tests
# ─────────────────────────────────────────────

class CampaignRecalculateTest(TestCase):
    """recalculate_raised_amount must derive total from completed donations."""

    def setUp(self):
        self.campaign = Campaign.objects.create(
            title='Recalc Campaign',
            description='Test',
            target_amount=Decimal('10000.00'),
            raised_amount=Decimal('999.00'),  # stale value
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30),
        )

    @patch('donations.services.ReceiptService.generate_pdf_receipt', return_value=None)
    @patch('donations.services.NotificationService.notify_donation_completed')
    def test_recalculate_corrects_stale_amount(self, mock_notify, mock_pdf):
        # Create two completed donations
        Donation.objects.create(
            campaign=self.campaign,
            amount=Decimal('200.00'),
            status=Donation.Status.COMPLETED,
            payment_method=Donation.PaymentMethod.MPESA,
        )
        Donation.objects.create(
            campaign=self.campaign,
            amount=Decimal('300.00'),
            status=Donation.Status.COMPLETED,
            payment_method=Donation.PaymentMethod.MPESA,
        )
        result = self.campaign.recalculate_raised_amount()
        self.assertEqual(result, Decimal('500.00'))
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.raised_amount, Decimal('500.00'))

    def test_recalculate_ignores_pending_donations(self):
        Donation.objects.create(
            campaign=self.campaign,
            amount=Decimal('1000.00'),
            status=Donation.Status.PENDING,
            payment_method=Donation.PaymentMethod.MPESA,
        )
        result = self.campaign.recalculate_raised_amount()
        self.assertEqual(result, Decimal('0.00'))
