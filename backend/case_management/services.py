"""
Case Management Export Services
Logic for generating PDF summaries of assessments and cases
"""

import io
import logging
from django.utils import timezone
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

logger = logging.getLogger('kindra_cbo')

class CaseExportService:
    """
    Service class for exporting case management data
    """

    @staticmethod
    def generate_assessment_report_pdf(assessment):
        """
        Generate a formal PDF report of a family/child assessment
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Header
        elements.append(Paragraph("KINDRA CBO - ASSESSMENT REPORT", styles['Title']))
        elements.append(Spacer(1, 0.2 * inch))

        # Basic Info
        info_data = [
            ["Assessment ID", str(assessment.id)[:8]],
            ["Date", assessment.assessment_date.strftime('%d %b %Y')],
            ["Type", assessment.assessment_type],
            ["Target", assessment.family.primary_contact_name if assessment.family else "N/A"],
            ["Overall Score", str(assessment.overall_score)]
        ]
        
        t = Table(info_data, colWidths=[1.5*inch, 4*inch])
        t.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.3 * inch))

        # Findings / Notes
        elements.append(Paragraph("Assessment Findings", styles['Heading2']))
        elements.append(Paragraph(assessment.notes or "No notes provided.", styles['Normal']))
        elements.append(Spacer(1, 0.3 * inch))

        # Recommendation
        elements.append(Paragraph("Recommendations", styles['Heading2']))
        elements.append(Paragraph(assessment.recommendations or "No specific recommendations provided.", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        return buffer.read()

    @staticmethod
    def generate_case_summary_pdf(case):
        """
        Generate a structured PDF summary of a case
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Header
        elements.append(Paragraph(f"CASE SUMMARY: {case.case_number}", styles['Title']))
        elements.append(Paragraph(case.title, styles['Heading2']))
        elements.append(Spacer(1, 0.2 * inch))

        # Status Info
        data = [
            ["Status", case.status],
            ["Priority", case.priority],
            ["Opened Date", case.opened_date.strftime('%d %b %Y')],
            ["Family", case.family.primary_contact_name if case.family else "N/A"],
            ["Assigned To", case.assigned_to.get_full_name() if case.assigned_to else "Unassigned"]
        ]
        t = Table(data, colWidths=[1.5*inch, 4*inch])
        t.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.4 * inch))

        # Description
        elements.append(Paragraph("Case Description", styles['Heading3']))
        elements.append(Paragraph(case.description or "N/A", styles['Normal']))
        elements.append(Spacer(1, 0.4 * inch))

        # Milestones / Notes
        elements.append(Paragraph("Recent Milestones & Notes", styles['Heading3']))
        notes = case.notes.all().order_by('-created_at')[:10]
        if notes:
            for note in notes:
                text = f"<b>{note.created_at.strftime('%Y-%m-%d')}</b>: {note.content}"
                if note.is_milestone:
                    text = f"[MILESTONE] {text}"
                elements.append(Paragraph(text, styles['Normal']))
                elements.append(Spacer(1, 0.1 * inch))
        else:
            elements.append(Paragraph("No notes or milestones recorded.", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        return buffer.read()
