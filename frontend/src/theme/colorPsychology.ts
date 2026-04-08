/**
 * Color Psychology Theme - Inspired by Higherlife Foundation
 * Maps program areas to colors that evoke specific emotions and meanings
 */

export const colorPsychology = {
  // Program Pillars - Each with distinct identity
  programs: {
    donations: {
      primary: '#519755',    // Green - Trust, growth, generosity
      light: '#76D275',
      dark: '#00701A',
      accent: '#A5D6A7',
      background: 'rgba(81, 151, 85, 0.08)',
      icon: '💚'
    },
    volunteers: {
      primary: '#5D5FEF',    // Vibrant Purple/Blue - Energy, community, support
      light: '#9FA8FF',
      dark: '#3F42C5',
      accent: '#B5BFFF',
      background: 'rgba(93, 95, 239, 0.08)',
      icon: '💪'
    },
    cases: {
      primary: '#FF708B',    // Vibrant Pink - Care, compassion, warmth
      light: '#FF94A2',
      dark: '#E85D7B',
      accent: '#FFB3BE',
      background: 'rgba(255, 112, 139, 0.08)',
      icon: '❤️'
    },
    shelter: {
      primary: '#FFBA69',    // Vibrant Orange - Warmth, safety, home
      light: '#FFD180',
      dark: '#FFA726',
      accent: '#FFE0B2',
      background: 'rgba(255, 186, 105, 0.08)',
      icon: '🏠'
    },
    livelihoods: {
      primary: '#26C6DA',    // Teal/Cyan - Growth, sustainability, hope
      light: '#4DD0E1',
      dark: '#00838F',
      accent: '#80DEEA',
      background: 'rgba(38, 198, 218, 0.08)',
      icon: '🌱'
    },
    health: {
      primary: '#66BB6A',    // Light Green - Health, vitality, wellness
      light: '#81C784',
      dark: '#388E3C',
      accent: '#A5D6A7',
      background: 'rgba(102, 187, 106, 0.08)',
      icon: '⚕️'
    }
  },

  // Status Colors - aligned with emotional messaging
  status: {
    success: {
      primary: '#43A047',
      background: 'rgba(67, 160, 71, 0.08)',
      message: 'Progressing well'
    },
    warning: {
      primary: '#FBC02D',
      background: 'rgba(251, 192, 45, 0.08)',
      message: 'Needs attention'
    },
    critical: {
      primary: '#E53935',
      background: 'rgba(229, 57, 53, 0.08)',
      message: 'Urgent action required'
    },
    pending: {
      primary: '#FB8C00',
      background: 'rgba(251, 140, 0, 0.08)',
      message: 'Awaiting action'
    },
    resolved: {
      primary: '#00897B',
      background: 'rgba(0, 137, 123, 0.08)',
      message: 'Successfully completed'
    }
  },

  // Priority Levels - Visual hierarchy
  priority: {
    critical: {
      primary: '#D32F2F',
      icon: '🔴',
      description: 'Immediate action required'
    },
    high: {
      primary: '#F57C00',
      icon: '🟠',
      description: 'Important - this week'
    },
    medium: {
      primary: '#FBC02D',
      icon: '🟡',
      description: 'Standard priority'
    },
    low: {
      primary: '#7CB342',
      icon: '🟢',
      description: 'Can be scheduled'
    }
  },

  // Emotional Color Palette (inspired by Higherlife's visual style)
  emotional: {
    hope: '#FFD700',           // Gold - Aspiration, possibility
    compassion: '#FF6B9D',     // Pink - Empathy, care
    trust: '#4A90E2',          // Blue - Reliability, security
    growth: '#26A69A',         // Teal - Progress, development
    community: '#9C27B0',      // Purple - Unity, connection
    impact: '#FF7043',         // Deep Orange - Action, results
    celebration: '#66BB6A',    // Green - Achievement, success
  },

  // Neutral grays for data hierarchy
  neutral: {
    dark: '#212121',
    medium: '#757575',
    light: '#BDBDBD',
    lightest: '#EEEEEE',
    background: '#F5F5F5',
  }
};

/**
 * Helper functions to apply color psychology
 */
export const getColorByProgram = (program: keyof typeof colorPsychology.programs) => {
  return colorPsychology.programs[program];
};

export const getColorByStatus = (status: string) => {
  const statusKey = status.toLowerCase().replace(/_/g, '') as keyof typeof colorPsychology.status;
  return colorPsychology.status[statusKey] || colorPsychology.status.pending;
};

export const getColorByPriority = (priority: string) => {
  const priorityKey = priority.toLowerCase() as keyof typeof colorPsychology.priority;
  return colorPsychology.priority[priorityKey] || colorPsychology.priority.medium;
};

export const getProgramIcon = (program: keyof typeof colorPsychology.programs) => {
  return colorPsychology.programs[program].icon;
};
