"""
Reporting & Analytics Serializers
"""

from rest_framework import serializers
from .models import Report, Dashboard, KPI, AnalyticsEvent, ComplianceReport


class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ('id', 'generated_by', 'generated_at')


class DashboardSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Dashboard
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class KPISerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = KPI
        fields = '__all__'
        read_only_fields = ('id', 'last_updated', 'created_at')


class AnalyticsEventSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = AnalyticsEvent
        fields = '__all__'
        read_only_fields = ('id', 'timestamp')


class ComplianceReportSerializer(serializers.ModelSerializer):
    prepared_by_name = serializers.CharField(source='prepared_by.get_full_name', read_only=True)
    submitted_by_name = serializers.CharField(source='submitted_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = ComplianceReport
        fields = '__all__'
        read_only_fields = (
            'id', 'submitted_by', 'submitted_at',
            'approved_by', 'approved_at', 'created_at', 'updated_at'
        )
