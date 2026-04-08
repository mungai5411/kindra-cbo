/**
 * Volunteer Filter Bar Component
 * Advanced filtering for volunteers
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Chip,
  Button,
  Popper,
  Paper,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Stack,
  Typography,
  alpha,
  useTheme,
  Collapse,
  InputAdornment
} from '@mui/material';
import {
  Search,
  FilterList,
  Close,
  ExpandMore
} from '@mui/icons-material';
import { colorPsychology } from '../../theme/colorPsychology';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  name: string;
  key: string;
  options: FilterOption[];
  color?: string;
}

interface VolunteerFilterBarProps {
  onFilterChange: (filters: Record<string, string[]>) => void;
  onSearch: (query: string) => void;
  filterGroups: FilterGroup[];
  totalResults: number;
  filteredResults: number;
  activeCount?: number;
}

export const VolunteerFilterBar: React.FC<VolunteerFilterBarProps> = ({
  onFilterChange,
  onSearch,
  filterGroups,
  totalResults,
  filteredResults,
  activeCount
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFilters, setExpandedFilters] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (groupKey: string, optionValue: string) => {
    const newFilters = { ...activeFilters };
    if (!newFilters[groupKey]) {
      newFilters[groupKey] = [];
    }

    const index = newFilters[groupKey].indexOf(optionValue);
    if (index > -1) {
      newFilters[groupKey].splice(index, 1);
    } else {
      newFilters[groupKey].push(optionValue);
    }

    if (newFilters[groupKey].length === 0) {
      delete newFilters[groupKey];
    }

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    onFilterChange({});
    onSearch('');
  };

  const activeFilterCount = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search + Filter Bar */}
      <Box sx={{
        display: 'flex',
        gap: 1.5,
        mb: 2,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <TextField
          placeholder="Search by name, email, phone..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          size="small"
          variant="outlined"
          sx={{
            width: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: alpha(colorPsychology.programs.volunteers.primary, 0.04),
              '& fieldset': { borderColor: alpha(colorPsychology.programs.volunteers.primary, 0.2) },
              '&:hover fieldset': { borderColor: colorPsychology.programs.volunteers.primary }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
              </InputAdornment>
            )
          }}
        />

        {/* Filter Button */}
        <Button
          variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
          size="small"
          startIcon={<FilterList />}
          onClick={(e) => setFilterAnchor(e.currentTarget)}
          sx={{
            background: activeFilterCount > 0 
              ? `linear-gradient(135deg, ${colorPsychology.programs.volunteers.primary}, ${colorPsychology.programs.volunteers.light})`
              : 'transparent'
          }}
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>

        {/* Clear Button */}
        {(searchQuery || activeFilterCount > 0) && (
          <Button
            variant="text"
            size="small"
            startIcon={<Close />}
            onClick={clearAllFilters}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Result Metrics */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
        p: 1.5,
        backgroundColor: alpha(colorPsychology.programs.volunteers.primary, 0.04),
        borderRadius: 2,
        border: `1px solid ${alpha(colorPsychology.programs.volunteers.primary, 0.1)}`
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Showing <strong>{filteredResults}</strong> of <strong>{totalResults}</strong> volunteers
        </Typography>

        {activeCount !== undefined && activeCount > 0 && (
          <Chip
            label={`${activeCount} Active`}
            size="small"
            sx={{
              backgroundColor: alpha(colorPsychology.status.success.primary, 0.15),
              color: colorPsychology.status.success.primary,
              fontWeight: 700
            }}
          />
        )}
      </Box>

      {/* Filter Popper */}
      <Popper
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        placement="bottom-start"
        sx={{ zIndex: 1200 }}
      >
        <Paper sx={{ mt: 1, p: 2, minWidth: 300, maxWidth: 400 }}>
          {filterGroups.map((group) => (
            <Box key={group.key} sx={{ mb: 2 }}>
              {/* Group Header */}
              <Button
                fullWidth
                onClick={() => setExpandedFilters(
                  expandedFilters === group.key ? null : group.key
                )}
                sx={{
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  mb: 1,
                  color: group.color || theme.palette.text.primary,
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
                endIcon={<ExpandMore sx={{
                  transform: expandedFilters === group.key ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s'
                }} />}
              >
                {group.name}
              </Button>

              {/* Options */}
              <Collapse in={expandedFilters === group.key}>
                <FormGroup sx={{ pl: 1 }}>
                  {group.options.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          size="small"
                          checked={activeFilters[group.key]?.includes(option.value) || false}
                          onChange={() => handleFilterChange(group.key, option.value)}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {option.label}
                          {option.count !== undefined && (
                            <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                              ({option.count})
                            </Typography>
                          )}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </Collapse>
            </Box>
          ))}

          {/* Footer */}
          <Stack direction="row" spacing={1} sx={{ mt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`, pt: 1.5 }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setFilterAnchor(null)}
              sx={{ flex: 1 }}
            >
              Done
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={clearAllFilters}
                sx={{ flex: 1 }}
              >
                Clear All
              </Button>
            )}
          </Stack>
        </Paper>
      </Popper>
    </Box>
  );
};
