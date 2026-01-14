/**
 * Dashboard Chart Components
 * Reusable visualization components using Recharts
 */

import type { ReactNode } from 'react';
import { Card, CardContent, Typography, useTheme, alpha } from '@mui/material';
import {
    BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useDeviceType } from '../../hooks/useDeviceType';

// Pie chart coloring logic moved inside components to use theme palette
const GET_CHART_COLORS = (theme: any) => [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#fbbf24', // Amber
    '#6366f1', // Indigo
];


interface ChartCardProps {
    title?: string;
    children: ReactNode;
    hideCard?: boolean;
}

const ChartCard = ({ title, children, hideCard = false }: ChartCardProps) => {
    const theme = useTheme();
    return (
        <Card sx={{
            height: '100%',
            borderRadius: 1,
            boxShadow: theme.shadows[1],
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            ...(hideCard && { boxShadow: 'none', border: 'none', bgcolor: 'transparent' })
        }}>
            <CardContent sx={{
                p: { xs: 1.5, sm: 2 },
                ...(hideCard && { p: 0, '&:last-child': { pb: 0 } })
            }}>
                {title && (
                    <Typography
                        variant="overline"
                        sx={{
                            mb: 2,
                            display: 'block',
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            fontWeight: 800,
                            letterSpacing: 1,
                            color: 'text.secondary',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {title}
                    </Typography>
                )}
                {children}
            </CardContent>
        </Card>
    );
};

// Donation Trends Bar Chart
export const DonationTrendsChart = ({ data }: { data: any[] }) => {
    const theme = useTheme();
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';

    return (
        <ChartCard title="DONATION TRENDS">
            <ResponsiveContainer width="100%" aspect={isMobile ? 1.5 : 2}>
                <BarChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis
                        dataKey="date"
                        style={{ fontSize: '10px' }}
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis
                        style={{ fontSize: '10px' }}
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip
                        cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                        contentStyle={{
                            borderRadius: '4px',
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
                    />
                    <Bar
                        dataKey="amount"
                        radius={[2, 2, 0, 0]}
                    >
                        {data.map((_entry, index) => {
                            const colors = GET_CHART_COLORS(theme);
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.9} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Campaign Progress Bar Chart
export const CampaignProgressChart = ({ campaigns }: { campaigns: any[] }) => {
    const theme = useTheme();
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';

    return (
        <ChartCard title="CAMPAIGN GOALS">
            <ResponsiveContainer width="100%" aspect={isMobile ? 1.5 : 2}>
                <BarChart data={campaigns} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis
                        dataKey="name"
                        style={{ fontSize: '10px' }}
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}...` : value}
                    />
                    <YAxis
                        style={{ fontSize: '10px' }}
                        stroke={theme.palette.text.secondary}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: theme.palette.secondary.main }}
                    />
                    <Bar dataKey="percentage" radius={[2, 2, 0, 0]} name="Progress %">
                        {campaigns.map((_entry, index) => {
                            const colors = GET_CHART_COLORS(theme);
                            return <Cell key={`cell-${index}`} fill={colors[(index + 2) % colors.length]} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};
// Volunteer Hours Bar Chart
export const VolunteerHoursChart = ({ data }: { data: any[] }) => {
    const theme = useTheme();
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';

    return (
        <ChartCard title="VOLUNTEER CONTRIBUTIONS">
            <ResponsiveContainer width="100%" aspect={isMobile ? 1.5 : 2}>
                <AreaChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.info.main} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={theme.palette.info.main} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis
                        dataKey="date"
                        style={{ fontSize: '10px' }}
                        stroke={theme.palette.text.secondary}
                    />
                    <YAxis style={{ fontSize: '10px' }} stroke={theme.palette.text.secondary} />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            fontSize: '12px'
                        }}
                    />
                    <Area type="monotone" dataKey="hours" stroke={theme.palette.info.main} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Children Distribution Pie Chart
export const ChildrenDistributionChart = ({ data }: { data: any[] }) => {
    const theme = useTheme();
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';
    const COLORS = GET_CHART_COLORS(theme);

    return (
        <ChartCard title="CHILDREN STATUS">
            <ResponsiveContainer width="100%" aspect={isMobile ? 1.2 : 2}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Donation Methods Pie Chart
export const DonationMethodsChart = ({ data }: { data: any[] }) => {
    const theme = useTheme();
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';
    const COLORS = GET_CHART_COLORS(theme);

    return (
        <ChartCard title="DONATION SOURCES">
            <ResponsiveContainer width="100%" aspect={isMobile ? 1.2 : 2}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Fund Allocation breakdown (Impact Analytics)
export const FundAllocationChart = ({ data, title, hideCard = false }: { data: any[], title?: string, hideCard?: boolean }) => {
    const theme = useTheme();
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';
    const COLORS = GET_CHART_COLORS(theme);

    return (
        <ChartCard title={title || "IMPACT ALLOCATION"} hideCard={hideCard}>
            <ResponsiveContainer width="100%" aspect={isMobile ? 1.5 : 2.5}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: theme.shadows[4] }}
                        formatter={(value: any) => [`KES ${Number(value).toLocaleString()}`, 'Allocated']}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Shelter Capacity vs Occupancy Chart
export const ShelterCapacityChart = ({ shelters }: { shelters: any[] }) => {
    const theme = useTheme();
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';

    return (
        <ChartCard title="SHELTER CAPACITY">
            <ResponsiveContainer width="100%" aspect={isMobile ? 1.5 : 2}>
                <BarChart data={shelters} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis
                        dataKey="name"
                        style={{ fontSize: '10px' }}
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(v) => v.length > 8 ? `${v.substring(0, 6)}...` : v}
                    />
                    <YAxis style={{ fontSize: '10px' }} stroke={theme.palette.text.secondary} />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            fontSize: '12px'
                        }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
                    <Bar dataKey="occupancy" name="Occupants" fill={theme.palette.primary.main} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="capacity" name="Total Capacity" fill={theme.palette.action.disabledBackground} radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Stat Card for quick metrics
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
}

export const StatCard = ({ title, value, subtitle, color }: StatCardProps) => {
    const theme = useTheme();
    const displayColor = color || theme.palette.primary.main;

    return (
        <Card>
            <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ color: displayColor, my: 1 }}>{value}</Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </CardContent>
        </Card>
    );
};
