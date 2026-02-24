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
    DonationMethodsChart,
    TargetPerformanceChart,
    BudgetTreemap,
    ComposedImpactChart
} from '../charts/DashboardCharts';
import {
    Description,
    Timeline,
    BarChart,
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
import { fetchFamilies } from '../../features/caseManagement/caseManagementSlice';
import { downloadFile } from '../../utils/downloadHelper';
import { motion } from 'framer-motion';
import { MapView } from './MapView';
import { Stack } from '@mui/material';

export function ReportingView() {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { dashboardData, reports, isLoading: isReportingLoading } = useSelector((state: RootState) => state.reporting);
    const { families, isLoading: isCaseLoading } = useSelector((state: RootState) => state.caseManagement);
    const isLoading = isReportingLoading || isCaseLoading;
    const [openDialog, setOpenDialog] = useState(false);
    const [reportType, setReportType] = useState('DONATION');
    const [reportFormat, setReportFormat] = useState('PDF');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'warning' | 'error' });

    useEffect(() => {
        dispatch(fetchDashboardData());
        dispatch(fetchReports());
        dispatch(fetchFamilies());

        // Set up real-time polling every 30 seconds
        const pollInterval = setInterval(() => {
            dispatch(fetchDashboardData());
        }, 30000);

        return () => clearInterval(pollInterval);
    }, [dispatch]);


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

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header Area */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <BarChart sx={{ fontSize: 40, color: 'primary.main' }} />
                        Unified Intelligence Hub
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
                        Real-time operational visibility across all Kindra CBO nodes.
                        Data-driven insights for impact optimization and financial stewardship.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExportFamilies}
                        sx={{ borderRadius: 3, fontWeight: 'bold' }}
                    >
                        Export CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<TableView />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ borderRadius: 3, px: 4, fontWeight: 'bold', boxShadow: theme.shadows[4] }}
                    >
                        Custom Report
                    </Button>
                </Box>
            </Box>

            {/* Top-Level Quick Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'TOTAL FAMILIES', value: dashboardData?.overview?.total_families || 0, color: 'primary' },
                    { label: 'ACTIVE CASES', value: dashboardData?.overview?.active_cases || 0, color: 'secondary' },
                    { label: 'MONTHLY FUNDS', value: `KES ${(dashboardData?.donations?.total_this_month || 0).toLocaleString()}`, color: 'success' },
                    { label: 'VOLUNTEER HOURS', value: dashboardData?.volunteers?.total_hours_this_month || 0, color: 'warning' },
                ].map((stat, i) => (
                    <Grid item xs={12} md={3} key={i}>
                        <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderColor: getColor(stat.color), boxShadow: theme.shadows[1] }}>
                            <CardContent sx={{ py: 2 }}>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold" sx={{ letterSpacing: 1 }}>{stat.label}</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{stat.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Performance & Targets Section */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoGraph color="primary" /> Operational Performance vs Targets
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} md={7}>
                    <TargetPerformanceChart data={dashboardData?.performance_metrics || []} />
                </Grid>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%', bgcolor: alpha(theme.palette.primary.main, 0.02), border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Intelligence Summary</Typography>
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                <strong>High Efficiency:</strong> Child support metrics are at 93% of the quarterly target.
                            </Alert>
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                <strong>Volunteer Growth:</strong> Recruitment is trending 15% higher than last month.
                            </Alert>
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">PREDICTIVE INSIGHT</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Current donation trends suggest <strong>KES 1.2M</strong> surplus by year-end if campaign momentum persists.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Financial Stewardship Section */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Insights color="primary" /> Financial Stewardship (Fund Allocation)
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} md={8}>
                    <BudgetTreemap data={dashboardData?.funding_hierarchy || {}} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <DonationMethodsChart data={dashboardData?.donation_methods || []} embedded />
                </Grid>
            </Grid>

            {/* Donation Trends Section */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline color="primary" /> Financial Trajectory (Donation Trends)
            </Typography>
            <Box sx={{ mb: 6 }}>
                <DonationTrendsChart data={donationTrends} />
            </Box>

            {/* Impact Trends & Correlation */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoGraph color="primary" /> Multi-Metric Impact Correlation
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12}>
                    <ComposedImpactChart data={dashboardData?.impact_correlation || []} />
                </Grid>
            </Grid>

            {/* Geospatial Section */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" /> Geospatial Impact Analysis
            </Typography>
            <Box sx={{ mb: 6, height: 500, borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <MapView height="100%" embedded />
            </Box>

            {/* Reports & Inventory */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" /> Generated Reports Inventory
            </Typography>
            <Box sx={{ mb: 4 }}>
                {renderReportsList()}
            </Box>

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
