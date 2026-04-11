/**
 * FAQ Section Component
 * Address common questions with smooth accordion
 * Mobile-friendly design
 */

import React, { useState } from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, alpha, useTheme } from '@mui/material';
import { ExpandMore, HelpOutline } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionAccordion = motion(Accordion);

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How can I donate financial assistance?',
    answer: 'You can donate through our platform using M-Pesa, bank transfer, or international payment methods. All donations are secure and go directly to our programs. You\'ll receive a receipt and can track your impact in real-time through your donor dashboard.'
  },
  {
    question: 'Is my donation tax-deductible?',
    answer: 'Yes! Kindra CBO is a registered NGO. Your donation is tax-deductible. We provide official receipts and annual impact reports for all donors. Contact our finance team for tax documentation.'
  },
  {
    question: 'How do I become a volunteer?',
    answer: 'Visit our Volunteers page and fill out the application form. We\'ll review your profile and contact you within 5-7 business days. After approval, you can join teams, participate in activities, and make real impact in your community.'
  },
  {
    question: 'Can I donate material items?',
    answer: 'Absolutely! We accept donations of clothes, books, school supplies, and more. Log in to your donor account, navigate to "Donate Materials," and describe what you\'d like to donate. Our team will coordinate pickup or arrange a drop-off point.'
  },
  {
    question: 'How can organizations partner with Kindra?',
    answer: 'We\'re always looking for partnerships! Organizations can partner through sponsorship programs, program implementation, or strategic collaborations. Contact our partnerships team at partners@kindra.org to discuss opportunities.'
  },
  {
    question: 'Can I track the impact of my donation?',
    answer: 'Yes! We maintain full transparency. Donors can track impact through their dashboard, seeing real-time data on cases supported, children assisted, and outcomes achieved. We also provide detailed quarterly impact reports.'
  }
];

interface FAQItemComponentProps {
  faq: FAQItem;
  index: number;
  expanded: string | false;
  onChange: (panel: string) => void;
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({ faq, index, expanded, onChange }) => {
  const theme = useTheme();
  const panelId = `panel-${index}`;

  return (
    <MotionAccordion
      expanded={expanded === panelId}
      onChange={() => onChange(panelId)}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      elevation={0}
      sx={{
        background: expanded === panelId
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.05)})`
          : 'transparent',
        border: `1px solid ${alpha(theme.palette.primary.main, expanded === panelId ? 0.3 : 0.15)}`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:before': {
          display: 'none'
        },
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2)
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}
        sx={{
          p: { xs: 2, md: 2.5 },
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }
        }}
      >
        <HelpOutline sx={{ mr: 2, color: 'primary.main', flexShrink: 0 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {faq.question}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 2, md: 2.5 }, backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
          {faq.answer}
        </Typography>
      </AccordionDetails>
    </MotionAccordion>
  );
};

export const FAQSection: React.FC = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>('panel-0');

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              mb: 1
            }}
          >
            Questions?
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.8rem' }
            }}
          >
            Frequently Asked <Box component="span" sx={{ color: 'primary.main' }}>Questions</Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.7
            }}
          >
            Find answers to common questions about our programs, donations, and volunteering.
          </Typography>
        </Box>

        {/* FAQ Items */}
        <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
          {FAQS.map((faq, index) => (
            <FAQItemComponent
              key={index}
              faq={faq}
              index={index}
              expanded={expanded}
              onChange={setExpanded}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};
