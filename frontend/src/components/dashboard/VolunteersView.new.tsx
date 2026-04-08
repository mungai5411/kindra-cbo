/**
 * Modern VolunteersView Component
 * Redesigned with card-based layout, color psychology, and mobile-first responsive design
 */

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Container, Grid, alpha } from '@mui/material';
import { RootState, AppDispatch } from '../../store';
import { fetchVolunteers } from '../../features/volunteers/volunteersSlice';
import { SummaryHeader } from './SummaryHeader';
import { VolunteerCard } from './VolunteerCard';
import { VolunteerFilterBar } from './VolunteerFilterBar';
import { colorPsychology } from '../../theme/colorPsychology';
import { motion } from 'framer-motion';

const MotionGrid = motion(Grid);

interface VolunteersViewProps {
  setOpenDialog?: (open: boolean) => void;
}

export const VolunteersView: React.FC<VolunteersViewProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const volunteersState = useSelector((state: RootState) => state.volunteers);
  const volunteers = Array.isArray(volunteersState) ? volunteersState : (volunteersState as any) || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  // Fetch volunteers on mount
  useEffect(() => {
    dispatch(fetchVolunteers());
  }, [dispatch]);

  // Filter volunteers based on search and filters
  const filteredVolunteers = volunteers.filter((volunteer: any) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      volunteer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.phone?.includes(searchQuery);

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(volunteer.status)) return false;
    }

    // Role filter
    if (filters.role && filters.role.length > 0) {
      if (!filters.role.includes(volunteer.role)) return false;
    }

    return matchesSearch;
  });

  // Calculate metrics
  const activeCount = volunteers.filter((v: any) => v.status === 'ACTIVE').length;
  const totalHours = volunteers.reduce((sum: number, v: any) => sum + (v.hours_logged || 0), 0);
  const avgReliability = volunteers.length > 0
    ? Math.round(volunteers.reduce((sum: number, v: any) => sum + (v.reliability_rate || 0), 0) / volunteers.length)
    : 0;
  const totalTasks = volunteers.reduce((sum: number, v: any) => sum + (v.tasks_completed || 0), 0);

  const summaryMetrics = [
    {
      label: 'Active Volunteers',
      value: activeCount,
      icon: '👥',
      color: colorPsychology.programs.volunteers.primary,
      isGood: activeCount > 50
    },
    {
      label: 'Total Hours Logged',
      value: totalHours.toLocaleString(),
      unit: 'hrs',
      icon: '⏱️',
      color: colorPsychology.programs.donations.primary,
      benchmark: `${Math.round(totalHours / Math.max(volunteers.length, 1))} avg per volunteer`
    },
    {
      label: 'Avg Reliability',
      value: avgReliability,
      unit: '%',
      icon: '⭐',
      color: colorPsychology.status.success.primary,
      isGood: avgReliability >= 85
    },
    {
      label: 'Tasks Completed',
      value: totalTasks.toLocaleString(),
      icon: '✅',
      color: colorPsychology.programs.cases.primary,
      isGood: true
    }
  ];

  const filterGroups = [
    {
      name: 'Status',
      key: 'status',
      options: [
        { label: 'Active', value: 'ACTIVE', count: volunteers.filter((v: any) => v.status === 'ACTIVE').length },
        { label: 'Inactive', value: 'INACTIVE', count: volunteers.filter((v: any) => v.status === 'INACTIVE').length },
        { label: 'Pending', value: 'PENDING', count: volunteers.filter((v: any) => v.status === 'PENDING').length }
      ]
    },
    {
      name: 'Role',
      key: 'role',
      options: [
        { label: 'Field Staff', value: 'FIELD', count: volunteers.filter((v: any) => v.role === 'FIELD').length },
        { label: 'Mentor', value: 'MENTOR', count: volunteers.filter((v: any) => v.role === 'MENTOR').length },
        { label: 'Trainer', value: 'TRAINER', count: volunteers.filter((v: any) => v.role === 'TRAINER').length }
      ]
    }
  ];

  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Summary Header */}
        <SummaryHeader
          title="Volunteer Management"
          metrics={summaryMetrics}
          color={colorPsychology.programs.volunteers.primary}
        />

        {/* Filter Bar */}
        <Box sx={{ mb: 4 }}>
          <VolunteerFilterBar
            onSearch={setSearchQuery}
            onFilterChange={setFilters}
            filterGroups={filterGroups}
            totalResults={volunteers.length}
            filteredResults={filteredVolunteers.length}
            activeCount={activeCount}
          />
        </Box>

        {/* Volunteers Grid */}
        {filteredVolunteers.length > 0 ? (
          <MotionGrid
            container
            spacing={{ xs: 2, md: 3 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredVolunteers.map((volunteer: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={volunteer.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <VolunteerCard
                    volunteer={volunteer}
                    onEdit={(id: string) => console.log('Edit volunteer:', id)}
                    onAssignTask={(id: string) => console.log('Assign task:', id)}
                  />
                </motion.div>
              </Grid>
            ))}
          </MotionGrid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              bgcolor: alpha(colorPsychology.programs.volunteers.primary, 0.05),
              borderRadius: 3,
              border: `1px dashed ${alpha(colorPsychology.programs.volunteers.primary, 0.2)}`
            }}
          >
            <Box sx={{ fontSize: '3rem', mb: 2 }}>😊</Box>
            <Box sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {searchQuery || Object.keys(filters).some(k => filters[k].length > 0)
                ? 'No volunteers match your search criteria'
                : 'No volunteers yet. Create one to get started!'}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};
