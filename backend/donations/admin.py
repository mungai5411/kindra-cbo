"""
Donation Admin Configuration
"""

from django.contrib import admin
from .models import Donor, Campaign, Donation, Receipt, SocialMediaPost


@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'donor_type', 'country', 'total_donated', 'is_recurring_donor')
    list_filter = ('donor_type', 'country', 'is_recurring_donor')
    search_fields = ('full_name', 'email', 'organization_name')


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'target_amount', 'raised_amount', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'is_featured', 'start_date')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('donor_name', 'mpesa_name', 'amount', 'currency', 'payment_method', 'status', 'donation_date')
    list_filter = ('status', 'payment_method', 'donation_date')
    search_fields = ('transaction_id', 'donor_name', 'mpesa_name', 'donor_email')
    readonly_fields = ('callback_token', 'mpesa_name')
    actions = ['approve_donations', 'reject_donations']

    @admin.action(description='Approve selected donations')
    def approve_donations(self, request, queryset):
        # Only pending donations need approval. Completed ones are already finalized.
        pending = queryset.filter(status='PENDING')
        count = 0
        for donation in pending:
            from .services import DonationService
            DonationService.finalize_donation(donation)
            count += 1
            
        if count > 0:
            self.message_user(request, f'{count} pending donations were successfully approved and finalized.')
        else:
            self.message_user(request, 'No pending donations were found in the selection. M-Pesa donations are automated and don\'t require manual approval.', level='warning')

    @admin.action(description='Reject selected donations')
    def reject_donations(self, request, queryset):
        count = queryset.filter(status='PENDING').update(status='FAILED')
        self.message_user(request, f'{count} donations were rejected.')


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'donation', 'tax_year', 'generated_at')
    list_filter = ('tax_year', 'tax_deductible')
    search_fields = ('receipt_number',)


@admin.register(SocialMediaPost)
class SocialMediaPostAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'platform', 'likes_count', 'shares_count', 'reach', 'posted_at')
    list_filter = ('platform', 'posted_at')
    search_fields = ('campaign__title', 'post_id')
