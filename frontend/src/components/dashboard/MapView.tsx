import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
    Box, Paper, Typography, useTheme, alpha, Chip, Divider, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    MenuItem, CircularProgress, Alert, Stack
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { LocationOn, Edit, Delete, Close } from '@mui/icons-material';
import { updateFamily, deleteFamily, updateCase, deleteCase, fetchFamilies, fetchCases } from '../../features/caseManagement/caseManagementSlice';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for Families and Shelters
const createCustomIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); color: white; display: flex;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
};

const familyIcon = createCustomIcon('#2e7d32'); // Green
const shelterIcon = createCustomIcon('#0288d1'); // Blue
const caseIcon = createCustomIcon('#fbc02d'); // Yellow

// Family Details Dialog Component
const FamilyDetailsDialog: React.FC<{
    open: boolean;
    family: any;
    onClose: () => void;
    onEdit: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
    counties: string[];
}> = ({ open, family, onClose, onEdit, onDelete, isLoading, counties }) => {
    const [formData, setFormData] = useState<any>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (family) {
            setFormData(family);
            setIsEditing(false);
        }
    }, [family]);

    const handleSave = async () => {
        await onEdit(family.id, formData);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this family?')) {
            await onDelete(family.id);
            onClose();
        }
    };

    if (!family) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    {isEditing ? 'Edit Family' : 'Family Details'} - {family.family_code}
                </Typography>
                <Button onClick={onClose} size="small" variant="text">
                    <Close />
                </Button>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Stack spacing={2}>
                    {!isEditing ? (
                        <>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Family Code</Typography>
                                <Typography variant="body2" fontWeight="bold">{family.family_code}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Primary Contact</Typography>
                                <Typography variant="body2" fontWeight="bold">{family.primary_contact_name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Phone</Typography>
                                <Typography variant="body2">{family.primary_contact_phone}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Vulnerability Level</Typography>
                                <Chip label={family.vulnerability_level} color={family.vulnerability_level === 'CRITICAL' ? 'error' : 'warning'} size="small" sx={{ mt: 0.5 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Location</Typography>
                                <Typography variant="body2">{family.county} County, {family.sub_county}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Family Members</Typography>
                                <Typography variant="body2">{family.total_members} members ({family.children_count} children, {family.adults_count} adults)</Typography>
                            </Box>
                            {family.monthly_income && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Monthly Income</Typography>
                                    <Typography variant="body2">KES {family.monthly_income}</Typography>
                                </Box>
                            )}
                        </>
                    ) : (
                        <>
                            <TextField
                                label="Contact Name"
                                value={formData.primary_contact_name || ''}
                                onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Phone"
                                value={formData.primary_contact_phone || ''}
                                onChange={(e) => setFormData({ ...formData, primary_contact_phone: e.target.value })}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="County"
                                select
                                value={formData.county || ''}
                                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                                fullWidth
                                size="small"
                            >
                                {counties.map(county => (
                                    <MenuItem key={county} value={county}>{county}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Vulnerability Level"
                                select
                                value={formData.vulnerability_level || 'MEDIUM'}
                                onChange={(e) => setFormData({ ...formData, vulnerability_level: e.target.value })}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="LOW">Low Risk</MenuItem>
                                <MenuItem value="MEDIUM">Medium Risk</MenuItem>
                                <MenuItem value="HIGH">High Risk</MenuItem>
                                <MenuItem value="CRITICAL">Critical</MenuItem>
                            </TextField>
                            <TextField
                                label="Total Members"
                                type="number"
                                value={formData.total_members || 0}
                                onChange={(e) => setFormData({ ...formData, total_members: parseInt(e.target.value) })}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Children Count"
                                type="number"
                                value={formData.children_count || 0}
                                onChange={(e) => setFormData({ ...formData, children_count: parseInt(e.target.value) })}
                                fullWidth
                                size="small"
                            />
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                {!isEditing ? (
                    <>
                        <Button onClick={() => setIsEditing(true)} variant="contained" color="primary" startIcon={<Edit />}>
                            Edit
                        </Button>
                        <Button onClick={handleDelete} variant="contained" color="error" startIcon={<Delete />} disabled={isLoading}>
                            Delete
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained" color="primary" disabled={isLoading}>
                            {isLoading ? <CircularProgress size={20} /> : 'Save'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

// Case Details Dialog Component
const CaseDetailsDialog: React.FC<{
    open: boolean;
    case: any;
    family: any;
    onClose: () => void;
    onEdit: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}> = ({ open, case: caseData, family, onClose, onEdit, onDelete, isLoading }) => {
    const [formData, setFormData] = useState<any>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (caseData) {
            setFormData(caseData);
            setIsEditing(false);
        }
    }, [caseData]);

    const handleSave = async () => {
        await onEdit(caseData.id, formData);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this case?')) {
            await onDelete(caseData.id);
            onClose();
        }
    };

    if (!caseData || !family) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    {isEditing ? 'Edit Case' : 'Case Details'} - {caseData.case_number}
                </Typography>
                <Button onClick={onClose} size="small" variant="text">
                    <Close />
                </Button>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Stack spacing={2}>
                    {!isEditing ? (
                        <>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Case Number</Typography>
                                <Typography variant="body2" fontWeight="bold">{caseData.case_number}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Family</Typography>
                                <Typography variant="body2" fontWeight="bold">{family.family_code} - {family.primary_contact_name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Title</Typography>
                                <Typography variant="body2">{caseData.title}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Chip label={caseData.status} color={caseData.status === 'CLOSED' ? 'success' : 'warning'} size="small" sx={{ mt: 0.5 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Priority</Typography>
                                <Chip label={caseData.priority} color={caseData.priority === 'URGENT' ? 'error' : 'warning'} size="small" sx={{ mt: 0.5 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography variant="body2">{caseData.description}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Intervention Plan</Typography>
                                <Typography variant="body2">{caseData.intervention_plan}</Typography>
                            </Box>
                        </>
                    ) : (
                        <>
                            <TextField
                                label="Title"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Status"
                                select
                                value={formData.status || 'OPEN'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="OPEN">Open</MenuItem>
                                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                <MenuItem value="ON_HOLD">On Hold</MenuItem>
                                <MenuItem value="CLOSED">Closed</MenuItem>
                                <MenuItem value="TRANSFERRED">Transferred</MenuItem>
                            </TextField>
                            <TextField
                                label="Priority"
                                select
                                value={formData.priority || 'MEDIUM'}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="LOW">Low</MenuItem>
                                <MenuItem value="MEDIUM">Medium</MenuItem>
                                <MenuItem value="HIGH">High</MenuItem>
                                <MenuItem value="URGENT">Urgent</MenuItem>
                            </TextField>
                            <TextField
                                label="Description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                            />
                            <TextField
                                label="Intervention Plan"
                                value={formData.intervention_plan || ''}
                                onChange={(e) => setFormData({ ...formData, intervention_plan: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                            />
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                {!isEditing ? (
                    <>
                        <Button onClick={() => setIsEditing(true)} variant="contained" color="primary" startIcon={<Edit />}>
                            Edit
                        </Button>
                        <Button onClick={handleDelete} variant="contained" color="error" startIcon={<Delete />} disabled={isLoading}>
                            Delete
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained" color="primary" disabled={isLoading}>
                            {isLoading ? <CircularProgress size={20} /> : 'Save'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};


export const MapView: React.FC<{ height?: string | number, embedded?: boolean }> = ({ height = 'calc(100vh - 120px)', embedded = false }) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    
    const families = useSelector((state: RootState) => state.caseManagement.families);
    const cases = useSelector((state: RootState) => state.caseManagement.cases);
    const shelters = useSelector((state: RootState) => state.shelters.shelters);
    const isLoading = useSelector((state: RootState) => state.caseManagement.isLoading);
    
    // Dialog state
    const [familyDialog, setFamilyDialog] = useState<{ open: boolean; family: any }>({ open: false, family: null });
    const [caseDialog, setCaseDialog] = useState<{ open: boolean; case: any }>({ open: false, case: null });
    const [error, setError] = useState<string>('');

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchFamilies());
        dispatch(fetchCases());
    }, [dispatch]);

    // Handle family edit
    const handleEditFamily = async (id: string, data: any) => {
        try {
            setError('');
            await dispatch(updateFamily({ id, data })).unwrap();
            setFamilyDialog({ open: false, family: null });
        } catch (err: any) {
            setError(err || 'Failed to update family');
        }
    };

    // Handle family delete
    const handleDeleteFamily = async (id: string) => {
        try {
            setError('');
            await dispatch(deleteFamily(id)).unwrap();
            setFamilyDialog({ open: false, family: null });
        } catch (err: any) {
            setError(err || 'Failed to delete family');
        }
    };

    // Handle case edit
    const handleEditCase = async (id: string, data: any) => {
        try {
            setError('');
            await dispatch(updateCase({ id, data })).unwrap();
            setCaseDialog({ open: false, case: null });
        } catch (err: any) {
            setError(err || 'Failed to update case');
        }
    };

    // Handle case delete
    const handleDeleteCase = async (id: string) => {
        try {
            setError('');
            await dispatch(deleteCase(id)).unwrap();
            setCaseDialog({ open: false, case: null });
        } catch (err: any) {
            setError(err || 'Failed to delete case');
        }
    };

    // Filter entities with valid coordinates
    const familiesWithCoords = families.filter(f => f.latitude && f.longitude);
    const sheltersWithCoords = shelters.filter(s => s.latitude && s.longitude);
    
    // Get counties for dropdown
    const KENYA_COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kericho', 'Eldoret', 'Nyeri', 'Muranga', 'Kiambu', 'Machakos', 'Kitui', 'Makueni', 'Kajiado', 'Laikipia', 'Samburu', 'West Pokot', 'Turkana', 'Uasin Gishu', 'Kericho', 'Bomet', 'Transnozia', 'Narok', 'Wajir', 'Mandera', 'Garissa', 'Isiolo', 'Embu', 'Tharaka Nithi', 'Meru', 'Isiolo', 'Bungoma', 'Busia', 'Siaya', 'Kakamega', 'Vihiga', 'Kilifi', 'Tana River', 'Lamu', 'Kwale', 'Taita Taveta', 'Migori', 'Kisii', 'Nyamira', 'Homa Bay'];

    // Default center: Nairobi, Kenya
    const center: [number, number] = [-1.286389, 36.817223];

    return (
        <Box sx={{ height: height, width: '100%', position: 'relative' }}>
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            
            {!embedded && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />
                        Geospatial Resource Hub
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Real-time mapping of families, cases, and shelter partnerships across the region.
                    </Typography>
                </Box>
            )}

            <Grid container spacing={2} sx={{ height: embedded ? '100%' : 'calc(100% - 80px)' }}>
                <Grid item xs={12} md={9}>
                    <Paper
                        sx={{
                            height: '100%',
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            boxShadow: theme.shadows[4],
                            zIndex: 1
                        }}
                    >
                        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {familiesWithCoords.map((family) => (
                                <Marker
                                    key={`family-${family.id}`}
                                    position={[Number(family.latitude), Number(family.longitude)]}
                                    icon={familyIcon}
                                >
                                    <Popup>
                                        <Box sx={{ minWidth: 240, p: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
                                                👨‍👩‍👧‍👦 {family.family_code}
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                                <strong>Contact:</strong> {family.primary_contact_name}
                                            </Typography>
                                            <Chip
                                                label={family.vulnerability_level}
                                                size="small"
                                                color={family.vulnerability_level === 'CRITICAL' ? 'error' : 'warning'}
                                                sx={{ mb: 1, mr: 0.5 }}
                                            />
                                            <Chip
                                                label={`${family.total_members} members`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mb: 1 }}
                                            />
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                📍 {family.county} County
                                            </Typography>
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="primary"
                                                fullWidth
                                                onClick={() => setFamilyDialog({ open: true, family })}
                                            >
                                                View Details
                                            </Button>
                                        </Box>
                                    </Popup>
                                </Marker>
                            ))}

                            {cases.map((caseData) => {
                                const family = families.find(f => f.id === caseData.family);
                                if (!family || !family.latitude || !family.longitude) return null;
                                
                                return (
                                    <Marker
                                        key={`case-${caseData.id}`}
                                        position={[Number(family.latitude), Number(family.longitude)]}
                                        icon={caseIcon}
                                    >
                                        <Popup>
                                            <Box sx={{ minWidth: 240, p: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" color="warning.main" sx={{ mb: 0.5 }}>
                                                    📋 {caseData.case_number}
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                                    <strong>{caseData.title}</strong>
                                                </Typography>
                                                <Chip
                                                    label={caseData.status}
                                                    size="small"
                                                    color={caseData.status === 'CLOSED' ? 'success' : 'warning'}
                                                    sx={{ mb: 1, mr: 0.5 }}
                                                />
                                                <Chip
                                                    label={caseData.priority}
                                                    size="small"
                                                    color={caseData.priority === 'URGENT' ? 'error' : 'default'}
                                                    sx={{ mb: 1 }}
                                                />
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                    Family: {family.family_code}
                                                </Typography>
                                                <Button 
                                                    size="small" 
                                                    variant="contained" 
                                                    color="warning"
                                                    fullWidth
                                                    onClick={() => setCaseDialog({ open: true, case: caseData })}
                                                >
                                                    View Case Details
                                                </Button>
                                            </Box>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {sheltersWithCoords.map((shelter) => (
                                <Marker
                                    key={`shelter-${shelter.id}`}
                                    position={[Number(shelter.latitude), Number(shelter.longitude)]}
                                    icon={shelterIcon}
                                >
                                    <Popup>
                                        <Box sx={{ minWidth: 250, p: 1.5 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="secondary" sx={{ mb: 0.5 }}>
                                                🏠 {shelter.name}
                                            </Typography>
                                            {shelter.contact_person && (
                                                <Typography variant="caption" color="text.secondary">
                                                    <strong>Contact:</strong> {shelter.contact_person}
                                                </Typography>
                                            )}
                                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                <Chip 
                                                    label={`${shelter.available_beds || 0} beds available`} 
                                                    size="small" 
                                                    color={shelter.available_beds > 0 ? 'success' : 'error'} 
                                                    variant="outlined"
                                                />
                                                <Chip 
                                                    label={`${shelter.current_occupancy}/${shelter.total_capacity} capacity`} 
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                            {shelter.gender_policy && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip 
                                                        label={`👥 ${shelter.gender_policy}`} 
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            )}
                                            {(shelter.has_medical_facility || shelter.has_education_facility || shelter.has_counseling_services) && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                                                        Facilities:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        {shelter.has_medical_facility && <Chip label="🏥 Medical" size="small" />}
                                                        {shelter.has_education_facility && <Chip label="📚 Education" size="small" />}
                                                        {shelter.has_counseling_services && <Chip label="💬 Counseling" size="small" />}
                                                    </Box>
                                                </Box>
                                            )}
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                                📍 {shelter.physical_address}
                                            </Typography>
                                            {shelter.phone_number && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    📞 {shelter.phone_number}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            height: '100%',
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            overflow: 'auto'
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold">Map Legend</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                            <Typography variant="body2">Families ({familiesWithCoords.length})</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#fbc02d' }} />
                            <Typography variant="body2">Cases ({cases.length})</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#0288d1' }} />
                            <Typography variant="body2">Shelters ({sheltersWithCoords.length})</Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="subtitle2" fontWeight="bold">Key Statistics</Typography>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Total Mapped Points</Typography>
                            <Typography variant="h5" fontWeight="900" color="primary">
                                {familiesWithCoords.length + sheltersWithCoords.length + cases.length}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Critical Areas</Typography>
                            <Typography variant="h5" fontWeight="900" color="error">
                                {families.filter(f => f.vulnerability_level === 'CRITICAL').length}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Open Cases</Typography>
                            <Typography variant="h5" fontWeight="900" color="warning.main">
                                {cases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 'auto' }}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), border: '1px dashed', borderColor: 'info.main' }}>
                                <Typography variant="caption" color="info.main" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                                    📍 INTERACTIVE MAP
                                </Typography>
                                <Typography variant="caption" display="block">
                                    Click markers to view, edit, or delete family and case records.
                                </Typography>
                            </Paper>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <FamilyDetailsDialog 
                open={familyDialog.open}
                family={familyDialog.family}
                onClose={() => setFamilyDialog({ open: false, family: null })}
                onEdit={handleEditFamily}
                onDelete={handleDeleteFamily}
                isLoading={isLoading}
                counties={KENYA_COUNTIES}
            />

            <CaseDetailsDialog
                open={caseDialog.open}
                case={caseDialog.case}
                family={families.find(f => f.id === caseDialog.case?.family)}
                onClose={() => setCaseDialog({ open: false, case: null })}
                onEdit={handleEditCase}
                onDelete={handleDeleteCase}
                isLoading={isLoading}
            />
        </Box>
    );
};
