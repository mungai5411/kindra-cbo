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
    Checkbox,
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
    Menu,
    FormControlLabel,
    FormControl,
    InputLabel,
    Select
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
    WarningAmber,
    CloudUpload,
    Description,
    Download,
    Delete
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { 
    fetchFamilies, 
    fetchChildren, 
    fetchCases, 
    addFamily, 
    addChild, 
    addCase, 
    fetchCaseDocuments, 
    addCaseDocument, 
    deleteCaseDocument,
    fetchAssessments,
    fetchCaseNotes,
    addAssessment,
    addCaseNote
} from '../../features/caseManagement/caseManagementSlice';
import { motion } from 'framer-motion';
import { StatsCard } from './StatCards';
import { SummaryHeader } from './SummaryHeader';
import { CaseCard } from './CaseCard';
import { CaseFilterBar } from './CaseFilterBar';
import { KENYA_COUNTIES } from '../../utils/locationData';
import { downloadFile } from '../../utils/downloadHelper';
// Removed colorPsychology import

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
    const { families, children, cases, assessments, caseNotes: notes, documents, isLoading } = useSelector((state: RootState) => state.caseManagement);
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
    
    const [documentForm, setDocumentForm] = useState({
        title: '',
        document_type: 'OTHER',
        family: '',
        file: null as File | null,
        consent_obtained: true
    });

    const [assessmentForm, setAssessmentForm] = useState({
        family: '',
        assessment_type: 'INITIAL',
        assessment_date: new Date().toISOString().split('T')[0],
        economic_score: 5,
        housing_score: 5,
        health_score: 5,
        education_score: 5,
        safety_score: 5,
        findings: '',
        recommendations: '',
        urgent_needs: '',
        next_assessment_date: ''
    });

    const [noteForm, setNoteForm] = useState({
        case: '',
        note: '',
        is_milestone: false
    });

    useEffect(() => {
        const fetchAll = () => {
            dispatch(fetchFamilies());
            dispatch(fetchChildren());
            dispatch(fetchCases());
            dispatch(fetchCaseDocuments());
            dispatch(fetchAssessments());
            dispatch(fetchCaseNotes());
        };
        fetchAll();
        // Automated background sync every 60s â€” no manual button required
        const autoSyncInterval = setInterval(fetchAll, 60000);
        return () => clearInterval(autoSyncInterval);
    }, [dispatch]);

    const handleAddCase = () => {
        if (!caseForm.title || !caseForm.family) {
            setSnackbar({ open: true, message: 'Fill all required fields', severity: 'error' });
            return;
        }

        dispatch(addCase(caseForm)).unwrap().then(() => {
            setOpenDialog({ type: null, data: null });
            setCaseForm({ title: '', description: '', priority: 'MEDIUM', family: '', assigned_to: '', intervention_plan: '' });
            setSnackbar({ open: true, message: 'Case created successfully', severity: 'success' });
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

    const handleUploadDocument = () => {
        if (!documentForm.title || !documentForm.file || !documentForm.family) {
            setSnackbar({ open: true, message: 'Required fields missing', severity: 'error' });
            return;
        }
        
        const formData = new FormData();
        formData.append('title', documentForm.title);
        formData.append('document_type', documentForm.document_type);
        formData.append('family', documentForm.family);
        formData.append('file', documentForm.file);
        formData.append('consent_obtained', String(documentForm.consent_obtained));
        
        dispatch(addCaseDocument(formData)).unwrap().then(() => {
            setOpenDialog({ type: null, data: null });
            setDocumentForm({ title: '', document_type: 'OTHER', family: '', file: null, consent_obtained: true });
            setSnackbar({ open: true, message: 'Document uploaded successfully', severity: 'success' });
        }).catch((err) => {
            setSnackbar({ open: true, message: err || 'Upload failed', severity: 'error' });
        });
    };

    const handleDeleteDocument = (id: string) => {
        dispatch(deleteCaseDocument(id)).unwrap().then(() => {
            setSnackbar({ open: true, message: 'Document deleted', severity: 'success' });
        });
    };

    const handleAddAssessment = () => {
        if (!assessmentForm.family || !assessmentForm.findings) {
            setSnackbar({ open: true, message: 'Family and findings are required', severity: 'error' });
            return;
        }
        dispatch(addAssessment(assessmentForm)).unwrap().then(() => {
            setOpenDialog({ type: null, data: null });
            setAssessmentForm({
                family: '',
                assessment_type: 'INITIAL',
                assessment_date: new Date().toISOString().split('T')[0],
                economic_score: 5,
                housing_score: 5,
                health_score: 5,
                education_score: 5,
                safety_score: 5,
                findings: '',
                recommendations: '',
                urgent_needs: '',
                next_assessment_date: ''
            });
            setSnackbar({ open: true, message: 'Assessment saved', severity: 'success' });
        });
    };

    const handleAddNote = () => {
        if (!noteForm.case || !noteForm.note) {
            setSnackbar({ open: true, message: 'Case and note content required', severity: 'error' });
            return;
        }
        dispatch(addCaseNote(noteForm)).unwrap().then(() => {
            setOpenDialog({ type: null, data: null });
            setNoteForm({ case: '', note: '', is_milestone: false });
            setSnackbar({ open: true, message: 'Note added', severity: 'success' });
        });
    };

    if (isLoading && families.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    const renderCases = () => {
        // Apply filters and search
        const filteredCases = cases.filter((c: any) => {
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
                    title="Case Summary"
                    color={theme.palette.primary.main}
                    metrics={[
                        {
                            label: 'Total Cases',
                            value: cases.length,
                            icon: <Assignment />,
                            color: theme.palette.primary.main
                        },
                        {
                            label: 'Active Cases',
                            value: cases.filter((c: any) => c.status !== 'RESOLVED').length,
                            icon: <ChildCare />,
                            isGood: true,
                            color: theme.palette.success.main
                        },
                        {
                            label: 'Urgent Priority',
                            value: urgentCount,
                            isBad: urgentCount > 0,
                            icon: <WarningAmber />,
                            color: theme.palette.error.main
                        },
                        {
                            label: 'Resolution Rate',
                            value: `${cases.length > 0 ? Math.round((cases.filter((c: any) => c.status === 'RESOLVED').length / cases.length) * 100) : 0}%`,
                            isGood: true,
                            color: theme.palette.success.main
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
                            color: theme.palette.primary.main
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
                            color: theme.palette.error.main
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
                            background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.4)})`
                        }} />
                        Cases
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<NoteAdd />}
                        onClick={() => setOpenDialog({ type: 'case', data: null })}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                            borderRadius: 2
                        }}
                    >
                        Create Case
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
                                    onMenuClick={(e, id) => setMenuAnchor({ el: e.currentTarget as HTMLElement, caseId: id })}
                                    isOverdue={overdueCount > 0}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 1,
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                    }}>
                        <ChildCare sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.4), mb: 1 }} />
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            {searchQuery ? 'No cases match your search' : 'No cases found. Start by adding one!'}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setOpenDialog({ type: 'case', data: null })}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                            }}
                        >
                            Create New Case
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
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Child Registry</Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, borderWidth: 2 }}
                    onClick={() => setOpenDialog({ type: 'child', data: null })}
                >
                    Register Child
                </Button>
            </Box>
            <TableContainer>
                <Table size="small">
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
                                <TableCell sx={{ color: 'text.secondary' }}>{child.age} yrs â€¢ {child.gender}</TableCell>
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
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Family Registry</Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, borderWidth: 2 }}
                    onClick={() => setOpenDialog({ type: 'family', data: null })}
                >
                    Add Family
                </Button>
            </Box>
            <TableContainer>
                <Table size="small">
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
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Assessments</Typography>
                <Button
                    variant="contained"
                    size="medium"
                    startIcon={<HealthAndSafety />}
                    onClick={() => setOpenDialog({ type: 'assessment', data: null })}
                    sx={{ borderRadius: 1, boxShadow: theme.shadows[2], textTransform: 'none', fontWeight: 600 }}
                >
                    New Assessment
                </Button>
            </Box>
            <TableContainer>
                <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Case</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Needs</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Risk Level</TableCell>
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

    const renderDocuments = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Case Documents</Typography>
                <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setOpenDialog({ type: 'document', data: null })}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                    Upload Document
                </Button>
            </Box>
            <TableContainer>
                <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(theme.palette.info.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Document Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Family Unit</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date Added</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {documents.map((doc: any) => (
                            <TableRow key={doc.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Description color="primary" />
                                        <Box>
                                            <Typography variant="body2" fontWeight="600">{doc.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{(doc.file_size / 1024).toFixed(1)} KB â€¢ {doc.file_name}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={doc.document_type} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontSize: '0.65rem', fontWeight: 700 }} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{doc.family_name || 'Associated Unit'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">{new Date(doc.uploaded_at).toLocaleDateString()}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <IconButton size="small" onClick={() => downloadFile(doc.file, doc.file_name)}>
                                            <Download fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteDocument(doc.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {documents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <CloudUpload sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.2, mb: 1 }} />
                                    <Typography color="text.secondary">No legal or medical documents uploaded yet.</Typography>
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
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Intervention Notes</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="text" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Filter Notes</Button>
                    <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<NoteAdd />}
                        onClick={() => setOpenDialog({ type: 'note', data: null })}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        Add Note
                    </Button>
                </Box>
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
                            secondary={`${note.created_by_name || 'System User'} â€¢ ${new Date(note.created_at).toLocaleString()}`}
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
            {activeTab === 'documents' && renderDocuments()}
            {(!activeTab || activeTab === 'case_management') && renderCases()}

            {/* Add Family Dialog */}
            <Dialog open={openDialog.type === 'family'} onClose={() => setOpenDialog({ type: null, data: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Register Family</DialogTitle>
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
                <DialogTitle sx={{ fontWeight: 'bold' }}>Register Child</DialogTitle>
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
                <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Case</DialogTitle>
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
                                    label="Case Worker"
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
                            label="Intervention Plan"
                            value={caseForm.intervention_plan}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaseForm({ ...caseForm, intervention_plan: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDialog({ type: null, data: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddCase} sx={{ borderRadius: 2, px: 3 }}>Create Case</Button>
                </DialogActions>
            </Dialog>

            {/* Upload Document Dialog */}
            <Dialog open={openDialog.type === 'document'} onClose={() => setOpenDialog({ type: null, data: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Upload Document</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Document Title"
                            required
                            placeholder="e.g. Birth Certificate, ID Copy"
                            value={documentForm.title}
                            onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Document Type</InputLabel>
                            <Select
                                value={documentForm.document_type}
                                label="Document Type"
                                onChange={(e) => setDocumentForm({ ...documentForm, document_type: e.target.value as string })}
                                sx={{ borderRadius: 3 }}
                            >
                                <MenuItem value="ID_CARD">ID Card / Passport</MenuItem>
                                <MenuItem value="BIRTH_CERT">Birth Certificate</MenuItem>
                                <MenuItem value="MEDICAL">Medical Report</MenuItem>
                                <MenuItem value="COURT">Legal / Court Order</MenuItem>
                                <MenuItem value="SCHOOL">School Report</MenuItem>
                                <MenuItem value="PHOTO">Photo</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel>Associate with Family</InputLabel>
                            <Select
                                value={documentForm.family}
                                label="Associate with Family"
                                onChange={(e) => setDocumentForm({ ...documentForm, family: e.target.value as string })}
                                sx={{ borderRadius: 3 }}
                            >
                                {families.map((f: any) => (
                                    <MenuItem key={f.id} value={f.id}>{f.primary_contact_name} ({f.family_code})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<CloudUpload />}
                            sx={{ borderRadius: 3, py: 1.5, borderStyle: 'dashed', borderWidth: 2 }}
                        >
                            {documentForm.file ? documentForm.file.name : 'Select File (PDF, Image)'}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files ? e.target.files[0] : null })}
                            />
                        </Button>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                            <Checkbox 
                                size="small" 
                                checked={documentForm.consent_obtained}
                                onChange={(e) => setDocumentForm({ ...documentForm, consent_obtained: e.target.checked })}
                                sx={{ p: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                I confirm that consent has been obtained to store this document.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDialog({ type: null, data: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleUploadDocument} sx={{ borderRadius: 2, px: 3 }}>Start Upload</Button>
                </DialogActions>
            </Dialog>

            {/* Add Assessment Dialog */}
            <Dialog open={openDialog.type === 'assessment'} onClose={() => setOpenDialog({ type: null, data: null })} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>New Psychosocial Assessment</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ pt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Family Unit"
                                required
                                value={assessmentForm.family}
                                onChange={(e) => setAssessmentForm({ ...assessmentForm, family: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                {families.map((f: any) => (
                                    <MenuItem key={f.id} value={f.id}>{f.primary_contact_name} ({f.family_code})</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Assessment Type"
                                value={assessmentForm.assessment_type}
                                onChange={(e) => setAssessmentForm({ ...assessmentForm, assessment_type: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                <MenuItem value="INITIAL">Initial Assessment</MenuItem>
                                <MenuItem value="FOLLOW_UP">Follow-up</MenuItem>
                                <MenuItem value="ANNUAL">Annual Review</MenuItem>
                                <MenuItem value="EMERGENCY">Emergency</MenuItem>
                            </TextField>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Vulnerability Indicators (0-10 Scale)</Typography>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Economic Status', key: 'economic_score' },
                                    { label: 'Housing / Living', key: 'housing_score' },
                                    { label: 'Health / Nutrition', key: 'health_score' },
                                    { label: 'Education Access', key: 'education_score' },
                                    { label: 'Safety / Protection', key: 'safety_score' }
                                ].map((score) => (
                                    <Grid item xs={12} sm={4} key={score.key}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label={score.label}
                                            value={(assessmentForm as any)[score.key]}
                                            onChange={(e) => setAssessmentForm({ ...assessmentForm, [score.key]: parseInt(e.target.value) })}
                                            inputProps={{ min: 0, max: 10 }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Key Findings"
                                required
                                value={assessmentForm.findings}
                                onChange={(e) => setAssessmentForm({ ...assessmentForm, findings: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Recommendations"
                                value={assessmentForm.recommendations}
                                onChange={(e) => setAssessmentForm({ ...assessmentForm, recommendations: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Urgent Needs"
                                value={assessmentForm.urgent_needs}
                                onChange={(e) => setAssessmentForm({ ...assessmentForm, urgent_needs: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog({ type: null, data: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddAssessment} sx={{ borderRadius: 2, px: 3 }}>Save Assessment</Button>
                </DialogActions>
            </Dialog>

            {/* Add Case Note Dialog */}
            <Dialog open={openDialog.type === 'note'} onClose={() => setOpenDialog({ type: null, data: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Add Case Progress Note</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            select
                            label="Select Case"
                            required
                            value={noteForm.case}
                            onChange={(e) => setNoteForm({ ...noteForm, case: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            {cases.map((c: any) => (
                                <MenuItem key={c.id} value={c.id}>{c.case_number} - {c.child_name || c.family_name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Intervention Note"
                            required
                            value={noteForm.note}
                            onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={noteForm.is_milestone} 
                                    onChange={(e) => setNoteForm({ ...noteForm, is_milestone: e.target.checked })} 
                                />
                            }
                            label="Mark as significant milestone"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog({ type: null, data: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddNote} sx={{ borderRadius: 2, px: 3 }}>Save Note</Button>
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
