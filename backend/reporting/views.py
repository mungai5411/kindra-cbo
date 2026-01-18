"""
Reporting & Analytics Views
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncDate
from .models import Report, Dashboard, KPI, AnalyticsEvent, ComplianceReport
from django_celery_beat.models import PeriodicTask
from django_celery_results.models import TaskResult
from .serializers import (
    ReportSerializer, DashboardSerializer, KPISerializer,
    AnalyticsEventSerializer, ComplianceReportSerializer,
    PeriodicTaskSerializer, TaskResultSerializer
)
from .services import ReportService
from accounts.permissions import IsAdminOrManagement


class DashboardDataView(APIView):
    """
    Aggregated dashboard data based on user role
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Import models for aggregation
        from case_management.models import Family, Child, Case
        from donations.models import Donation, Campaign
        from volunteers.models import Volunteer, TimeLog
        from shelter_homes.models import ShelterHome, Placement
        
        # Calculate date ranges
        now = timezone.now()
        today_date = now.date()
        
        # Aware datetimes for DateTimeField (Donation)
        month_start_dt = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start_dt = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Date objects for DateField (TimeLog)
        month_start_date = today_date.replace(day=1)
        year_start_date = today_date.replace(month=1, day=1)
        
        # Base metrics
        data = {
            'overview': {
                'total_families': Family.objects.filter(is_active=True).count(),
                'total_children': Child.objects.filter(is_active=True).count(),
                'active_cases': Case.objects.filter(status__in=['OPEN', 'IN_PROGRESS']).count(),
                'active_volunteers': Volunteer.objects.filter(status='ACTIVE').count(),
            },
            'donations': {
                'total_this_month': float(Donation.objects.filter(
                    donation_date__gte=month_start_dt,
                    status='COMPLETED'
                ).aggregate(total=Sum('amount'))['total'] or 0),
                'total_this_year': float(Donation.objects.filter(
                    donation_date__gte=year_start_dt,
                    status='COMPLETED'
                ).aggregate(total=Sum('amount'))['total'] or 0),
                'active_campaigns': Campaign.objects.filter(status='ACTIVE').count(),
                'daily_totals': {
                    str(d['date']): float(d['total'])
                    for d in Donation.objects.filter(
                        donation_date__gte=timezone.now() - timedelta(days=30),
                        status='COMPLETED'
                    ).annotate(
                        date=TruncDate('donation_date')
                    ).values('date').annotate(total=Sum('amount')).order_by('date')
                }
            },
            'volunteers': {
                'total_hours_this_month': float(TimeLog.objects.filter(
                    date__gte=month_start_date,
                    status='APPROVED'
                ).aggregate(total=Sum('hours'))['total'] or 0),
                'total_hours_this_year': float(TimeLog.objects.filter(
                    date__gte=year_start_date,
                    status='APPROVED'
                ).aggregate(total=Sum('hours'))['total'] or 0),
            },
            'shelter_homes': {
                'total_homes': ShelterHome.objects.filter(is_active=True).count(),
                'total_capacity': float(ShelterHome.objects.filter(is_active=True).aggregate(
                    total=Sum('total_capacity')
                )['total'] or 0),
                'current_occupancy': float(ShelterHome.objects.filter(is_active=True).aggregate(
                    total=Sum('current_occupancy')
                )['total'] or 0),
            },
            'campaign_progress': [
                {
                    'name': c.title,
                    'target': float(c.target_amount),
                    'raised': float(c.raised_amount),
                    'percentage': float(c.progress_percentage)
                } for c in Campaign.objects.filter(status='ACTIVE')[:5]
            ],
            'donation_methods': list(Donation.objects.filter(status='COMPLETED').values('payment_method').annotate(
                value=Sum('amount'),
                name=F('payment_method')
            ).order_by('-value'))
        }
        
        return Response(data)


class ReportListCreateView(generics.ListCreateAPIView):
    queryset = Report.objects.all().select_related('generated_by')
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['report_type', 'format', 'is_scheduled']
    ordering_fields = ['generated_at', 'start_date', 'end_date']
    ordering = ['-generated_at']
    
    def perform_create(self, serializer):
        report = serializer.save(generated_by=self.request.user)
        self.generate_report_content(report)

    def generate_report_content(self, report):
        """
        Use ReportService to generate real content based on database state
        """
        try:
            ReportService.generate_report_file(report)
        except Exception as e:
            # Service already logs and marks as FAILED
            pass


class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]


class DashboardListCreateView(generics.ListCreateAPIView):
    serializer_class = DashboardSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['dashboard_type', 'is_active', 'is_default']
    
    def get_queryset(self):
        user = self.request.user
        # Return user's own dashboards and shared dashboards
        return Dashboard.objects.filter(
            Q(owner=user) | Q(is_shared=True)
        )
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class DashboardDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DashboardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Dashboard.objects.filter(
            Q(owner=user) | Q(is_shared=True)
        )


class KPIListCreateView(generics.ListCreateAPIView):
    queryset = KPI.objects.filter(is_active=True)
    serializer_class = KPISerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['category', 'is_active']
    ordering_fields = ['category', 'name', 'last_updated']
    ordering = ['category', 'name']


class KPIDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = KPI.objects.all()
    serializer_class = KPISerializer
    permission_classes = [permissions.IsAuthenticated]


class AnalyticsEventListView(generics.ListAPIView):
    queryset = AnalyticsEvent.objects.all().select_related('user')
    serializer_class = AnalyticsEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['event_type', 'user']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']


class AnalyticsAggregationView(APIView):
    """
    Aggregated analytics data
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Aggregate events by type
        event_counts = AnalyticsEvent.objects.filter(
            timestamp__gte=start_date
        ).values('event_type').annotate(count=Count('id')).order_by('-count')
        
        # Daily event counts
        from django.db.models.functions import TruncDate
        daily_events = AnalyticsEvent.objects.filter(
            timestamp__gte=start_date
        ).annotate(
            date=TruncDate('timestamp')
        ).values('date').annotate(count=Count('id')).order_by('date')
        
        data = {
            'event_counts': list(event_counts),
            'daily_events': list(daily_events),
            'total_events': AnalyticsEvent.objects.filter(timestamp__gte=start_date).count(),
        }
        
        return Response(data)


class ComplianceReportListCreateView(generics.ListCreateAPIView):
    queryset = ComplianceReport.objects.all().select_related(
        'prepared_by', 'submitted_by', 'approved_by'
    )
    serializer_class = ComplianceReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'reporting_period']
    ordering_fields = ['period_start', 'created_at']
    ordering = ['-period_start']
    
    def perform_create(self, serializer):
        serializer.save(prepared_by=self.request.user)


class ComplianceReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ComplianceReport.objects.all()
    serializer_class = ComplianceReportSerializer
    permission_classes = [permissions.IsAuthenticated]


class ComplianceReportSubmitView(APIView):
    """
    Submit a compliance report
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            report = ComplianceReport.objects.get(pk=pk)
            
            if report.status != 'DRAFT':
                return Response(
                    {'error': 'Only draft reports can be submitted'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            report.status = 'SUBMITTED'
            report.submitted_by = request.user
            report.submitted_at = timezone.now()
            report.save()
            
            serializer = ComplianceReportSerializer(report)
            return Response(serializer.data)
        
        except ComplianceReport.DoesNotExist:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ComplianceReportApproveView(APIView):
    """
    Approve or reject a compliance report
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]
    
    def post(self, request, pk):
        try:
            report = ComplianceReport.objects.get(pk=pk)
            action = request.data.get('action')  # 'approve' or 'reject'
            
            if report.status != 'SUBMITTED':
                return Response(
                    {'error': 'Only submitted reports can be approved/rejected'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if action == 'approve':
                report.status = 'APPROVED'
                report.approved_by = request.user
                report.approved_at = timezone.now()
            elif action == 'reject':
                report.status = 'REJECTED'
                report.rejection_reason = request.data.get('reason', '')
            else:
                return Response(
                    {'error': 'Invalid action. Use "approve" or "reject"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            report.save()
            serializer = ComplianceReportSerializer(report)
            return Response(serializer.data)
        
        except ComplianceReport.DoesNotExist:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND
            )



class PeriodicTaskListView(generics.ListAPIView):
    """
    List all periodic tasks defined in Celery Beat
    """
    queryset = PeriodicTask.objects.all().order_by('name')
    serializer_class = PeriodicTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]


class TaskResultListView(generics.ListAPIView):
    """
    List recent background task execution results
    """
    queryset = TaskResult.objects.all().order_by('-date_done')
    serializer_class = TaskResultSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]
    pagination_class = None


class PublicStatsView(APIView):
    """
    Public aggregated stats for homepage
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        """
        Public aggregated stats for homepage - ensure sync with real data
        """
        # Import models inside method to avoid circular imports
        from case_management.models import Family, Child
        from volunteers.models import Volunteer
        from shelter_homes.models import ShelterHome
        from donations.models import Donor
        
        # Calculate partner organizations: Active shelters + Corporate/Org donors
        shelter_partners = ShelterHome.objects.filter(is_active=True).count()
        org_donors = Donor.objects.exclude(donor_type='INDIVIDUAL').count()
        partner_orgs_count = shelter_partners + org_donors

        data = {
            'children_supported': Child.objects.filter(is_active=True).count(),
            'families_helped': Family.objects.filter(is_active=True).count(),
            'active_volunteers': Volunteer.objects.filter(status='ACTIVE').count(),
            'partner_organizations': partner_orgs_count,
        }
        
        return Response(data)
