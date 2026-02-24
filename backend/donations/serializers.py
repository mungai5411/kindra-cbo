"""
Donation Serializers
"""

from rest_framework import serializers
from django.utils.html import strip_tags
from .models import Donor, Campaign, Donation, Receipt, SocialMediaPost, MaterialDonation, DonationImpact
from blog.models import MediaAsset
from blog.serializers import MediaAssetSerializer


class DonorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donor
        fields = '__all__'
        read_only_fields = ('id', 'total_donated', 'created_at', 'updated_at')


class CampaignSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'raised_amount', 'created_by', 'created_at', 'updated_at')


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('id', 'donation_date', 'updated_at')

    def validate_donor_name(self, value):
        value = strip_tags(value or '').strip()
        if len(value) > 200:
            raise serializers.ValidationError('Donor name is too long.')
        return value

    def validate_message(self, value):
        value = strip_tags(value or '').strip()
        if len(value) > 2000:
            raise serializers.ValidationError('Message is too long.')
        return value


class ReceiptSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donation.donor_name', read_only=True)
    donor_email = serializers.CharField(source='donation.donor_email', read_only=True)
    donor = serializers.UUIDField(source='donation.donor_id', read_only=True)
    created_at = serializers.DateTimeField(source='generated_at', read_only=True)
    
    class Meta:
        model = Receipt
        fields = '__all__'
        read_only_fields = ('id', 'generated_at')


class SocialMediaPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMediaPost
        fields = '__all__'
        read_only_fields = ('id', 'last_synced')


class MaterialDonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialDonation
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'status', 'admin_notes')

    def validate_description(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Description is required.')
        if len(value) > 2000:
            raise serializers.ValidationError('Description is too long.')
        return value

    def validate_quantity(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Quantity is required.')
        if len(value) > 100:
            raise serializers.ValidationError('Quantity is too long.')
        return value

    def validate_pickup_address(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Pickup address is required.')
        if len(value) > 2000:
            raise serializers.ValidationError('Pickup address is too long.')
        return value


class DonationImpactSerializer(serializers.ModelSerializer):
    """
    Serializer for donation impact records
    """
    shelter_name = serializers.CharField(source='shelter_home.name', read_only=True)
    media_assets = MediaAssetSerializer(many=True, source='media', read_only=True)
    media_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=MediaAsset.objects.all(), 
        write_only=True, 
        source='media',
        required=False
    )
    
    class Meta:
        model = DonationImpact
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'is_reported', 'admin_feedback')

    def validate_description(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Description is required.')
        return value
