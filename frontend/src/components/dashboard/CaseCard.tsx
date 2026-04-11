/**
 * Enhanced CaseCard Component
 * Replaces table rows with rich, visual cards showing real case data
 * Inspired by Higherlife's storytelling approach
 */

import React from 'react';
import {
  Card,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Stack,
  LinearProgress,
  Tooltip,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import {
  Edit,
  MoreVert,
  Person,
  FamilyRestroom,
  AccessTime,
  Warning,
  Schedule
} from '@mui/icons-material';
import { motion } from 'framer-motion';
// Removed colorPsychology import
const getColorByPriority = (priority: string, theme: any) => {
  switch (priority?.toUpperCase()) {
    case 'CRITICAL': return { primary: theme.palette.error.main };
    case 'HIGH': return { primary: theme.palette.warning.main };
    case 'MEDIUM': return { primary: theme.palette.info.main };
    default: return { primary: theme.palette.success.main };
  }
};

const getColorByStatus = (status: string, theme: any) => {
  switch (status?.toUpperCase()) {
    case 'RESOLVED': return { primary: theme.palette.success.main };
    case 'CLOSED': return { primary: theme.palette.text.disabled };
    case 'OPEN': return { primary: theme.palette.info.main };
    default: return { primary: theme.palette.warning.main };
  }
};

interface CaseCardProps {
  case: {
    id: string;
    case_number: string;
    child_name: string;
    family_name: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description?: string;
    created_at?: string;
    updated_at?: string;
    assigned_worker?: string;
    milestones_completed?: number;
    milestones_total?: number;
    days_pending?: number;
    next_action?: string;
    next_action_date?: string;
    child_photo?: string;
  };
  onEdit?: (caseId: string) => void;
  onAssignVolunteer?: (caseId: string) => void;
  onAllocateFunds?: (caseId: string) => void;
  onMenuClick?: (event: React.MouseEvent, caseId: string) => void;
  isOverdue?: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  case: caseData,
  onEdit,
  onAssignVolunteer,
  onAllocateFunds,
  onMenuClick,
  isOverdue = false
}) => {
  const theme = useTheme();
  const priorityColor = getColorByPriority(caseData.priority, theme);
  const statusColor = getColorByStatus(caseData.status, theme);
  const progressPercent = caseData.milestones_total 
    ? Math.round((caseData.milestones_completed || 0) / caseData.milestones_total * 100)
    : 0;

  // Determine if case needs attention
  const needsAttention = isOverdue || caseData.status === 'OPEN' || caseData.days_pending && caseData.days_pending > 14;

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
        borderColor: alpha(priorityColor.primary, 0.2),
        background: needsAttention 
          ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(priorityColor.primary, 0.04)} 100%)`
          : theme.palette.background.paper,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: priorityColor.primary,
          boxShadow: `0 8px 24px ${alpha(priorityColor.primary, 0.15)}`
        }
      }}
    >
      {/* Urgent Indicator Bar */}
      {needsAttention && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${priorityColor.primary}, ${alpha(priorityColor.primary, 0.3)})`
          }}
        />
      )}

      {/* Card Content */}
      <Box sx={{ p: 2.5 }}>
        {/* Header Row: Photo + Info + Menu */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'flex-start' }}>
          {/* Child Photo/Avatar */}
          <Tooltip title={caseData.child_name}>
            <Avatar
              src={caseData.child_photo}
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${priorityColor.primary}, ${alpha(priorityColor.primary, 0.6)})`,
                fontSize: '1.5rem',
                flexShrink: 0
              }}
            >
              {caseData.child_name?.charAt(0)}
            </Avatar>
          </Tooltip>

          {/* Main Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Case Number + Urgent Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="caption" sx={{ 
                fontWeight: 700, 
                color: 'text.secondary',
                letterSpacing: '0.5px'
              }}>
                #{caseData.case_number}
              </Typography>
              {needsAttention && (
                <Chip
                  icon={<Warning sx={{ fontSize: '0.75rem' }} />}
                  label="URGENT"
                  size="small"
                  sx={{
                    height: 20,
                    backgroundColor: alpha(theme.palette.error.main, 0.15),
                    color: theme.palette.error.main,
                    fontWeight: 700,
                    fontSize: '0.65rem'
                  }}
                />
              )}
            </Box>

            {/* Child Name */}
            <Typography variant="h6" sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.primary',
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {caseData.child_name}
            </Typography>

            {/* Family Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FamilyRestroom sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant="body2" sx={{
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {caseData.family_name}
              </Typography>
            </Box>
          </Box>

          {/* Status Chip + Menu */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip
              label={caseData.status.replace(/_/g, ' ')}
              size="small"
              sx={{
                backgroundColor: alpha(statusColor.primary, 0.15),
                color: statusColor.primary,
                fontWeight: 700,
                fontSize: '0.7rem'
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => onMenuClick?.(e, caseData.id)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <MoreVert sx={{ fontSize: '1.25rem' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Progress Section */}
        {caseData.milestones_total && caseData.milestones_total > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography variant="caption" sx={{
                fontWeight: 600,
                color: 'text.secondary'
              }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{
                fontWeight: 700,
                color: priorityColor.primary
              }}>
                {caseData.milestones_completed} of {caseData.milestones_total} milestones
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 5,
                borderRadius: 3,
                backgroundColor: alpha(priorityColor.primary, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${priorityColor.primary}, ${alpha(priorityColor.primary, 0.6)})`,
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}

        {/* Metadata Row: Days, Worker, etc */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 1.5,
          mb: 2.5,
          pb: 2.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
        }}>
          {/* Days Pending */}
          {caseData.days_pending !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Active for
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {caseData.days_pending} days
                </Typography>
              </Box>
            </Box>
          )}

          {/* Assigned Worker */}
          {caseData.assigned_worker && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Assigned to
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {caseData.assigned_worker}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Priority */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: alpha(priorityColor.primary, 0.2),
              color: priorityColor.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem'
            }}>
              {priorityColor.icon}
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Priority
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {caseData.priority}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Next Action */}
        {caseData.next_action && (
          <Box sx={{
            backgroundColor: alpha(priorityColor.primary, 0.06),
            border: `1px solid ${alpha(priorityColor.primary, 0.2)}`,
            borderRadius: 2,
            p: 1.5,
            mb: 2.5
          }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
              <Schedule sx={{ fontSize: '0.875rem', color: priorityColor.primary, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Next Action
              </Typography>
            </Box>
            <Typography variant="body2" sx={{
              color: 'text.primary',
              fontWeight: 600,
              mb: caseData.next_action_date ? 0.5 : 0
            }}>
              {caseData.next_action}
            </Typography>
            {caseData.next_action_date && (
              <Typography variant="caption" sx={{ color: priorityColor.primary, fontWeight: 700 }}>
                Due: {new Date(caseData.next_action_date).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        )}

        {/* Description */}
        {caseData.description && (
          <Typography variant="body2" sx={{
            color: 'text.secondary',
            mb: 2.5,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {caseData.description}
          </Typography>
        )}

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            '& button': {
              flex: { xs: 1, sm: 'auto' },
              fontSize: '0.75rem',
              py: 1
            }
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<Edit sx={{ fontSize: '0.875rem' }} />}
            onClick={() => onEdit?.(caseData.id)}
            sx={{
              background: `linear-gradient(135deg, ${priorityColor.primary}, ${alpha(priorityColor.primary, 0.7)})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(priorityColor.primary, 0.7)}, ${priorityColor.primary})`
              }
            }}
          >
            Update
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onAssignVolunteer?.(caseData.id)}
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            Assign
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onAllocateFunds?.(caseData.id)}
            sx={{
              borderColor: alpha(theme.palette.success.main, 0.3),
              color: theme.palette.success.main,
              '&:hover': {
                borderColor: theme.palette.success.main,
                backgroundColor: alpha(theme.palette.success.main, 0.05)
              }
            }}
          >
            Funds
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};
