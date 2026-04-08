/**
 * Summary Header Component
 * High-level statistics for each view (Cases, Volunteers, Donations)
 * Inspired by Higherlife's impact metrics display
 */

import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  alpha,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { colorPsychology } from '../../theme/colorPsychology';

interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  benchmark?: string;
  isGood?: boolean;
  isBad?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface SummaryHeaderProps {
  title: string;
  metrics: MetricProps[];
  color?: string;
}

const MetricItem: React.FC<MetricProps> = ({
  label,
  value,
  unit,
  benchmark,
  isGood,
  isBad,
  tooltip,
  icon,
  color
}) => {
  const displayColor = color || colorPsychology.programs.cases.primary;
  const bgColor = isGood ? colorPsychology.status.success.background :
                  isBad ? colorPsychology.status.critical.background :
                  alpha(displayColor, 0.06);

  const content = (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        background: bgColor,
        border: `1px solid ${alpha(displayColor, 0.15)}`,
        borderRadius: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `1px solid ${alpha(displayColor, 0.3)}`
        }
      }}
    >
      {/* Icon + Label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {icon && (
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: alpha(displayColor, 0.15),
            color: displayColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {icon}
          </Box>
        )}
        <Typography variant="caption" sx={{
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {label}
        </Typography>
      </Box>

      {/* Main Value */}
      <Box sx={{ mb: benchmark ? 1 : 0 }}>
        <Typography variant="h5" sx={{
          fontWeight: 900,
          color: 'text.primary',
          fontSize: '1.75rem',
          lineHeight: 1
        }}>
          {value}
          {unit && (
            <Typography component="span" sx={{
              fontSize: '0.6em',
              fontWeight: 700,
              color: 'text.secondary',
              ml: 0.5
            }}>
              {unit}
            </Typography>
          )}
        </Typography>
      </Box>

      {/* Benchmark / Additional Info */}
      {benchmark && (
        <Typography variant="caption" sx={{
          color: 'text.secondary',
          fontWeight: 600
        }}>
          {benchmark}
        </Typography>
      )}
    </Paper>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow>
      <div>{content}</div>
    </Tooltip>
  ) : content;
};

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  title,
  metrics,
  color
}) => {
  const displayColor = color || colorPsychology.programs.cases.primary;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Typography variant="h6" sx={{
        fontWeight: 800,
        mb: 2,
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Box sx={{
          width: 4,
          height: 24,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${displayColor}, ${alpha(displayColor, 0.4)})`
        }} />
        {title}
      </Typography>

      {/* Metrics Grid */}
      <Grid container spacing={2}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={`${metric.label}-${index}`}>
            <MetricItem {...metric} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
