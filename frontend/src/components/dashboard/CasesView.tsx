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
    useTheme
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
    HealthAndSafety
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchFamilies, fetchChildren, fetchCases, addFamily, addChild, addCase } from '../../features/cases/casesSlice';
import { SubTabView } from './SubTabView';
import { motion } from 'framer-motion';
import { StatsCard } from './StatCards';
import { KENYA_COUNTIES } from '../../utils/locationData';
import { Select, FormControl, InputLabel } from '@mui/material';

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
    const { families, children, cases, assessments, notes, isLoading } = useSelector((state: RootState) => state.cases);
    const userRole = useSelector((state: RootState) => state.auth.user?.role);
    const isManagement = ['ADMIN', 'MANAGEMENT'].includes(userRole || '');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });

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

    const renderCases = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Active Case Management</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 3, boxShadow: theme.shadows[2], textTransform: 'none', fontWeight: 600 }}
                    startIcon={<NoteAdd />}
                    onClick={() => setOpenDialog({ type: 'case', data: null })}
                >
                    Add New Case
                </Button>
                <IconButton onClick={handleRefresh} color="primary" sx={{ ml: 1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Refresh />
                </IconButton>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Case Reference</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Subject</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Service Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Current Status</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Priority</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cases.map((c: any) => (
                            <TableRow key={c.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{c.case_number}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{c.child_name}</TableCell>
                                <TableCell>{c.case_type}</TableCell>
                                <TableCell>
                                    <StatusChip status={c.status} type="status" />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={`${c.priority} Priority Content`}>
                                        <Box component="span">
                                            <StatusChip status={c.priority} type="priority" />
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

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
                                        onClick={() => setSnackbar({ open: true, message: `Accessing clinical report for ID: ${item.id}`, severity: 'info' })}
                                    >
                                        View Case
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


    const tabsSource = [
        { id: 'cases', label: 'Case Files', icon: <Assignment />, component: renderCases() },
        { id: 'children', label: 'Registry', icon: <ChildCare />, component: renderChildren() },
        { id: 'families', label: 'Families', icon: <FamilyRestroom />, component: renderFamilies() },
        { id: 'assessments', label: 'Assessments', icon: <HealthAndSafety />, component: renderAssessments(), hidden: !isManagement },
        { id: 'case_notes', label: 'Interventions', icon: <HistoryEdu />, component: renderCaseNotes(), hidden: !isManagement },
    ];

    const tabs = tabsSource.filter(tab => !tab.hidden);

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { label: 'Active Case Load', value: cases.length, icon: <Assignment />, color: theme.palette.info.main, delay: 0 },
                    { label: 'Children Protected', value: children.length, icon: <ChildCare />, color: theme.palette.secondary.main, delay: 0.1 },
                    { label: 'Families Supported', value: families.length, icon: <FamilyRestroom />, color: theme.palette.success.main, delay: 0.2 },
                ].map((item, i) => (
                    <Grid item xs={12} md={4} key={i}>
                        <StatsCard
                            title={item.label}
                            value={String(item.value)}
                            icon={item.icon}
                            color={item.color}
                            delay={item.delay}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Premium Search Filter Bar */}
            <Paper sx={{
                p: 1,
                mb: 4,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: theme.shadows[1]
            }}>
                <IconButton sx={{ p: 1.5 }}><Search /></IconButton>
                <InputBase
                    sx={{ ml: 2, flex: 1, fontWeight: 'medium' }}
                    placeholder="Search master registry (Cases, Names, Locations)..."
                />
                <Divider sx={{ height: 32, m: 0.5 }} orientation="vertical" />
                <Button
                    startIcon={<FilterList />}
                    sx={{ ml: 1, px: 3, borderRadius: 3, fontWeight: 'bold', color: 'text.secondary' }}
                >
                    Filter System
                </Button>
            </Paper>

            <SubTabView title="Case Management Operations" tabs={tabs} activeTab={activeTab} />

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
        </Box>
    );
}
