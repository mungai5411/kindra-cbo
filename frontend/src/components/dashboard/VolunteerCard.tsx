/**
 * Enhanced VolunteerCard Component
 * Card-based volunteer display with real data
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
  useTheme,
  AvatarGroup
} from '@mui/material';
import {
  Edit,
  MoreVert,
  AccessTime,
  TaskAlt,
  TrendingUp,
  Phone,
  Email,
  LocationOn,
  Verified
} from '@mui/icons-material';
import { motion } from 'framer-motion';
// Removed colorPsychology import
const getColorByPriority = (priority: string, theme: any) => {
  switch (priority?.toUpperCase()) {
    case 'CRITICAL': return theme.palette.error.main;
    case 'HIGH': return theme.palette.warning.main;
    case 'MEDIUM': return theme.palette.info.main;
    default: return theme.palette.success.main;
  }
};

interface VolunteerCardProps {
  volunteer: {
    id: string;
    full_name: string;
    email?: string;
    phone_number?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
    profile_picture?: string;
    hours_logged?: number;
    tasks_completed?: number;
    tasks_assigned?: number;
    availability?: string;
    specializations?: string[];
    verification_status?: 'VERIFIED' | 'PENDING' | 'REJECTED';
    last_activity?: string;
    reliability_rate?: number;
  };
  onEdit?: (volunteerId: string) => void;
  onAssignTask?: (volunteerId: string) => void;
  onContactClick?: (volunteerId: string) => void;
  onMenuClick?: (event: React.MouseEvent, volunteerId: string) => void;
}

export const VolunteerCard: React.FC<VolunteerCardProps> = ({
  volunteer,
  onEdit,
  onAssignTask,
  onContactClick,
  onMenuClick
}) => {
  const theme = useTheme();
  const programColor = {
    primary: theme.palette.primary.main,
    light: theme.palette.primary.light,
    dark: theme.palette.primary.dark
  };
  const isActive = volunteer.status === 'ACTIVE';
  const tasksCompletionRate = volunteer.tasks_assigned 
    ? Math.round(((volunteer.tasks_completed || 0) / volunteer.tasks_assigned) * 100)
    : 0;

  // Determine status color
  const statusColorMap: Record<string, string> = {
    ACTIVE: theme.palette.success.main,
    INACTIVE: theme.palette.text.disabled,
    PENDING: theme.palette.warning.main,
    SUSPENDED: theme.palette.error.main
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
        background: isActive 
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
          background: `linear-gradient(90deg, ${statusColorMap[volunteer.status]}, ${alpha(statusColorMap[volunteer.status], 0.3)})`
        }}
      />

      <Box sx={{ p: 2.5 }}>
        {/* Header: Avatar + Info + Menu */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={volunteer.profile_picture}
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${programColor.primary}, ${alpha(programColor.primary, 0.6)})`,
                fontSize: '1.5rem',
                flexShrink: 0
              }}
            >
              {volunteer.full_name?.charAt(0)}
            </Avatar>
            {volunteer.verification_status === 'VERIFIED' && (
              <Verified
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  fontSize: '1.25rem',
                  color: theme.palette.success.main,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: '50%'
                }}
              />
            )}
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.primary',
              mb: 0.5
            }}>
              {volunteer.full_name}
            </Typography>

            {/* Status Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: statusColorMap[volunteer.status]
              }} />
              <Typography variant="caption" sx={{
                fontWeight: 700,
                color: statusColorMap[volunteer.status]
              }}>
                {volunteer.status}
              </Typography>
            </Box>

            {/* Contact Info */}
            {(volunteer.email || volunteer.phone_number) && (
              <Typography variant="caption" sx={{
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {volunteer.email && <Email sx={{ fontSize: '0.75rem' }} />}
                {volunteer.email}
              </Typography>
            )}
          </Box>

          {/* Menu */}
          <IconButton
            size="small"
            onClick={(e) => onMenuClick?.(e, volunteer.id)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <MoreVert sx={{ fontSize: '1.25rem' }} />
          </IconButton>
        </Box>

        {/* Stats Row */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: 1.5,
          mb: 2.5,
          pb: 2.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
        }}>
          {/* Hours Logged */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <AccessTime sx={{ fontSize: '0.875rem', color: programColor.primary }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Hours
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {volunteer.hours_logged || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              this month
            </Typography>
          </Box>

          {/* Tasks */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <TaskAlt sx={{ fontSize: '0.875rem', color: programColor.primary }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Tasks
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {volunteer.tasks_completed || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              completed
            </Typography>
          </Box>

          {/* Reliability */}
          {volunteer.reliability_rate !== undefined && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <TrendingUp sx={{ fontSize: '0.875rem', color: programColor.primary }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Reliability
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {Math.round(volunteer.reliability_rate)}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Task Completion Progress */}
        {volunteer.tasks_assigned && volunteer.tasks_assigned > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography variant="caption" sx={{
                fontWeight: 600,
                color: 'text.secondary'
              }}>
                Task Completion
              </Typography>
              <Typography variant="caption" sx={{
                fontWeight: 700,
                color: programColor.primary
              }}>
                {tasksCompletionRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={tasksCompletionRate}
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
          </Box>
        )}

        {/* Specializations */}
        {volunteer.specializations && volunteer.specializations.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{
              fontWeight: 600,
              color: 'text.secondary',
              display: 'block',
              mb: 0.75
            }}>
              Specializations
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {volunteer.specializations.slice(0, 3).map((spec, idx) => (
                <Chip
                  key={idx}
                  label={spec}
                  size="small"
                  sx={{
                    height: 24,
                    backgroundColor: alpha(programColor.primary, 0.1),
                    color: programColor.primary,
                    fontWeight: 700,
                    fontSize: '0.65rem'
                  }}
                />
              ))}
              {volunteer.specializations.length > 3 && (
                <Typography variant="caption" sx={{
                  color: 'text.secondary',
                  alignSelf: 'center',
                  fontWeight: 600
                }}>
                  +{volunteer.specializations.length - 3}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Availability */}
        {volunteer.availability && (
          <Box sx={{
            backgroundColor: alpha(programColor.primary, 0.06),
            border: `1px solid ${alpha(programColor.primary, 0.2)}`,
            borderRadius: 2,
            p: 1.5,
            mb: 2.5
          }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Availability
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {volunteer.availability}
            </Typography>
          </Box>
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
            onClick={() => onEdit?.(volunteer.id)}
            sx={{
              background: `linear-gradient(135deg, ${programColor.primary}, ${programColor.light})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${programColor.light}, ${programColor.primary})`
              }
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onAssignTask?.(volunteer.id)}
            sx={{
              borderColor: alpha(programColor.primary, 0.3),
              color: programColor.primary,
              '&:hover': {
                borderColor: programColor.primary,
                backgroundColor: alpha(programColor.primary, 0.05)
              }
            }}
          >
            Assign Task
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};
