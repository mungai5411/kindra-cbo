/**
 * Enhanced DonationCard Component
 * Card-based donation/campaign display with real data
 */

import React from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  LinearProgress,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import {
  MoreVert,
  Person,
  AccessTime,
  EmojiEvents,
  AttachMoney,
  Share,
  Download
} from '@mui/icons-material';
import { motion } from 'framer-motion';
// Removed colorPsychology import
const getColorByStatus = (status: string, theme: any) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED': return { primary: theme.palette.success.main };
    case 'FAILED': return { primary: theme.palette.error.main };
    case 'CANCELLED': return { primary: theme.palette.text.disabled };
    default: return { primary: theme.palette.warning.main };
  }
};

interface DonationCardProps {
  donation: {
    id: string;
    campaign_title?: string;
    donor_name?: string;
    amount: number;
    donation_method?: 'MPESA' | 'BANK_TRANSFER' | 'CASH' | 'PAYPAL' | 'CARD';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    donation_date?: string;
    impact_description?: string;
    beneficiary_count?: number;
    fund_allocation?: string;
    transaction_id?: string;
    receipt_sent?: boolean;
  };
  campaignData?: {
    title: string;
    target_amount: number;
    current_amount: number;
    beneficiaries?: number;
    end_date?: string;
  };
  onEdit?: (donationId: string) => void;
  onSendReceipt?: (donationId: string) => void;
  onShare?: (donationId: string) => void;
  onMenuClick?: (event: React.MouseEvent, donationId: string) => void;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  campaignData,
  onSendReceipt,
  onShare,
  onMenuClick
}) => {
  const theme = useTheme();
  const programColor = {
    primary: theme.palette.primary.main,
    light: theme.palette.primary.light,
    dark: theme.palette.primary.dark
  };
  const statusColor = getColorByStatus(donation.status, theme);
  const isCompleted = donation.status === 'COMPLETED';

  // Campaign progress
  const campaignProgress = campaignData
    ? Math.round((campaignData.current_amount / campaignData.target_amount) * 100)
    : 0;

  // Donation method icons/colors
  const methodColors: Record<string, string> = {
    'MPESA': '#4CAF50',
    'BANK_TRANSFER': '#2196F3',
    'CARD': '#FF9800',
    'CASH': '#9C27B0',
    'PAYPAL': '#003087'
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(programColor.primary, 0.2),
        background: isCompleted
          ? theme.palette.background.paper
          : alpha(programColor.primary, 0.02),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: programColor.primary,
          boxShadow: `0 8px 24px ${alpha(programColor.primary, 0.15)}`
        }
      }}
    >
      {/* Status Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${statusColor.primary}, ${alpha(statusColor.primary, 0.3)})`
        }}
      />

      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            {/* Donation Amount - Hero */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
              <AttachMoney sx={{ color: programColor.primary, fontSize: '1.25rem' }} />
              <Typography variant="h5" sx={{
                fontWeight: 900,
                color: programColor.primary,
                fontSize: '1.75rem'
              }}>
                {(donation.amount / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                KES
              </Typography>
            </Box>

            {/* Campaign/Purpose */}
            <Typography variant="body2" sx={{
              color: 'text.primary',
              fontWeight: 700,
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {donation.campaign_title || campaignData?.title || 'General Donation'}
            </Typography>

            {/* Status Chip + Method */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={donation.status}
                size="small"
                sx={{
                  height: 20,
                  backgroundColor: alpha(statusColor.primary, 0.15),
                  color: statusColor.primary,
                  fontWeight: 700,
                  fontSize: '0.65rem'
                }}
              />
              {donation.donation_method && (
                <Chip
                  label={donation.donation_method.replace(/_/g, ' ')}
                  size="small"
                  sx={{
                    height: 20,
                    backgroundColor: alpha(methodColors[donation.donation_method] || programColor.primary, 0.15),
                    color: methodColors[donation.donation_method] || programColor.primary,
                    fontWeight: 700,
                    fontSize: '0.65rem'
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Menu */}
          <IconButton
            size="small"
            onClick={(e) => onMenuClick?.(e, donation.id)}
            sx={{ ml: 1 }}
          >
            <MoreVert sx={{ fontSize: '1.25rem' }} />
          </IconButton>
        </Box>

        <Box sx={{ pb: 2.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          {/* Donor Info */}
          {donation.donor_name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Person sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant="caption" sx={{
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                From {donation.donor_name}
              </Typography>
            </Box>
          )}

          {/* Date */}
          {donation.donation_date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <AccessTime sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {new Date(donation.donation_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}

          {/* Transaction ID */}
          {donation.transaction_id && (
            <Typography variant="caption" sx={{
              color: 'text.secondary',
              display: 'block',
              fontFamily: 'monospace',
              fontSize: '0.65rem'
            }}>
              Txn: {donation.transaction_id}
            </Typography>
          )}
        </Box>

        {/* Campaign Progress (if applicable) */}
        {campaignData && (
          <Box sx={{ mb: 2.5, pt: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography variant="caption" sx={{
                fontWeight: 600,
                color: 'text.secondary'
              }}>
                Campaign Progress
              </Typography>
              <Typography variant="caption" sx={{
                fontWeight: 700,
                color: programColor.primary
              }}>
                {campaignProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={campaignProgress}
              sx={{
                height: 5,
                borderRadius: 3,
                backgroundColor: alpha(programColor.primary, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${programColor.primary}, ${programColor.light})`,
                  borderRadius: 3
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                KES {(campaignData.current_amount / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                of KES {(campaignData.target_amount / 1000).toFixed(0)}K
              </Typography>
            </Box>
          </Box>
        )}

        {/* Impact */}
        {donation.impact_description && (
          <Box sx={{
            backgroundColor: alpha(programColor.primary, 0.06),
            border: `1px solid ${alpha(programColor.primary, 0.2)}`,
            borderRadius: 2,
            p: 1.5,
            mb: 2.5
          }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
              <EmojiEvents sx={{ fontSize: '0.875rem', color: programColor.primary, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Impact
              </Typography>
            </Box>
            <Typography variant="body2" sx={{
              color: 'text.primary',
              fontWeight: 600,
              lineHeight: 1.4
            }}>
              {donation.impact_description}
            </Typography>
            {donation.beneficiary_count && (
              <Typography variant="caption" sx={{ color: programColor.primary, fontWeight: 700, display: 'block', mt: 0.5 }}>
                Beneficiaries: {donation.beneficiary_count}
              </Typography>
            )}
          </Box>
        )}

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            '& button': {
              flex: 1,
              fontSize: '0.75rem',
              py: 1
            }
          }}
        >
          {isCompleted && !donation.receipt_sent && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Download sx={{ fontSize: '0.875rem' }} />}
              onClick={() => onSendReceipt?.(donation.id)}
              sx={{
                background: `linear-gradient(135deg, ${programColor.primary}, ${programColor.light})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${programColor.light}, ${programColor.primary})`
                }
              }}
            >
              Receipt
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Share sx={{ fontSize: '0.875rem' }} />}
            onClick={() => onShare?.(donation.id)}
            sx={{
              borderColor: alpha(programColor.primary, 0.3),
              color: programColor.primary,
              '&:hover': {
                borderColor: programColor.primary,
                backgroundColor: alpha(programColor.primary, 0.05)
              }
            }}
          >
            Share
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};
