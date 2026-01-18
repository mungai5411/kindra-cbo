"""
Reporting Services
Business logic for generating system reports (PDF/Excel/CSV)
"""

import io
import csv
import logging
from django.utils import timezone
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill

logger = logging.getLogger('kindra_cbo')

class ReportService:
    """
    Service class for generating various system reports
    """

    @staticmethod
    def generate_report_file(report):
        """
        Main entry point to generate the physical file for a report object
        """
        try:
            if report.format == 'PDF':
                ReportService._generate_pdf(report)
            elif report.format == 'EXCEL':
                ReportService._generate_excel(report)
            else:
                # Default to CSV if not PDF/Excel
                ReportService._generate_csv(report)
            
            report.status = 'COMPLETED'
            report.save()
            logger.info(f"Successfully generated {report.format} for report {report.id}")
        except Exception as e:
            logger.error(f"Error generating report {report.id}: {str(e)}")
            report.status = 'FAILED'
            report.save()
            raise

    @staticmethod
    def _generate_csv(report):
        from donations.models import Donation
        from volunteers.models import Volunteer
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        if report.report_type == 'DONATION':
            writer.writerow(['Date', 'Donor', 'Amount', 'Currency', 'Method', 'Campaign', 'Status'])
            # Filtering by date range if provided
            qs = Donation.objects.all()
            if report.start_date: qs = qs.filter(donation_date__gte=report.start_date)
            if report.end_date: qs = qs.filter(donation_date__lte=report.end_date)
            
            for d in qs:
                writer.writerow([
                    d.donation_date.strftime('%Y-%m-%d %H:%M'),
                    d.donor_name or str(d.donor or "Anonymous"),
                    d.amount,
                    d.currency,
                    d.payment_method,
                    d.campaign.title if d.campaign else 'General Fund',
                    d.status
                ])
        elif report.report_type == 'VOLUNTEER':
            writer.writerow(['Name', 'Email', 'Phone', 'Role', 'Status', 'Total Hours', 'Join Date'])
            qs = Volunteer.objects.all()
            for v in qs:
                writer.writerow([
                    v.full_name, v.email, v.phone_number, 'VOLUNTEER', 
                    v.status, v.total_hours, v.created_at.strftime('%Y-%m-%d')
                ])
        
        content = output.getvalue()
        filename = f"report_{report.report_type.lower()}_{report.id.hex[:8]}.csv"
        report.file.save(filename, ContentFile(content.encode('utf-8')))

    @staticmethod
    def _generate_excel(report):
        from donations.models import Donation
        from volunteers.models import Volunteer

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"{report.report_type} Report"

        # Styles
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="519755", end_color="519755", fill_type="solid")
        center_align = Alignment(horizontal="center")

        if report.report_type == 'DONATION':
            headers = ['Date', 'Donor', 'Amount', 'Currency', 'Method', 'Campaign', 'Status']
            ws.append(headers)
            
            qs = Donation.objects.all()
            if report.start_date: qs = qs.filter(donation_date__gte=report.start_date)
            if report.end_date: qs = qs.filter(donation_date__lte=report.end_date)

            for d in qs:
                ws.append([
                    d.donation_date.replace(tzinfo=None), # Excel doesn't like tz-aware
                    d.donor_name or str(d.donor or "Anonymous"),
                    float(d.amount),
                    d.currency,
                    d.payment_method,
                    d.campaign.title if d.campaign else 'General Fund',
                    d.status
                ])
        elif report.report_type == 'VOLUNTEER':
            headers = ['Name', 'Email', 'Phone', 'Status', 'Total Hours', 'Join Date']
            ws.append(headers)
            qs = Volunteer.objects.all()
            for v in qs:
                ws.append([
                    v.full_name, v.email, v.phone_number, v.status, 
                    float(v.total_hours), v.created_at.replace(tzinfo=None)
                ])

        # Style headers
        for cell in ws[1]:
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center_align

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        filename = f"report_{report.report_type.lower()}_{report.id.hex[:8]}.xlsx"
        report.file.save(filename, ContentFile(buffer.read()))

    @staticmethod
    def _generate_pdf(report):
        from donations.models import Donation
        from volunteers.models import Volunteer

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elements = []
        styles = getSampleStyleSheet()

        # Title
        title = f"Kindra CBO - {report.report_type} REPORT"
        elements.append(Paragraph(title, styles['Title']))
        elements.append(Spacer(1, 0.2 * inch))

        # Meta info
        meta_text = f"Generated: {timezone.now().strftime('%d %b %Y %H:%M')} | Range: {report.start_date or 'Life'} to {report.end_date or 'Present'}"
        elements.append(Paragraph(meta_text, styles['Normal']))
        elements.append(Spacer(1, 0.3 * inch))

        data = []
        if report.report_type == 'DONATION':
            data.append(['Date', 'Donor', 'Amount', 'Method', 'Campaign', 'Status'])
            qs = Donation.objects.all()
            if report.start_date: qs = qs.filter(donation_date__gte=report.start_date)
            if report.end_date: qs = qs.filter(donation_date__lte=report.end_date)

            for d in qs[:500]: # Limit PDF for performance
                data.append([
                    d.donation_date.strftime('%Y-%m-%d'),
                    (d.donor_name or str(d.donor or "Anon"))[:20],
                    f"{d.amount:,.2f}",
                    d.payment_method,
                    (d.campaign.title if d.campaign else 'General')[:20],
                    d.status
                ])
        elif report.report_type == 'VOLUNTEER':
            data.append(['Name', 'Email', 'Role', 'Status', 'Hours'])
            qs = Volunteer.objects.all()
            for v in qs[:500]:
                data.append([
                    v.full_name[:25], v.email[:25], 'VOLUNTEER', v.status, str(v.total_hours)
                ])

        # Table Styling
        if data:
            t = Table(data, hAlign='LEFT')
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#519755")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
            ]))
            elements.append(t)

        doc.build(elements)
        buffer.seek(0)
        filename = f"report_{report.report_type.lower()}_{report.id.hex[:8]}.pdf"
        report.file.save(filename, ContentFile(buffer.read()))
