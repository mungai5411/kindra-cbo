/**
 * Dashboard Chart Components
 * Reusable visualization components using Recharts with a modern, minimal aesthetic
 */

import type { ReactNode } from 'react';
import { Card, CardContent, Typography, useTheme, alpha, Box } from '@mui/material';
import {
    BarChart, Bar, PieChart, Pie, AreaChart, Area, Line, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
    ReferenceArea, ReferenceLine, Treemap
} from 'recharts';
// Modern clean palette
const CHART_COLORS = [
    '#6366f1', // Indigo (Primary)
    '#ec4899', // Pink (Secondary)
    '#10b981', // Emerald (Success)
    '#f59e0b', // Amber (Warning)
    '#3b82f6', // Blue (Info)
    '#8b5cf6', // Violet
    '#f43f5e', // Rose
    '#06b6d4', // Cyan
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    formatter?: (value: any) => string;
}

const CustomTooltip = ({ active, payload, label, formatter }: CustomTooltipProps) => {
    const theme = useTheme();
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                boxShadow: theme.shadows[4],
                p: 1.5,
                minWidth: 120
            }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                    {label}
                </Typography>
                {payload.map((entry: any, index: number) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.fill || entry.stroke }} />
                        <Typography variant="body2" fontWeight="bold">
                            {formatter ? formatter(entry.value) : entry.value}
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    }
    return null;
};

interface ChartCardProps {
    title?: string;
    children: ReactNode;
    hideCard?: boolean;
}

const ChartCard = ({ title, children, hideCard = false }: ChartCardProps) => {
    const theme = useTheme();
    return (
        <Card elevation={0} sx={{
            height: '100%',
            borderRadius: 3,
            border: hideCard ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            bgcolor: hideCard ? 'transparent' : 'background.paper',
            ...(hideCard && { p: 0 })
        }}>
            <CardContent sx={{
                p: { xs: 2, sm: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...(hideCard && { p: 0, '&:last-child': { pb: 0 } })
            }}>
                {title && (
                    <Typography
                        variant="caption"
                        sx={{
                            mb: 3,
                            display: 'block',
                            fontWeight: 700,
                            letterSpacing: 1.2,
                            color: 'text.disabled',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem'
                        }}
                    >
                        {title}
                    </Typography>
                )}
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    {children}
                </Box>
            </CardContent>
        </Card>
    );
};

// Donation Trends Bar Chart
export const DonationTrendsChart = ({ data, embedded = false }: { data: any[], embedded?: boolean }) => {
    const theme = useTheme();

    return (
        <ChartCard title={embedded ? undefined : "Donation Trends"} hideCard={embedded}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={data} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                        dy={10}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip content={<CustomTooltip formatter={(v) => `KES ${v.toLocaleString()}`} />} cursor={{ fill: alpha(theme.palette.primary.main, 0.05), radius: 4 }} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Campaign Progress Bar Chart
export const CampaignProgressChart = ({ campaigns, embedded = false }: { campaigns: any[], embedded?: boolean }) => {
    const theme = useTheme();

    return (
        <ChartCard title={embedded ? undefined : "Campaign Goals"} hideCard={embedded}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={campaigns} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={80}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }}
                        tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}...` : value}
                    />
                    <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={12}>
                        {campaigns.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 1) % CHART_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Volunteer Hours Area Chart
export const VolunteerHoursChart = ({ data, embedded = false }: { data: any[], embedded?: boolean }) => {
    const theme = useTheme();

    return (
        <ChartCard title={embedded ? undefined : "Volunteer Contributions"} hideCard={embedded}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <AreaChart data={data} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip formatter={(v) => `${v} hrs`} />} />
                    <Area
                        type="monotone"
                        dataKey="hours"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorHours)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Children Distribution Pie Chart
export const ChildrenDistributionChart = ({ data, embedded = false }: { data: any[], embedded?: boolean }) => {
    return (
        <ChartCard title={embedded ? undefined : "Child Demographics"} hideCard={embedded}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={4}
                        dataKey="value"
                        cornerRadius={4}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '16px', opacity: 0.8 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Donation Methods Pie Chart
export const DonationMethodsChart = ({ data, embedded = false }: { data: any[], embedded?: boolean }) => {
    return (
        <ChartCard title={embedded ? undefined : "Donation Sources"} hideCard={embedded}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={4}
                        dataKey="value"
                        cornerRadius={4}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '16px', opacity: 0.8 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Fund Allocation breakdown
export const FundAllocationChart = ({ data, title, hideCard = false }: { data: any[], title?: string, hideCard?: boolean }) => {
    return (
        <ChartCard title={title || "Impact Allocation"} hideCard={hideCard}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={4}
                        dataKey="value"
                        cornerRadius={4}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(v) => `KES ${v.toLocaleString()}`} />} />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '16px', opacity: 0.8 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Shelter Capacity Chart
export const ShelterCapacityChart = ({ shelters, embedded = false }: { shelters: any[], embedded?: boolean }) => {
    const theme = useTheme();

    return (
        <ChartCard title={embedded ? undefined : "Shelter Occupancy"} hideCard={embedded}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={shelters} margin={{ left: -20, right: 0, top: 0, bottom: 0 }} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                        dy={10}
                        tickFormatter={(v) => v.length > 8 ? `${v.substring(0, 6)}...` : v}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="occupancy" name="Occupants" fill={theme.palette.primary.main} radius={[4, 4, 4, 4]} barSize={12} />
                    <Bar dataKey="capacity" name="Capacity" fill={alpha(theme.palette.primary.main, 0.2)} radius={[4, 4, 4, 4]} barSize={12} />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '10px', opacity: 0.8 }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Enhanced Stat Card
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
        <Card elevation={0} sx={{
            height: '100%',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 4,
                height: '100%',
                bgcolor: displayColor
            }} />
            <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {title}
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: 'text.primary', my: 1, letterSpacing: -1 }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.8), fontWeight: 500 }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

// Impact Trends Line Chart
export const ImpactTrendsChart = ({ data, embedded = false }: { data: any[], embedded?: boolean }) => {
    const theme = useTheme();

    return (
        <ChartCard title={embedded ? undefined : "Impact Trends"} hideCard={embedded}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <AreaChart data={data} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorImproved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDeclined" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area
                        type="monotone"
                        dataKey="improved"
                        name="Condition Improved"
                        stroke={theme.palette.success.main}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorImproved)"
                    />
                    <Area
                        type="monotone"
                        dataKey="declined"
                        name="At Risk"
                        stroke={theme.palette.error.main}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDeclined)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};
// Target Performance Chart (with Bands)
export const TargetPerformanceChart = ({ data }: { data: any[] }) => {
    const theme = useTheme();

    return (
        <ChartCard title="Operational Performance Targets">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40, top: 10, bottom: 10 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />

                    {/* Performance Bands */}
                    <ReferenceArea x1={0} x2={40} fill="#f43f5e" fillOpacity={0.05} label={{ value: 'OK 0-40%', position: 'insideRight', fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} />
                    <ReferenceArea x1={40} x2={70} fill="#f59e0b" fillOpacity={0.05} label={{ value: 'GOOD 40-70%', position: 'insideRight', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                    <ReferenceArea x1={70} x2={100} fill="#10b981" fillOpacity={0.05} label={{ value: 'GREAT 70-100%', position: 'insideRight', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />

                    <Tooltip
                        content={<CustomTooltip formatter={(v) => `${Math.round((v / 150) * 100)}% of Target`} />}
                        cursor={{ fill: 'transparent' }}
                    />

                    <Bar dataKey="actual" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} barSize={25}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.actual / entry.target > 0.8 ? '#10b981' : theme.palette.primary.main} />
                        ))}
                    </Bar>

                    {/* Dynamic Target Marked as a line */}
                    {data.map((entry, idx) => (
                        <ReferenceLine key={idx} x={entry.target} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: 'TARGET', fill: '#3b82f6', fontSize: 10 }} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Budget Treemap
export const BudgetTreemap = ({ data }: { data: any }) => {
    const theme = useTheme();

    const TreemapContent = (props: any) => {
        const { x, y, width, height, index, name } = props;
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: CHART_COLORS[index % CHART_COLORS.length],
                        stroke: '#fff',
                        strokeWidth: 2,
                        strokeOpacity: 0.1,
                    }}
                />
                {width > 50 && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                    >
                        {name}
                    </text>
                )}
            </g>
        );
    };

    return (
        <ChartCard title="Financial Stewardship (Fund Allocation)">
            <ResponsiveContainer width="100%" height={300}>
                <Treemap
                    data={[data]}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill={theme.palette.primary.main}
                    content={<TreemapContent />}
                >
                    <Tooltip content={<CustomTooltip formatter={(v) => `KES ${v.toLocaleString()}`} />} />
                </Treemap>
            </ResponsiveContainer>
        </ChartCard>
    );
};

// Composed Impact Chart (Stacked Bar + Line)
export const ComposedImpactChart = ({ data }: { data: any[] }) => {
    const theme = useTheme();

    return (
        <ChartCard title="Multi-Metric Impact Correlation">
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} vertical={false} />
                    <XAxis
                        dataKey="period"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    <Bar dataKey="investment" name="Operational Investment" stackId="a" fill={alpha(theme.palette.primary.main, 0.3)} barSize={30} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="donations" name="Direct Aid" stackId="a" fill={theme.palette.primary.main} barSize={30} radius={[4, 4, 0, 0]} />

                    <Line
                        type="monotone"
                        dataKey="outcomes"
                        name="Child Outcomes Index"
                        stroke={theme.palette.secondary.main}
                        strokeWidth={3}
                        dot={{ r: 4, fill: theme.palette.secondary.main }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};
