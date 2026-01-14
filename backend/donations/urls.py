"""
Donation URL Configuration
"""

from django.urls import path
from .views import (
    DonorListCreateView, DonorDetailView,
    CampaignListCreateView, CampaignDetailView,
    DonationListCreateView, DonationDetailView, ReceiptListView,
    MaterialDonationListCreateView, MaterialDonationDetailView,
    process_mpesa_payment, process_paypal_payment, process_stripe_payment,
    approve_donation, reject_donation,
    approve_material_donation, reject_material_donation,
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
    
    path('material-donations/', MaterialDonationListCreateView.as_view(), name='material-donation-list'),
    path('material-donations/<uuid:pk>/', MaterialDonationDetailView.as_view(), name='material-donation-detail'),
    
    # Payment processing endpoints
    path('payments/mpesa/', process_mpesa_payment, name='mpesa-payment'),
    path('payments/paypal/', process_paypal_payment, name='paypal-payment'),
    path('payments/stripe/', process_stripe_payment, name='stripe-payment'),
    
    # Admin approval endpoints (secured)
    path('<uuid:pk>/approve/', approve_donation, name='donation-approve'),
    path('<uuid:pk>/reject/', reject_donation, name='donation-reject'),
    path('material-donations/<uuid:pk>/approve/', approve_material_donation, name='material-approve'),
    path('material-donations/<uuid:pk>/reject/', reject_material_donation, name='material-reject'),
]
