"""
Reporting & Analytics URL Configuration
"""

from django.urls import path
from .views import (
    DashboardDataView, PublicStatsView, ReportListCreateView, ReportDetailView,
    DashboardListCreateView, DashboardDetailView,
    KPIListCreateView, KPIDetailView,
    AnalyticsEventListView, AnalyticsAggregationView,
    ComplianceReportListCreateView, ComplianceReportDetailView,
    ComplianceReportSubmitView, ComplianceReportApproveView,
    PeriodicTaskListView, TaskResultListView,
)

app_name = 'reporting'

urlpatterns = [
    # Dashboard
    path('dashboard/', DashboardDataView.as_view(), name='dashboard-data'),
    path('public-stats/', PublicStatsView.as_view(), name='public-stats'),
    path('dashboards/', DashboardListCreateView.as_view(), name='dashboard-list'),
    path('dashboards/<uuid:pk>/', DashboardDetailView.as_view(), name='dashboard-detail'),
    
    # Reports
    path('reports/', ReportListCreateView.as_view(), name='report-list'),
    path('reports/<uuid:pk>/', ReportDetailView.as_view(), name='report-detail'),
    
    # KPIs
    path('kpis/', KPIListCreateView.as_view(), name='kpi-list'),
    path('kpis/<uuid:pk>/', KPIDetailView.as_view(), name='kpi-detail'),
    
    # Analytics
    path('analytics/events/', AnalyticsEventListView.as_view(), name='analytics-events'),
    path('analytics/aggregation/', AnalyticsAggregationView.as_view(), name='analytics-aggregation'),
    
    # Compliance
    path('compliance/', ComplianceReportListCreateView.as_view(), name='compliance-list'),
    path('compliance/<uuid:pk>/', ComplianceReportDetailView.as_view(), name='compliance-detail'),
    path('compliance/<uuid:pk>/submit/', ComplianceReportSubmitView.as_view(), name='compliance-submit'),
    path('compliance/<uuid:pk>/approve/', ComplianceReportApproveView.as_view(), name='compliance-approve'),
    
    # Celery Tasks
    path('celery/tasks/', PeriodicTaskListView.as_view(), name='celery-task-list'),
    path('celery/results/', TaskResultListView.as_view(), name='celery-task-results'),
]
