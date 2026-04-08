import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    Grid,
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Button,
    InputBase,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Tooltip,
    Divider,
    Snackbar,
    useTheme,
    Menu
} from '@mui/material';
import {
    Search,
    FilterList,
    ChildCare,
    FamilyRestroom,
    Assignment,
    NoteAdd,
    HistoryEdu,
    Refresh,
    HealthAndSafety,
    Edit,
    MoreVert,
    WarningAmber
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchFamilies, fetchChildren, fetchCases, addFamily, addChild, addCase } from '../../features/caseManagement/caseManagementSlice';
import { motion } from 'framer-motion';
import { StatsCard } from './StatCards';
import { SummaryHeader } from './SummaryHeader';
import { CaseCard } from './CaseCard';
import { CaseFilterBar } from './CaseFilterBar';
import { KENYA_COUNTIES } from '../../utils/locationData';
import { downloadFile } from '../../utils/downloadHelper';
import { Select, FormControl, InputLabel } from '@mui/material';
import { colorPsychology } from '../../theme/colorPsychology';

// Reusable Status Chip for consistency
const StatusChip = ({ status, type = 'status' }: { status: string, type?: 'status' | 'priority' }) => {
    const theme = useTheme();

    let color: any = 'success';
    let bgcolor = alpha(theme.palette.success.main, 0.1);
    let textColor = theme.palette.success.dark;

    const lowerStatus = status.toLowerCase();

    if (type === 'status') {
        if (lowerStatus === 'open' || lowerStatus === 'active') {
            color = 'info';
            bgcolor = alpha(theme.palette.info.main, 0.1);
            textColor = theme.palette.info.main;
        } else if (lowerStatus === 'closed' || lowerStatus === 'resolved') {
            color = 'success';
            bgcolor = alpha(theme.palette.success.main, 0.1);
            textColor = theme.palette.success.dark;
        } else if (lowerStatus === 'pending') {
            color = 'warning';
            bgcolor = alpha(theme.palette.warning.main, 0.1);
            textColor = theme.palette.warning.main;
        }
    } else if (type === 'priority') {
        if (lowerStatus === 'high' || lowerStatus === 'critical') {
            color = 'error';
            bgcolor = alpha(theme.palette.error.main, 0.1);
            textColor = theme.palette.error.main;
        } else if (lowerStatus === 'medium') {
            color = 'warning';
            bgcolor = alpha(theme.palette.warning.main, 0.1);
            textColor = theme.palette.warning.main;
        } else {
            color = 'success';
            bgcolor = alpha(theme.palette.success.main, 0.1);
            textColor = theme.palette.success.main;
        }
    }

    return (
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: bgcolor,
                color: textColor,
                fontWeight: 700,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(typeof color === 'string' && theme.palette[color as keyof typeof theme.palette] ? (theme.palette[color as keyof typeof theme.palette] as any).main : textColor, 0.2),
                '& .MuiChip-label': { px: 1.5 }
            }}
        />
    );
};

export function CasesView({ activeTab }: { activeTab?: string }) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { families, children, cases, assessments, caseNotes: notes, isLoading } = useSelector((state: RootState) => state.caseManagement);
    const userRole = useSelector((state: RootState) => state.auth.user?.role);
    const isManagement = ['ADMIN', 'MANAGEMENT'].includes(userRole || '');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement | null; caseId: string }>({ el: null, caseId: '' });

    // New Data Entry State
    const [openDialog, setOpenDialog] = useState<{ type: string | null, data: any }>({ type: null, data: null });
    const [caseForm, setCaseForm] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        family: '',
        assigned_to: '',
        intervention_plan: ''
    });

    const [familyForm, setFamilyForm] = useState({
        primary_contact_name: '',
        primary_contact_phone: '',
        primary_contact_relationship: 'Parent',
        county: '',
        sub_county: '',
        vulnerability_score: 50,
        physical_address: ''
    });

    const [childForm, setChildForm] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '2015-01-01',
        gender: 'M',
        legal_status: 'WITH_PARENTS',
        family: ''
    });

    useEffect(() => {
        dispatch(fetchFamilies());
        dispatch(fetchChildren());
        dispatch(fetchCases());
        // Load initial assessments and notes if possible, or lazy load in tabs
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(fetchFamilies());
        dispatch(fetchChildren());
        dispatch(fetchCases());
    };

    const handleAddCase = () => {
        if (!caseForm.title || !caseForm.family) {
            setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'error' });
            return;
        }

        dispatch(addCase(caseForm)).unwrap().then(() => {
            setOpenDialog({ type: null, data: null });
            setCaseForm({ title: '', description: '', priority: 'MEDIUM', family: '', assigned_to: '', intervention_plan: '' });
            setSnackbar({ open: true, message: 'Case deployed successfully', severity: 'success' });
        }).catch((err) => {
            setSnackbar({ open: true, message: err || 'Failed to create case', severity: 'error' });
        });
    };

    const handleAddFamily = () => {
        if (!familyForm.primary_contact_name || !familyForm.county) {
            setSnackbar({ open: true, message: 'Required fields missing', severity: 'error' });
            return;
        }
        dispatch(addFamily(familyForm)).unwrap().then(() => {
            setOpenDialog({ type: null, data: null });
            setFamilyForm({ primary_contact_name: '', primary_contact_phone: '', primary_contact_relationship: 'Parent', county: '', sub_county: '', vulnerability_score: 50, physical_address: '' });
            setSnackbar({ open: true, message: 'Family registered successfully', severity: 'success' });
        });
    };

    const handleAddChild = () => {
        if (!childForm.first_name || !childForm.family) {
            setSnackbar({ open: true, message: 'Required fields missing', severity: 'error' });
            return;
        }
        dispatch(addChild(childForm)).unwrap().then(() => {
            setOpenDialog({ type: null, data: null });
            setChildForm({ first_name: '', last_name: '', date_of_birth: '2015-01-01', gender: 'M', legal_status: 'WITH_PARENTS', family: '' });
            setSnackbar({ open: true, message: 'Child registered successfully', severity: 'success' });
        });
    };

    if (isLoading && families.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
    }

    const renderCases = () => {
        // Apply filters and search
        let filteredCases = cases.filter((c: any) => {
            // Search query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matches = 
                    c.case_number?.toLowerCase().includes(q) ||
                    c.child_name?.toLowerCase().includes(q) ||
                    c.family_name?.toLowerCase().includes(q);
                if (!matches) return false;
            }

            // Status filter
            if (filters.status?.length && !filters.status.includes(c.status)) return false;
            
            // Priority filter
            if (filters.priority?.length && !filters.priority.includes(c.priority)) return false;

            return true;
        });

        // Calculate metrics
        const urgentCount = filteredCases.filter((c: any) => c.priority === 'CRITICAL' || c.priority === 'HIGH').length;
        const overdueCount = filteredCases.filter((c: any) => {
            const createdDate = new Date(c.created_at);
            const daysPending = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysPending > 14;
        }).length;

        return (
            <Box>
                {/* Summary Header with Key Metrics */}
                <SummaryHeader
                    title="Case Management Summary"
                    color={colorPsychology.programs.cases.primary}
                    metrics={[
                        {
                            label: 'Total Cases',
                            value: cases.length,
                            icon: <Assignment />,
                            color: colorPsychology.programs.cases.primary
                        },
                        {
                            label: 'Active Cases',
                            value: cases.filter((c: any) => c.status !== 'RESOLVED').length,
                            icon: <ChildCare />,
                            isGood: true,
                            color: colorPsychology.status.success.primary
                        },
                        {
                            label: 'Urgent Priority',
                            value: urgentCount,
                            isBad: urgentCount > 0,
                            icon: <WarningAmber />,
                            color: colorPsychology.status.critical.primary
                        },
                        {
                            label: 'Resolution Rate',
                            value: `${cases.length > 0 ? Math.round((cases.filter((c: any) => c.status === 'RESOLVED').length / cases.length) * 100) : 0}%`,
                            isGood: true,
                            color: colorPsychology.status.success.primary
                        }
                    ]}
                />

                {/* Advanced Filter Bar */}
                <CaseFilterBar
                    onFilterChange={setFilters}
                    onSearch={setSearchQuery}
                    totalResults={cases.length}
                    filteredResults={filteredCases.length}
                    urgentCount={urgentCount}
                    overdueCount={overdueCount}
                    filterGroups={[
                        {
                            name: 'Status',
                            key: 'status',
                            options: [
                                { label: 'Open', value: 'OPEN', count: cases.filter((c: any) => c.status === 'OPEN').length },
                                { label: 'In Progress', value: 'IN_PROGRESS', count: cases.filter((c: any) => c.status === 'IN_PROGRESS').length },
                                { label: 'Resolved', value: 'RESOLVED', count: cases.filter((c: any) => c.status === 'RESOLVED').length },
                                { label: 'Closed', value: 'CLOSED', count: cases.filter((c: any) => c.status === 'CLOSED').length }
                            ],
                            color: colorPsychology.programs.cases.primary
                        },
                        {
                            name: 'Priority',
                            key: 'priority',
                            options: [
                                { label: 'Critical', value: 'CRITICAL', count: cases.filter((c: any) => c.priority === 'CRITICAL').length },
                                { label: 'High', value: 'HIGH', count: cases.filter((c: any) => c.priority === 'HIGH').length },
                                { label: 'Medium', value: 'MEDIUM', count: cases.filter((c: any) => c.priority === 'MEDIUM').length },
                                { label: 'Low', value: 'LOW', count: cases.filter((c: any) => c.priority === 'LOW').length }
                            ],
                            color: colorPsychology.priority.critical.primary
                        }
                    ]}
                />

                {/* Add Case Button */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 4,
                            height: 24,
                            borderRadius: 2,
                            background: `linear-gradient(180deg, ${colorPsychology.programs.cases.primary}, ${alpha(colorPsychology.programs.cases.primary, 0.4)})`
                        }} />
                        Cases
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<NoteAdd />}
                        onClick={() => setOpenDialog({ type: 'case', data: null })}
                        sx={{
                            background: `linear-gradient(135deg, ${colorPsychology.programs.cases.primary}, ${colorPsychology.programs.cases.light})`,
                            borderRadius: 2
                        }}
                    >
                        Add New Case
                    </Button>
                </Box>

                {/* Cases Grid - Card Layout */}
                {filteredCases.length > 0 ? (
                    <Grid container spacing={2.5}>
                        {filteredCases.map((caseData: any, index: number) => (
                            <Grid item xs={12} sm={6} lg={4} key={caseData.id}>
                                <CaseCard
                                    case={{
                                        id: caseData.id,
                                        case_number: caseData.case_number,
                                        child_name: caseData.child_name,
                                        family_name: caseData.family_name,
                                        status: caseData.status,
                                        priority: caseData.priority,
                                        description: caseData.description,
                                        created_at: caseData.created_at,
                                        assigned_worker: caseData.assigned_to,
                                        milestones_completed: caseData.milestones_completed,
                                        milestones_total: caseData.milestones_total,
                                        days_pending: Math.floor((Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24)),
                                        next_action: caseData.next_action,
                                        next_action_date: caseData.next_action_date
                                    }}
                                    onEdit={(id) => console.log('Edit case:', id)}
                                    onAssignVolunteer={(id) => console.log('Assign volunteer:', id)}
                                    onAllocateFunds={(id) => console.log('Allocate funds:', id)}
                                    onMenuClick={(e, id) => setMenuAnchor({ el: e.currentTarget, caseId: id })}
                                    isOverdue={overdueCount > 0}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: `2px dashed ${alpha(colorPsychology.programs.cases.primary, 0.2)}`
                    }}>
                        <ChildCare sx={{ fontSize: 48, color: alpha(colorPsychology.programs.cases.primary, 0.4), mb: 1 }} />
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            {searchQuery ? 'No cases match your search' : 'No cases found. Start by adding one!'}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setOpenDialog({ type: 'case', data: null })}
                            sx={{
                                background: `linear-gradient(135deg, ${colorPsychology.programs.cases.primary}, ${colorPsychology.programs.cases.light})`
                            }}
                        >
                            Create First Case
                        </Button>
                    </Paper>
                )}

                {/* Case Menu */}
                <Menu
                    anchorEl={menuAnchor.el}
                    open={Boolean(menuAnchor.el)}
                    onClose={() => setMenuAnchor({ el: null, caseId: '' })}
                >
                    <MenuItem onClick={() => {
                        console.log('Edit case:', menuAnchor.caseId);
                        setMenuAnchor({ el: null, caseId: '' });
                    }}>
                        <Edit sx={{ mr: 1, fontSize: '1.25rem' }} />
                        Edit Case
                    </MenuItem>
                    <MenuItem onClick={() => {
                        console.log('View details:', menuAnchor.caseId);
                        setMenuAnchor({ el: null, caseId: '' });
                    }}>
                        View Details
                    </MenuItem>
                </Menu>
            </Box>
        );
    };

    const renderChildren = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Protected Children Registry</Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, borderWidth: 2 }}
                    onClick={() => setOpenDialog({ type: 'child', data: null })}
                >
                    Register Child
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Full Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Age / Demographics</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Primary Contact</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Protection Level</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {children.map((child: any) => (
                            <TableRow key={child.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 600 }}>{child.first_name} {child.last_name}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{child.age} yrs • {child.gender}</TableCell>
                                <TableCell>{child.family_name || 'Guardian Registered'}</TableCell>
                                <TableCell><Chip label={child.status || 'Verified'} size="small" variant="outlined" sx={{ borderRadius: 2 }} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderFamilies = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Household Support Units</Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, borderWidth: 2 }}
                    onClick={() => setOpenDialog({ type: 'family', data: null })}
                >
                    Add Family Case
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.success.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Head of Household</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Contact Point</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Neighborhood</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>Active Cases</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {families.map((fam: any) => (
                            <TableRow key={fam.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 600 }}>{fam.primary_contact_name}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{fam.primary_contact_phone}</TableCell>
                                <TableCell>{fam.ward || fam.county || 'Central Ward'}</TableCell>
                                <TableCell align="center">
                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem', mx: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 'bold' }}>
                                        {fam.children_count || 0}
                                    </Avatar>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderAssessments = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Psychosocial Assessments</Typography>
                <Button
                    variant="contained"
                    size="medium"
                    startIcon={<HealthAndSafety />}
                    sx={{ borderRadius: 3, boxShadow: theme.shadows[2], textTransform: 'none', fontWeight: 600 }}
                >
                    New Assessment
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Subject</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Assessment Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Core Needs</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Risk Profile</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assessments.map((item: any, i: number) => (
                            <TableRow key={item.id || i} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 600 }}>{item.family_name || 'Family Registry'}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{item.assessment_date}</TableCell>
                                <TableCell>{item.assessment_type}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={item.overall_score > 70 ? 'CRITICAL' : item.overall_score > 40 ? 'EMERGING' : 'STABLE'}
                                        size="small"
                                        color={item.overall_score > 70 ? 'error' : item.overall_score > 40 ? 'warning' : 'success'}
                                        sx={{ borderRadius: 2, fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                        onClick={async () => {
                                            try {
                                                const url = `/cases/assessments/${item.id}/export-pdf/`;
                                                await downloadFile(url, `Assessment_${item.id.substring(0, 8)}.pdf`);
                                            } catch (err) {
                                                setSnackbar({ open: true, message: 'Failed to download assessment.', severity: 'error' });
                                            }
                                        }}
                                    >
                                        Export PDF
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {assessments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    No psychosocial assessments recorded.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderCaseNotes = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Clinical Intervention Notes</Typography>
                <Button variant="text" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Filter by Origin</Button>
            </Box>
            <List sx={{ p: 0 }}>
                {notes.map((note: any, i: number) => (
                    <ListItem key={note.id || i} divider={i !== notes.length - 1} sx={{ py: 2.5, px: 3, '&:hover': { bgcolor: 'action.hover' } }}>
                        <ListItemIcon sx={{ minWidth: 48 }}>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                <HistoryEdu color={note.is_milestone ? "error" : "primary"} />
                            </Avatar>
                        </ListItemIcon>
                        <ListItemText
                            primary={note.note}
                            secondary={`${note.created_by_name || 'System User'} • ${new Date(note.created_at).toLocaleString()}`}
                            primaryTypographyProps={{ fontWeight: 600 }}
                        />
                    </ListItem>
                ))}
                {notes.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No intervention notes found for this subject.</Typography>
                    </Box>
                )}
            </List>
        </Paper>
    );



    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {activeTab === 'cases' && renderCases()}
            {activeTab === 'children' && renderChildren()}
            {activeTab === 'families' && renderFamilies()}
            {activeTab === 'assessments' && renderAssessments()}
            {activeTab === 'case_notes' && renderCaseNotes()}
            {(!activeTab || activeTab === 'case_management') && renderCases()}

            {/* Add Family Dialog */}
            <Dialog open={openDialog.type === 'family'} onClose={() => setOpenDialog({ type: null, data: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Register Family Unit</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Primary Contact Name"
                            required
                            value={familyForm.primary_contact_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFamilyForm({ ...familyForm, primary_contact_name: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={familyForm.primary_contact_phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFamilyForm({ ...familyForm, primary_contact_phone: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>County</InputLabel>
                                    <Select
                                        value={familyForm.county}
                                        label="County"
                                        onChange={(e) => setFamilyForm({ ...familyForm, county: e.target.value as string, sub_county: '' })}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        {KENYA_COUNTIES.map(c => (
                                            <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Sub-County</InputLabel>
                                    <Select
                                        value={familyForm.sub_county}
                                        label="Sub-County"
                                        disabled={!familyForm.county}
                                        onChange={(e) => setFamilyForm({ ...familyForm, sub_county: e.target.value as string })}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        {KENYA_COUNTIES.find(c => c.name === familyForm.county)?.sub_counties.map(sc => (
                                            <MenuItem key={sc} value={sc}>{sc}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Physical Address"
                            value={familyForm.physical_address}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFamilyForm({ ...familyForm, physical_address: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDialog({ type: null, data: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddFamily} sx={{ borderRadius: 2, px: 3 }}>Register Family</Button>
                </DialogActions>
            </Dialog>

            {/* Add Child Dialog */}
            <Dialog open={openDialog.type === 'child'} onClose={() => setOpenDialog({ type: null, data: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Register Protected Child</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    required
                                    value={childForm.first_name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChildForm({ ...childForm, first_name: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={childForm.last_name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChildForm({ ...childForm, last_name: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            select
                            label="Family Unit"
                            required
                            value={childForm.family}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChildForm({ ...childForm, family: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            {families.map((f: any) => (
                                <MenuItem key={f.id} value={f.id}>{f.primary_contact_name} ({f.family_code})</MenuItem>
                            ))}
                        </TextField>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date of Birth"
                                    value={childForm.date_of_birth}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChildForm({ ...childForm, date_of_birth: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Gender"
                                    value={childForm.gender}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChildForm({ ...childForm, gender: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="M">Male</MenuItem>
                                    <MenuItem value="F">Female</MenuItem>
                                    <MenuItem value="O">Other</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDialog({ type: null, data: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddChild} sx={{ borderRadius: 2, px: 3 }}>Register Child</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDialog.type === 'case'} onClose={() => setOpenDialog({ type: null, data: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Deploy New Case</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Case Title"
                            required
                            value={caseForm.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaseForm({ ...caseForm, title: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Associated Family"
                            required
                            value={caseForm.family}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaseForm({ ...caseForm, family: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            {families.map((f: any) => (
                                <MenuItem key={f.id} value={f.id}>{f.primary_contact_name} ({f.family_code})</MenuItem>
                            ))}
                        </TextField>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Priority"
                                    value={caseForm.priority}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaseForm({ ...caseForm, priority: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="LOW">Low</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="URGENT">Urgent</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Assigned Worker"
                                    value={caseForm.assigned_to}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaseForm({ ...caseForm, assigned_to: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    {/* Ideally would fetch users with CASE_WORKER role here */}
                                    <MenuItem value=""><em>Auto-assign</em></MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Case Description"
                            value={caseForm.description}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaseForm({ ...caseForm, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Initial Intervention Plan"
                            value={caseForm.intervention_plan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaseForm({ ...caseForm, intervention_plan: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDialog({ type: null, data: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddCase} sx={{ borderRadius: 2, px: 3 }}>Deploy Case</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity as any} sx={{ width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box >
    );
}
