"""
Donation URL Configuration
"""

from django.urls import path
from .views import (
    DonorListCreateView, DonorDetailView,
    CampaignListCreateView, CampaignDetailView,
    DonationListCreateView, DonationDetailView, ReceiptListView, ReceiptDetailView,
    MaterialDonationListCreateView, MaterialDonationDetailView,
    DonationImpactListCreateView, DonationImpactDetailView, submit_impact_summary,
    process_mpesa_payment, process_paypal_payment, process_stripe_payment,
    approve_donation, reject_donation,
    approve_material_donation, reject_material_donation,
    download_material_acknowledgment, download_receipt,
    delete_campaign_image,
)

app_name = 'donations'

urlpatterns = [
    path('donors/', DonorListCreateView.as_view(), name='donor-list'),
    path('donors/<uuid:pk>/', DonorDetailView.as_view(), name='donor-detail'),
    path('campaigns/', CampaignListCreateView.as_view(), name='campaign-list'),
    path('campaigns/<str:identifier>/', CampaignDetailView.as_view(), name='campaign-detail'),
    path('', DonationListCreateView.as_view(), name='donation-list'),
    path('<uuid:pk>/', DonationDetailView.as_view(), name='donation-detail'),
    path('receipts/', ReceiptListView.as_view(), name='receipt-list'),
    path('receipts/<uuid:pk>/', ReceiptDetailView.as_view(), name='receipt-detail'),
    path('receipts/<uuid:pk>/download/', download_receipt, name='receipt-download'),
    
    path('material-donations/', MaterialDonationListCreateView.as_view(), name='material-donation-list'),
    path('material-donations/<uuid:pk>/', MaterialDonationDetailView.as_view(), name='material-donation-detail'),
    path('material-donations/<uuid:pk>/acknowledgment/', download_material_acknowledgment, name='material-acknowledgment'),
    
    # Donation Impact tracking
    path('impact/', DonationImpactListCreateView.as_view(), name='impact-list'),
    path('impact/<uuid:pk>/', DonationImpactDetailView.as_view(), name='impact-detail'),
    path('impact/submit-summary/', submit_impact_summary, name='impact-submit-summary'),
    
    # Payment processing endpoints
    path('payments/mpesa/', process_mpesa_payment, name='mpesa-payment'),
    path('payments/paypal/', process_paypal_payment, name='paypal-payment'),
    path('payments/stripe/', process_stripe_payment, name='stripe-payment'),
    
    # Admin approval endpoints (secured)
    path('<uuid:pk>/approve/', approve_donation, name='donation-approve'),
    path('<uuid:pk>/reject/', reject_donation, name='donation-reject'),
    path('material-donations/<uuid:pk>/approve/', approve_material_donation, name='material-approve'),
    path('material-donations/<uuid:pk>/reject/', reject_material_donation, name='material-reject'),
    
    # Image Management
    path('campaigns/<uuid:pk>/image/', delete_campaign_image, name='delete-campaign-image'),
]
