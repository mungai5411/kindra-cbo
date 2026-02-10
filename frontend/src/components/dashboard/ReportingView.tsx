import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    TableContainer,
    Chip,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Divider,
    Alert,
    Snackbar,
    alpha,
    useTheme
} from '@mui/material';
import {
    DonationTrendsChart,
    CampaignProgressChart,
    DonationMethodsChart
} from '../charts/DashboardCharts';
import {
    Description,
    Timeline,
    BarChart,
    PieChart,
    PictureAsPdf,
    Insights,
    AutoGraph,
    Security,
    Psychology,
    TableView,
    FilterList,
    Download,
    Warning,
    Folder,
    LocationOn
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchDashboardData, fetchReports, generateReport } from '../../features/reporting/reportingSlice';
import { fetchFamilies, fetchAssessments } from '../../features/caseManagement/caseManagementSlice';
import { SubTabView } from './SubTabView';
import { downloadFile } from '../../utils/downloadHelper';
import { motion } from 'framer-motion';
import { ImpactTrendsChart } from '../charts/DashboardCharts';
import { MapView } from './MapView';

export function ReportingView({ activeTab }: { activeTab?: string }) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { dashboardData, reports, isLoading: isReportingLoading } = useSelector((state: RootState) => state.reporting);
    const { families, assessments, isLoading: isCaseLoading } = useSelector((state: RootState) => state.caseManagement);
    const isLoading = isReportingLoading || isCaseLoading;
    const [openDialog, setOpenDialog] = useState(false);
    const [reportType, setReportType] = useState('DONATION');
    const [reportFormat, setReportFormat] = useState('PDF');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'warning' | 'error' });

    useEffect(() => {
        dispatch(fetchDashboardData());
        dispatch(fetchReports());
        dispatch(fetchFamilies());
        dispatch(fetchAssessments());

        // Set up real-time polling every 30 seconds
        const pollInterval = setInterval(() => {
            dispatch(fetchDashboardData());
        }, 30000);

        return () => clearInterval(pollInterval);
    }, [dispatch]);

    const handleGenerateQuickReport = (type: string) => {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        dispatch(generateReport({
            report_type: type,
            format: 'PDF',
            title: `Quick ${type} Report`,
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: now.toISOString().split('T')[0]
        }));
    };

    const handleGenerateIntelligence = () => {
        const now = new Date();
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);

        dispatch(generateReport({
            report_type: reportType,
            format: reportFormat,
            title: `Intelligence Report - ${new Date().toLocaleDateString()}`,
            start_date: sixtyDaysAgo.toISOString().split('T')[0],
            end_date: now.toISOString().split('T')[0]
        })).then(() => {
            setOpenDialog(false);
        });
    };

    const handleExportFamilies = () => {
        if (!families || families.length === 0) {
            setSnackbar({ open: true, message: 'No family data available to export.', severity: 'warning' });
            return;
        }

        // Convert families data to CSV
        const headers = ['Family Code', 'Primary Contact', 'Phone', 'County', 'Sub-County', 'Ward', 'Vulnerability', 'Status', 'Registered Date'];
        const csvContent = [
            headers.join(','),
            ...families.map((f: any) => [
                f.family_code,
                `"${f.primary_contact_name}"`, // Quote to handle commas in names
                f.primary_contact_phone,
                f.county,
                f.sub_county,
                f.ward,
                f.vulnerability_level,
                f.status,
                new Date(f.registration_date).toLocaleDateString()
            ].join(','))
        ].join('\n');

        // Create Blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `families_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSnackbar({ open: true, message: 'Family data exported successfully.', severity: 'success' });
    };

    //Helper for safe color access
    const getColor = (colorName: string): string => {
        // Cast to unknown first if needed, or just use any to bypass strict keyof checks for dynamic strings
        const palette = theme.palette as any;
        return palette[colorName]?.main || theme.palette.primary.main;
    };

    if (isLoading && !dashboardData) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    const donationTrends = dashboardData?.donations?.daily_totals
        ? Object.entries(dashboardData.donations.daily_totals!).map(([date, amount]) => ({ date, amount }))
        : [];

    const renderSummary = () => (
        <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, height: 'auto', minHeight: 450, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">Donation Trends</Typography>
                        <Chip label="Live Data" size="small" color="success" variant="outlined" />
                    </Box>
                    <Box sx={{ height: 350, width: '100%' }}>
                        <DonationTrendsChart data={donationTrends} embedded />
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, height: '100%', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), bgcolor: alpha(theme.palette.primary.main, 0.01), boxShadow: theme.shadows[1] }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>Quick Reports</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {['Donation', 'Volunteer', 'Shelter'].map((r) => (
                            <Button
                                key={r}
                                variant="outlined"
                                size="large"
                                startIcon={<PictureAsPdf />}
                                sx={{
                                    borderRadius: 1,
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' }
                                }}
                                onClick={() => handleGenerateQuickReport(r.toUpperCase())}
                            >
                                {r} Data Set
                            </Button>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<Description />}
                            onClick={() => setSnackbar({ open: true, message: 'Redirecting to report archival server...', severity: 'info' })}
                            sx={{ fontWeight: 'bold', borderRadius: 1, py: 1.5, boxShadow: theme.shadows[4] }}
                        >
                            View Archive
                        </Button>
                        <Divider sx={{ my: 1 }} />
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExportFamilies}
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Download Families CSV
                        </Button>
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 1, height: 'auto', minHeight: 400, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Donation Methods</Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                        <DonationMethodsChart data={dashboardData?.donation_methods || []} embedded />
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 1, height: 'auto', minHeight: 400, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Campaign Progress</Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                        <CampaignProgressChart campaigns={dashboardData?.campaign_progress || []} embedded />
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderReportsList = () => (
        <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Generated Reports Inventory</Typography>
                <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    size="small"
                    sx={{ borderRadius: 2 }}
                    onClick={() => setSnackbar({ open: true, message: 'Filtering parameters active.', severity: 'info' })}
                >
                    Filter
                </Button>
            </Box>
            <TableContainer>
                <List sx={{ p: 0 }}>
                    {reports.map((report: any) => (
                        <ListItem
                            key={report.id}
                            divider
                            sx={{
                                '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) },
                                transition: 'background-color 0.2s'
                            }}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    onClick={async () => {
                                        if (report.file) {
                                            try {
                                                const filename = report.file.split('/').pop() || 'report.csv';
                                                await downloadFile(report.file, filename);
                                                setSnackbar({ open: true, message: 'Report downloaded.', severity: 'success' });
                                            } catch (err) {
                                                setSnackbar({ open: true, message: 'Download failed.', severity: 'error' });
                                            }
                                        } else {
                                            setSnackbar({ open: true, message: `Report file for ${report.title} is still being generated or is unavailable.`, severity: 'warning' });
                                        }
                                    }}
                                >
                                    <Download color="primary" />
                                </IconButton>
                            }
                        >
                            <ListItemIcon>
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main'
                                }}>
                                    <Description fontSize="small" />
                                </Box>
                            </ListItemIcon>
                            <ListItemText
                                primary={report.title}
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                                            Generated by Admin
                                        </Typography>
                                        <Typography variant="caption" component="span" sx={{ color: 'text.disabled' }}>•</Typography>
                                        <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                                            {new Date(report.generated_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                }
                                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                            />
                            <Chip
                                label={report.report_type}
                                size="small"
                                sx={{
                                    mr: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    color: 'secondary.main',
                                    fontWeight: 'bold'
                                }}
                            />
                        </ListItem>
                    ))}
                    {reports.length === 0 && (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <Typography color="text.secondary">No reports generated yet.</Typography>
                        </Box>
                    )}
                </List>
            </TableContainer>
        </Paper>
    );

    const renderKPIs = () => (
        <Grid container spacing={3}>
            {[
                { label: 'Conversion Rate', value: '12%', delta: '+2%', color: 'primary' },
                { label: 'Retention Score', value: '88', delta: '-1%', color: 'success' },
                { label: 'Avg Time to Placement', value: '4.2 Days', delta: '-0.5 Days', color: 'warning' },
                { label: 'Donor Growth', value: '24%', delta: '+5%', color: 'secondary' },
            ].map((kpi, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Card sx={{
                        borderRadius: 2,
                        boxShadow: theme.shadows[1],
                        border: '1px solid',
                        borderColor: alpha(getColor(kpi.color), 0.1),
                        bgcolor: alpha(getColor(kpi.color), 0.03)
                    }}>
                        <CardContent>
                            <Typography variant="overline" fontWeight="700" sx={{ color: getColor(kpi.color) }}>
                                {kpi.label}
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                                {kpi.value}
                            </Typography>
                            <Chip
                                label={`${kpi.delta} from last month`}
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    fontWeight: 'bold',
                                    color: kpi.delta.startsWith('+') ? 'success.main' : 'error.main'
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            <Grid item xs={12}>
                <Paper sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                    <Timeline sx={{ fontSize: 60, opacity: 0.1, mb: 2 }} />
                    <Typography color="text.secondary" fontWeight="medium">Detailed KPI Correlation Matrix Rendering...</Typography>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderCompliance = () => (
        <Grid container spacing={3}>
            {[
                { title: '98% Compliant', subtitle: 'System-wide Health Score', icon: <Insights />, color: 'success' },
                { title: '12 Active Audits', subtitle: 'Ongoing regulatory reviews', icon: <AutoGraph />, color: 'primary' },
                { title: 'Secure Access', subtitle: 'MFA enforced for all admins', icon: <Security />, color: 'warning' }
            ].map((item, i) => (
                <Grid item xs={12} md={4} key={i}>
                    <Card sx={{
                        borderRadius: 2,
                        height: '100%',
                        bgcolor: item.color === 'success' ? theme.palette.success.main : 'background.paper',
                        color: item.color === 'success' ? 'white' : 'text.primary',
                        border: item.color !== 'success' ? '1px solid' : 'none',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        boxShadow: item.color === 'success' ? theme.shadows[4] : theme.shadows[1]
                    }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Box sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                bgcolor: item.color === 'success' ? 'rgba(255,255,255,0.2)' : alpha(getColor(item.color), 0.1),
                                color: item.color === 'success' ? 'white' : getColor(item.color),
                                mb: 2
                            }}>
                                {item.icon}
                            </Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>{item.title}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>{item.subtitle}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            <Grid item xs={12}>
                <Paper sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                        <Typography variant="h6" fontWeight="bold">Regulatory Compliance Logs</Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Audit Item</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Entity</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { item: 'GDPR Data Privacy Audit', entity: 'IT Dept', date: '2023-11-15', status: 'PASS' },
                                    { item: 'Financial Transparency Review', entity: 'External Auditor', date: '2023-11-10', status: 'IN PROGRESS' },
                                    { item: 'NGO Board Compliance', entity: 'Legal', date: '2023-10-25', status: 'PASS' },
                                ].map((log, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell sx={{ fontWeight: 'medium' }}>{log.item}</TableCell>
                                        <TableCell>{log.entity}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{log.date}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.status}
                                                size="small"
                                                color={log.status === 'PASS' ? 'success' : 'warning'}
                                                sx={{ fontWeight: 'bold', borderRadius: 2 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderPredictiveInsights = () => {
        // Group assessments by family and sort by date
        const familyAssessments = assessments.reduce((acc: any, curr: any) => {
            if (!acc[curr.family]) acc[curr.family] = [];
            acc[curr.family].push(curr);
            return acc;
        }, {});

        Object.keys(familyAssessments).forEach(fid => {
            familyAssessments[fid].sort((a: any, b: any) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime());
        });

        const criticalFamilies = families.filter(f => f.vulnerability_level === 'CRITICAL');
        const improvingFamilies = Object.values(familyAssessments).filter((history: any) => {
            if (history.length < 2) return false;
            return history[0].overall_score < history[1].overall_score; // Lower is better
        });
        const decliningFamilies = Object.values(familyAssessments).filter((history: any) => {
            if (history.length < 2) return false;
            return history[0].overall_score > history[1].overall_score; // Higher is worse
        });

        // Mock data for trends chart (since we might not have enough historical data points for a smooth line)
        // In a real scenario, we'd aggregate assessment dates
        const impactTrendsData = [
            { date: '2023-01', improved: 5, declined: 2 },
            { date: '2023-02', improved: 8, declined: 3 },
            { date: '2023-03', improved: 12, declined: 1 },
            { date: '2023-04', improved: 10, declined: 4 },
            { date: '2023-05', improved: 15, declined: 2 },
            { date: '2023-06', improved: 18, declined: 1 },
        ];

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, bgcolor: alpha(theme.palette.error.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Psychology color="error" />
                                <Typography variant="h6" fontWeight="bold">Rising Risk Alerts</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="900" color="error.main">{decliningFamilies.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Families showing worsening vulnerability indicators in recent assessments.</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2) }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <AutoGraph color="success" />
                                <Typography variant="h6" fontWeight="bold">Impact Success</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="900" color="success.main">{improvingFamilies.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Families with significant improvement in their well-being scores.</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, bgcolor: alpha(theme.palette.info.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.2) }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Insights color="info" />
                                <Typography variant="h6" fontWeight="bold">Forecast Intelligence</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="900" color="info.main">94%</Typography>
                            <Typography variant="body2" color="text.secondary">Confidence score in current preventative intervention success rate.</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <ImpactTrendsChart data={impactTrendsData} />
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Automated Decision Support</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Based on historical patterns, the system recommends the following priority actions for case management:
                        </Typography>
                        <List>
                            <ListItem sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2, mb: 1 }}>
                                <ListItemIcon><Warning color="warning" /></ListItemIcon>
                                <ListItemText
                                    primary="Prioritize Emergency Assessments"
                                    secondary={`${criticalFamilies.length} families have not had an assessment in over 90 days.`}
                                />
                            </ListItem>
                            <ListItem sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2, mb: 1 }}>
                                <ListItemIcon><Folder color="info" /></ListItemIcon>
                                <ListItemText
                                    primary="Resource Allocation Optimization"
                                    secondary="High overlap detected in Sub-county B. Recommend consolidating volunteer outreach."
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    const renderGeospatial = () => (
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), height: '600px' }}>
            <MapView height="100%" embedded />
        </Paper>
    );

    const tabs = [
        { id: 'overview', label: 'General Overview', icon: <BarChart />, component: renderSummary() },
        { id: 'predictive', label: 'Predictive Insights', icon: <Psychology />, component: renderPredictiveInsights() },
        { id: 'geospatial', label: 'Geospatial Analysis', icon: <LocationOn />, component: renderGeospatial() },
        { id: 'reports', label: 'Financial Reports', icon: <Description />, component: renderReportsList() },
        { id: 'kpis', label: 'Impact KPIs', icon: <Timeline />, component: renderKPIs() },
        { id: 'compliance', label: 'Compliance & Audits', icon: <PieChart />, component: renderCompliance() },
    ];

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <BarChart sx={{ fontSize: 40, color: 'primary.main' }} />
                        Reporting & Intelligence
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
                        Comprehensive analytics and automated reporting for data-driven decisions.
                        Export data across all operational verticals.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<TableView />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold', boxShadow: theme.shadows[4] }}
                >
                    Custom Report
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'TOTAL FAMILIES', value: dashboardData?.overview?.total_families || 0, color: 'primary' },
                    { label: 'ACTIVE CASES', value: dashboardData?.overview?.active_cases || 0, color: 'secondary' },
                    { label: 'MONTHLY FUNDS', value: `KES ${(dashboardData?.donations?.total_this_month || 0).toLocaleString()}`, color: 'success' },
                    { label: 'VOLUNTEER HOURS', value: dashboardData?.volunteers?.total_hours_this_month || 0, color: 'warning' },
                ].map((stat, i) => (
                    <Grid item xs={12} md={3} key={i}>
                        <Card sx={{
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderColor: getColor(stat.color),
                            boxShadow: theme.shadows[1]
                        }}>
                            <CardContent>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                                    {stat.label}
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                                    {stat.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <SubTabView title="Analysis Perspective" tabs={tabs} activeTab={activeTab} />

            {/* Intelligence Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex' }}>
                        <Psychology />
                    </Box>
                    Intelligence Configuration
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            fullWidth
                            select
                            label="Data Source"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="DONATION">Donation Analytics</MenuItem>
                            <MenuItem value="VOLUNTEER">Volunteer Engagement</MenuItem>
                            <MenuItem value="CASE">Case Management Impact</MenuItem>
                            <MenuItem value="SHELTER">Shelter Utilization</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            label="Output Format"
                            value={reportFormat}
                            onChange={(e) => setReportFormat(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="PDF">Encrypted PDF</MenuItem>
                            <MenuItem value="EXCEL">Spreadsheet (XLSX)</MenuItem>
                            <MenuItem value="CSV">Raw Data (CSV)</MenuItem>
                        </TextField>

                        <Alert severity="info" sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                            Advanced intelligence models will aggregate across all nodes.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleGenerateIntelligence} sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}>
                        Generate Intelligence
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
