"""
Case Management Views
"""

from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Family, Child, Case, Assessment, Document, CaseNote
from .serializers import (
    FamilySerializer, ChildSerializer, CaseSerializer,
    AssessmentSerializer, DocumentSerializer, CaseNoteSerializer
)
from accounts.models import AuditLog, User, Notification
from reporting.utils import log_analytics_event
from reporting.models import AnalyticsEvent
from .services import CaseExportService
from django.http import HttpResponse
import random
import string


class FamilyListCreateView(generics.ListCreateAPIView):
    """List all families or create a new family"""
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vulnerability_level', 'county', 'assigned_case_worker', 'is_active']
    search_fields = ['family_code', 'primary_contact_name', 'primary_contact_phone']
    ordering_fields = ['created_at', 'vulnerability_score', 'registration_date']
    
    def perform_create(self, serializer):
        # Generate unique family code: FAM-YYYY-XXXX (where XXXX is alphanumeric)
        from django.utils import timezone
        year = timezone.now().year
        def generate_code():
            chars = string.ascii_uppercase + string.digits
            suffix = ''.join(random.choice(chars) for _ in range(4))
            return f"FAM-{year}-{suffix}"
        
        family_code = generate_code()
        while Family.objects.filter(family_code=family_code).exists():
            family_code = generate_code()
        
        family = serializer.save(family_code=family_code, created_by=self.request.user)
        
        # Log creation
        log_analytics_event(
            event_type='FAMILY_REGISTERED',
            description=f'Registered new family: {family.family_code} ({family.primary_contact_name})',
            user=self.request.user,
            request=self.request,
            event_data={'family_id': str(family.id), 'county': family.county}
        )
        
        # Notify admins about new family registration
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title="New Family Registered",
                message=f"A new family '{family.family_code}' ({family.primary_contact_name}) has been registered.",
                type=Notification.Type.INFO,
                category=Notification.Category.CASE,
                link=f"/dashboard/cases/families/{family.id}"
            )


class FamilyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a family"""
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        code = instance.family_code
        name = instance.primary_contact_name
        instance.delete()
        log_analytics_event(
            event_type='FAMILY_DELETED',
            description=f'Administrator deleted family record: {code} ({name})',
            user=self.request.user,
            request=self.request,
            event_data={'deleted_family_code': code}
        )


class ChildListCreateView(generics.ListCreateAPIView):
    """List all children or create a new child"""
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['family', 'gender', 'legal_status', 'in_school', 'is_active']
    search_fields = ['first_name', 'last_name']
    ordering_fields = ['date_of_birth', 'created_at']


class ChildDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a child"""
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = [permissions.IsAuthenticated]


class CaseListCreateView(generics.ListCreateAPIView):
    """List all cases or create a new case"""
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'family']
    search_fields = ['case_number', 'title']
    ordering_fields = ['created_at', 'priority', 'opened_date']
    
    def perform_create(self, serializer):
        # Generate unique case number: CASE-YYYY-XXXXXX
        from django.utils import timezone
        year = timezone.now().year
        def generate_number():
            chars = string.ascii_uppercase + string.digits
            suffix = ''.join(random.choice(chars) for _ in range(6))
            return f"CASE-{year}-{suffix}"
        
        case_number = generate_number()
        while Case.objects.filter(case_number=case_number).exists():
            case_number = generate_number()
        
        case = serializer.save(case_number=case_number, created_by=self.request.user)
        
        # Log creation
        log_analytics_event(
            event_type='CASE_OPENED',
            description=f'Opened new case: {case.case_number} - {case.title}',
            user=self.request.user,
            request=self.request,
            event_data={'case_id': str(case.id), 'priority': case.priority}
        )

        # Notify assigned worker
        if case.assigned_to:
            Notification.objects.create(
                recipient=case.assigned_to,
                title="New Case Assigned",
                message=f"You have been assigned to case {case.case_number}: {case.title}",
                type=Notification.Type.INFO,
                category=Notification.Category.CASE,
                link=f"/dashboard/cases/{case.id}"
            )
        
        # Notify admins if case is urgent/high priority
        if case.priority in [Case.Priority.URGENT, Case.Priority.HIGH]:
            admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
            for admin in admins:
                Notification.objects.create(
                    recipient=admin,
                    title=f"{case.priority} Priority Case Created",
                    message=f"A {case.priority.lower()} priority case {case.case_number} has been created.",
                    type=Notification.Type.WARNING,
                    category=Notification.Category.CASE,
                    link=f"/dashboard/cases/{case.id}"
                )


class CaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a case"""
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        case_num = instance.case_number
        title = instance.title
        instance.delete()
        log_analytics_event(
            event_type='CASE_DELETED',
            description=f'Administrator deleted case record: {case_num} - {title}',
            user=self.request.user,
            request=self.request,
            event_data={'deleted_case_number': case_num}
        )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        old_assignee = self.get_object().assigned_to
        case = serializer.save()
        
        # Notify if status changed
        if old_status != case.status:
            if case.assigned_to:
                Notification.objects.create(
                    recipient=case.assigned_to,
                    title="Case Status Updated",
                    message=f"Case {case.case_number} status changed from {old_status} to {case.status}.",
                    type=Notification.Type.INFO,
                    category=Notification.Category.CASE,
                    link=f"/dashboard/cases/{case.id}"
                )
        
        # Notify if assignment changed
        if old_assignee != case.assigned_to and case.assigned_to:
            Notification.objects.create(
                recipient=case.assigned_to,
                title="Case Assigned to You",
                message=f"Case {case.case_number} has been assigned to you.",
                type=Notification.Type.INFO,
                category=Notification.Category.CASE,
                link=f"/dashboard/cases/{case.id}"
            )


class AssessmentListCreateView(generics.ListCreateAPIView):
    """List all assessments or create a new assessment"""
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['family', 'assessment_type']
    ordering_fields = ['assessment_date', 'overall_score']


class AssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an assessment"""
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentListCreateView(generics.ListCreateAPIView):
    """List all documents or upload a new document"""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['family', 'child', 'document_type']
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a document"""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]


class CaseNoteListCreateView(generics.ListCreateAPIView):
    """List all case notes or create a new note"""
    queryset = CaseNote.objects.all()
    serializer_class = CaseNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['case', 'is_milestone']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def case_statistics(request):
    """Get case management statistics"""
    stats = {
        'total_families': Family.objects.filter(is_active=True).count(),
        'total_children': Child.objects.filter(is_active=True).count(),
        'total_cases': Case.objects.count(),
        'open_cases': Case.objects.filter(status=Case.Status.OPEN).count(),
        'high_priority_cases': Case.objects.filter(priority=Case.Priority.HIGH).count(),
        'critical_families': Family.objects.filter(vulnerability_level=Family.VulnerabilityLevel.CRITICAL).count(),
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_assessment_pdf(request, pk):
    """Export assessment to PDF"""
    try:
        assessment = Assessment.objects.get(pk=pk)
        pdf_content = CaseExportService.generate_assessment_report_pdf(assessment)
        
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="assessment_{assessment.id.hex[:8]}.pdf"'
        return response
    except Assessment.DoesNotExist:
        return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_case_summary_pdf(request, pk):
    """Export case summary to PDF"""
    try:
        case = Case.objects.get(pk=pk)
        pdf_content = CaseExportService.generate_case_summary_pdf(case)
        
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="case_summary_{case.case_number}.pdf"'
        return response
    except Case.DoesNotExist:
        return Response({'error': 'Case not found'}, status=status.HTTP_404_NOT_FOUND)
