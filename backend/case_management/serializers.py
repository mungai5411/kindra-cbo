"""
Case Management Serializers
"""

from rest_framework import serializers
from .models import Family, Child, Case, Assessment, Document, CaseNote


class ChildSerializer(serializers.ModelSerializer):
    """Serializer for Child model"""
    age = serializers.ReadOnlyField()
    family_name = serializers.CharField(source='family.primary_contact_name', read_only=True)
    
    class Meta:
        model = Child
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class FamilySerializer(serializers.ModelSerializer):
    """Serializer for Family model"""
    children = ChildSerializer(many=True, read_only=True)
    assigned_case_worker_name = serializers.CharField(source='assigned_case_worker.get_full_name', read_only=True)
    
    class Meta:
        model = Family
        fields = '__all__'
        read_only_fields = ('id', 'family_code', 'registration_date', 'created_at', 'updated_at')


class CaseNoteSerializer(serializers.ModelSerializer):
    """Serializer for Case Notes"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = CaseNote
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class CaseSerializer(serializers.ModelSerializer):
    """Serializer for Case model"""
    notes = CaseNoteSerializer(many=True, read_only=True)
    family_name = serializers.CharField(source='family.primary_contact_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Case
        fields = '__all__'
        read_only_fields = ('id', 'case_number', 'opened_date', 'created_at', 'updated_at')


class AssessmentSerializer(serializers.ModelSerializer):
    """Serializer for Assessment model"""
    conducted_by_name = serializers.CharField(source='conducted_by.get_full_name', read_only=True)
    family_name = serializers.CharField(source='family.primary_contact_name', read_only=True)
    
    class Meta:
        model = Assessment
        fields = '__all__'
        read_only_fields = ('id', 'overall_score', 'created_at', 'updated_at')


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_at')
