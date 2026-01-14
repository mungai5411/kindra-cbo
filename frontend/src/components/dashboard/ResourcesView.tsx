import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
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
    Button,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
    Snackbar,
    Alert
} from '@mui/material';
import { Add, Delete, LocalShipping, CheckCircle, Inventory, AssignmentTurnedIn } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import {
    fetchResources,
    addResource,
    deleteResource,
    fetchResourceRequests,
    addResourceRequest,
    updateResourceRequest
} from '../../features/resources/resourcesSlice';
import { fetchShelters } from '../../features/volunteers/volunteersSlice';

export function ResourcesView() {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { resources, resourceRequests } = useSelector((state: RootState) => state.resources);
    const { shelters } = useSelector((state: RootState) => state.volunteers);
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'MANAGEMENT';
    const isShelter = user?.role === 'SHELTER_PARTNER';

    const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
    const [resourceForm, setResourceForm] = useState({
        shelter_home: '',
        resource_type: 'FOOD',
        name: '',
        description: '',
        quantity: 0,
        unit: 'pieces',
        minimum_quantity: 0,
        expiry_date: '',
        is_available: true
    });
    const [requestForm, setRequestForm] = useState({
        shelter_home: '',
        item_category: 'FOOD',
        items_description: '',
        priority: 'MEDIUM',
        needed_by: ''
    });

    useEffect(() => {
        dispatch(fetchResources());
        dispatch(fetchResourceRequests());
        dispatch(fetchShelters());
    }, [dispatch]);

    const handleAddResource = () => {
        if (!resourceForm.name || !resourceForm.shelter_home) {
            setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
            return;
        }
        dispatch(addResource(resourceForm)).unwrap()
            .then(() => {
                setResourceDialogOpen(false);
                setResourceForm({
                    shelter_home: '',
                    resource_type: 'FOOD',
                    name: '',
                    description: '',
                    quantity: 0,
                    unit: 'pieces',
                    minimum_quantity: 0,
                    expiry_date: '',
                    is_available: true
                });
                setSnackbar({ open: true, message: 'Resource added successfully', severity: 'success' });
            })
            .catch(() => setSnackbar({ open: true, message: 'Failed to add resource', severity: 'error' }));
    };

    const handleAddRequest = () => {
        if (!requestForm.items_description || !requestForm.shelter_home) {
            setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
            return;
        }
        dispatch(addResourceRequest(requestForm)).unwrap()
            .then(() => {
                setRequestDialogOpen(false);
                setRequestForm({
                    shelter_home: '',
                    item_category: 'FOOD',
                    items_description: '',
                    priority: 'MEDIUM',
                    needed_by: ''
                });
                setSnackbar({ open: true, message: 'Request submitted successfully', severity: 'success' });
            })
            .catch(() => setSnackbar({ open: true, message: 'Failed to submit request', severity: 'error' }));
    };

    const handleApproveRequest = (id: string) => {
        dispatch(updateResourceRequest({ id, data: { status: 'APPROVED' } })).unwrap()
            .then(() => setSnackbar({ open: true, message: 'Request approved', severity: 'success' }))
            .catch(() => setSnackbar({ open: true, message: 'Failed to approve request', severity: 'error' }));
    };

    const handleScheduleDelivery = (id: string) => {
        const deliveryDate = prompt('Enter delivery date (YYYY-MM-DD):');
        if (deliveryDate) {
            dispatch(updateResourceRequest({ id, data: { status: 'IN_TRANSIT', needed_by: deliveryDate } })).unwrap()
                .then(() => setSnackbar({ open: true, message: 'Delivery scheduled', severity: 'success' }))
                .catch(() => setSnackbar({ open: true, message: 'Failed to schedule delivery', severity: 'error' }));
        }
    };

    const handleMarkDelivered = (id: string) => {
        dispatch(updateResourceRequest({ id, data: { status: 'DELIVERED' } })).unwrap()
            .then(() => setSnackbar({ open: true, message: 'Marked as delivered', severity: 'success' }))
            .catch(() => setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' }));
    };

    const handleDeleteResource = (id: string) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            dispatch(deleteResource(id)).unwrap()
                .then(() => setSnackbar({ open: true, message: 'Resource deleted', severity: 'success' }))
                .catch(() => setSnackbar({ open: true, message: 'Failed to delete resource', severity: 'error' }));
        }
    };

    const StatusChip = ({ status }: { status: string }) => {
        const colors: Record<string, any> = {
            PENDING: { bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.dark' },
            APPROVED: { bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.dark' },
            IN_TRANSIT: { bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.dark' },
            DELIVERED: { bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.dark' },
            REJECTED: { bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.dark' },
        };
        const style = colors[status] || colors.PENDING;
        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    fontWeight: 600,
                    bgcolor: style.bgcolor,
                    color: style.color,
                    borderRadius: '6px'
                }}
            />
        );
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />
                    Material Resources Management
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Manage inventory and coordinate material distributions to shelter homes
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Total Resources</Typography>
                            <Typography variant="h3" color="primary.main">{resources.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Pending Requests</Typography>
                            <Typography variant="h3" color="warning.main">
                                {resourceRequests.filter((r: any) => r.status === 'PENDING').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>In Transit</Typography>
                            <Typography variant="h3" color="info.main">
                                {resourceRequests.filter((r: any) => r.status === 'IN_TRANSIT').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {isAdmin && (
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">Inventory Management</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setResourceDialogOpen(true)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Add Resource
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Resource</TableCell>
                                    <TableCell>Shelter</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {resources.map((resource: any) => (
                                    <TableRow key={resource.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{resource.name}</TableCell>
                                        <TableCell>{resource.shelter_name || '-'}</TableCell>
                                        <TableCell><Chip label={resource.resource_type} size="small" variant="outlined" /></TableCell>
                                        <TableCell>{resource.quantity} {resource.unit}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={resource.is_available ? 'Available' : 'Unavailable'}
                                                size="small"
                                                color={resource.is_available ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteResource(resource.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {resources.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No resources available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {isAdmin ? 'Resource Requests & Distribution' : 'My Requests'}
                    </Typography>
                    {isShelter && (
                        <Button
                            variant="contained"
                            startIcon={<AssignmentTurnedIn />}
                            onClick={() => setRequestDialogOpen(true)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Request Supplies
                        </Button>
                    )}
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Category</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Shelter</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Needed By</TableCell>
                                {isAdmin && <TableCell align="right">Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {resourceRequests.map((request: any) => (
                                <TableRow key={request.id} hover>
                                    <TableCell><Chip label={request.item_category} size="small" variant="outlined" /></TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>{request.items_description}</TableCell>
                                    <TableCell>{request.shelter_name || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={request.priority}
                                            size="small"
                                            color={request.priority === 'URGENT' || request.priority === 'HIGH' ? 'error' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell><StatusChip status={request.status} /></TableCell>
                                    <TableCell>{request.needed_by || '-'}</TableCell>
                                    {isAdmin && (
                                        <TableCell align="right">
                                            {request.status === 'PENDING' && (
                                                <>
                                                    <Tooltip title="Approve">
                                                        <IconButton size="small" color="success" onClick={() => handleApproveRequest(request.id)}>
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Schedule Delivery">
                                                        <IconButton size="small" color="primary" onClick={() => handleScheduleDelivery(request.id)}>
                                                            <LocalShipping fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            {request.status === 'IN_TRANSIT' && (
                                                <Tooltip title="Mark Delivered">
                                                    <IconButton size="small" color="success" onClick={() => handleMarkDelivered(request.id)}>
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {resourceRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 7 : 6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No requests found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={resourceDialogOpen} onClose={() => setResourceDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Shelter Home</InputLabel>
                            <Select
                                value={resourceForm.shelter_home}
                                onChange={(e) => setResourceForm({ ...resourceForm, shelter_home: e.target.value })}
                            >
                                {shelters.map((s: any) => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Resource Type</InputLabel>
                            <Select
                                value={resourceForm.resource_type}
                                onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
                            >
                                <MenuItem value="FOOD">Food</MenuItem>
                                <MenuItem value="CLOTHING">Clothing</MenuItem>
                                <MenuItem value="MEDICAL">Medical Supplies</MenuItem>
                                <MenuItem value="EDUCATIONAL">Educational Materials</MenuItem>
                                <MenuItem value="BEDDING">Bedding</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Resource Name"
                            value={resourceForm.name}
                            onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={2}
                            value={resourceForm.description}
                            onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    type="number"
                                    value={resourceForm.quantity}
                                    onChange={(e) => setResourceForm({ ...resourceForm, quantity: parseInt(e.target.value) || 0 })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Unit"
                                    value={resourceForm.unit}
                                    onChange={(e) => setResourceForm({ ...resourceForm, unit: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            label="Minimum Quantity (Alert Level)"
                            type="number"
                            value={resourceForm.minimum_quantity}
                            onChange={(e) => setResourceForm({ ...resourceForm, minimum_quantity: parseInt(e.target.value) || 0 })}
                        />
                        <TextField
                            fullWidth
                            label="Expiry Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={resourceForm.expiry_date}
                            onChange={(e) => setResourceForm({ ...resourceForm, expiry_date: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResourceDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddResource} variant="contained">Add Resource</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Request Supplies</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Shelter Home</InputLabel>
                            <Select
                                value={requestForm.shelter_home}
                                onChange={(e) => setRequestForm({ ...requestForm, shelter_home: e.target.value })}
                            >
                                {shelters.map((s: any) => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Item Category</InputLabel>
                            <Select
                                value={requestForm.item_category}
                                onChange={(e) => setRequestForm({ ...requestForm, item_category: e.target.value })}
                            >
                                <MenuItem value="FOOD">Food</MenuItem>
                                <MenuItem value="CLOTHING">Clothing</MenuItem>
                                <MenuItem value="MEDICAL">Medical Supplies</MenuItem>
                                <MenuItem value="EDUCATIONAL">Educational Materials</MenuItem>
                                <MenuItem value="BEDDING">Bedding</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Items Description"
                            multiline
                            rows={3}
                            value={requestForm.items_description}
                            onChange={(e) => setRequestForm({ ...requestForm, items_description: e.target.value })}
                            placeholder="List the items you need and specific details..."
                        />
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={requestForm.priority}
                                onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                            >
                                <MenuItem value="LOW">Low</MenuItem>
                                <MenuItem value="MEDIUM">Medium</MenuItem>
                                <MenuItem value="HIGH">High</MenuItem>
                                <MenuItem value="URGENT">Urgent</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Needed By"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={requestForm.needed_by}
                            onChange={(e) => setRequestForm({ ...requestForm, needed_by: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddRequest} variant="contained">Submit Request</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
