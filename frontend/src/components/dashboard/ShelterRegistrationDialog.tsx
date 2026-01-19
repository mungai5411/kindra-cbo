import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Alert,
    Chip,
    useTheme,
    alpha,
    Snackbar
} from '@mui/material';
import { KENYA_COUNTIES } from '../../utils/locationData';
import { ImageGallery, ImageItem } from '../common/ImageGallery';
import apiClient, { endpoints } from '../../api/client';

interface ShelterRegistrationDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
}

const DISABILITY_TYPES = [
    'Physical Disability',
    'Visual Impairment',
    'Hearing Impairment',
    'Cognitive Disability',
    'Autism Spectrum',
    'Learning Disabilities',
    'Multiple Disabilities'
];

export function ShelterRegistrationDialog({ open, onClose, onSubmit, initialData }: ShelterRegistrationDialogProps) {
    const theme = useTheme();

    const [formData, setFormData] = useState({
        name: '',
        registration_number: '',
        contact_person: '',
        phone_number: '',
        emergency_contact: '',
        email: '',
        county: '',
        sub_county: '',
        physical_address: '',
        total_capacity: '',
        age_range_min: '0',
        age_range_max: '18',
        gender_policy: 'CO_ED',
        disability_accommodations: false,
        disability_capacity: '0',
        disability_types_supported: [] as string[],
        fire_safety_certified: false,
        security_measures: '',
        has_medical_facility: false,
        has_education_facility: false,
        has_counseling_services: false,
        license_number: '',
    });

    // For new registrations (files)
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [newPhotoPreviews, setNewPhotoPreviews] = useState<ImageItem[]>([]);

    // For existing shelters (remote photos)
    const [existingPhotos, setExistingPhotos] = useState<ImageItem[]>([]);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'success' | 'info' | 'warning' | 'error' });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                registration_number: initialData.registration_number || '',
                contact_person: initialData.contact_person || '',
                phone_number: initialData.phone_number || '',
                emergency_contact: initialData.emergency_contact || '',
                email: initialData.email || '',
                county: initialData.county || '',
                sub_county: initialData.sub_county || '',
                physical_address: initialData.physical_address || '',
                total_capacity: initialData.total_capacity || '',
                age_range_min: initialData.age_range_min || '0',
                age_range_max: initialData.age_range_max || '18',
                gender_policy: initialData.gender_policy || 'CO_ED',
                disability_accommodations: initialData.disability_accommodations || false,
                disability_capacity: initialData.disability_capacity || '0',
                disability_types_supported: initialData.disability_types_supported || [],
                fire_safety_certified: initialData.fire_safety_certified || false,
                security_measures: initialData.security_measures || '',
                has_medical_facility: initialData.has_medical_facility || false,
                has_education_facility: initialData.has_education_facility || false,
                has_counseling_services: initialData.has_counseling_services || false,
                license_number: initialData.license_number || '',
            });

            // Map existing photos
            if (initialData.photos && Array.isArray(initialData.photos)) {
                setExistingPhotos(initialData.photos.map((p: any) => ({
                    id: p.id,
                    url: p.image,
                    isPrimary: p.is_primary
                })));
            } else {
                setExistingPhotos([]);
            }
            // Clear new photos when editing starts
            setNewPhotos([]);
            setNewPhotoPreviews([]);
        } else {
            // Reset for new registration
            setFormData({
                name: '',
                registration_number: '',
                contact_person: '',
                phone_number: '',
                emergency_contact: '',
                email: '',
                county: '',
                sub_county: '',
                physical_address: '',
                total_capacity: '',
                age_range_min: '0',
                age_range_max: '18',
                gender_policy: 'CO_ED',
                disability_accommodations: false,
                disability_capacity: '0',
                disability_types_supported: [],
                fire_safety_certified: false,
                security_measures: '',
                has_medical_facility: false,
                has_education_facility: false,
                has_counseling_services: false,
                license_number: '',
            });
            setNewPhotos([]);
            setNewPhotoPreviews([]);
            setExistingPhotos([]);
        }
    }, [initialData, open]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGalleryAdd = async (files: File[]) => {
        if (initialData?.id) {
            // Editing mode: Upload immediately
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('photo_type', 'EXTERIOR'); // Default type
                try {
                    await apiClient.post(`${endpoints.shelters.shelters}${initialData.id}/photos/add/`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (error) {
                    console.error('Failed to upload photo', error);
                    setSnackbar({ open: true, message: 'Failed to upload photo', severity: 'error' });
                }
            }
            // Reload photos (would involve fetching shelter detail, but we can hack it by reloading parent)
            // Ideally we call an onSubmit or similar to trigger parent refresh, or just rely on state update if we returned data.
            // For now, let's just trigger a soft refresh message or manual reload logic.
            // Since we can't easily refresh `initialData` from here without parent help, we'll verify via `onSubmit` or `onClose`.
            setSnackbar({ open: true, message: 'Photos added successfully', severity: 'success' });
            if (onClose) onClose(); // Close nicely or find a way to refresh.
        } else {
            // Creation mode: Add to local state
            const updatedPhotos = [...newPhotos, ...files];
            setNewPhotos(updatedPhotos);

            // Generate previews
            const newPreviews: ImageItem[] = [];
            for (const file of files) {
                newPreviews.push({
                    id: URL.createObjectURL(file), // Temporary ID
                    url: URL.createObjectURL(file),
                    isPrimary: false
                });
            }
            setNewPhotoPreviews([...newPhotoPreviews, ...newPreviews]);
        }
    };

    const handleGalleryDelete = async (id: string) => {
        if (initialData?.id) {
            // Edit mode: API call
            try {
                await apiClient.delete(`${endpoints.shelters.shelters}${initialData.id}/photos/${id}/delete/`);
                setExistingPhotos(prev => prev.filter(p => p.id !== id));
                setSnackbar({ open: true, message: 'Photo deleted', severity: 'success' });
            } catch (error) {
                setSnackbar({ open: true, message: 'Failed to delete photo', severity: 'error' });
            }
        } else {
            // Create mode: Local remove
            // Find index in previews to remove from files (assuming order logic holds or using unique temporary IDs)
            const idx = newPhotoPreviews.findIndex(p => p.id === id);
            if (idx !== -1) {
                const updatedFiles = [...newPhotos];
                updatedFiles.splice(idx, 1);
                setNewPhotos(updatedFiles);

                const updatedPreviews = [...newPhotoPreviews];
                updatedPreviews.splice(idx, 1);
                setNewPhotoPreviews(updatedPreviews);
            }
        }
    };

    const handleGallerySetPrimary = async (id: string) => {
        if (initialData?.id) {
            try {
                await apiClient.patch(`${endpoints.shelters.shelters}${initialData.id}/photos/${id}/set-primary/`);
                setExistingPhotos(prev => prev.map(p => ({ ...p, isPrimary: p.id === id })));
                setSnackbar({ open: true, message: 'Primary photo updated', severity: 'success' });
            } catch (error) {
                setSnackbar({ open: true, message: 'Failed to set primary', severity: 'error' });
            }
        }
        // Local mode doesn't really support primary setting logic in this simple implementation yet,
        // but ImageGallery allows distinguishing it. We can add state for it if needed.
    };

    const handleSubmit = () => {
        // Validation for new shelter
        if (!initialData && newPhotos.length < 3) {
            setSnackbar({ open: true, message: 'Please upload at least 3 photos of your shelter', severity: 'warning' });
            return;
        }

        const requiredFields = [
            'name', 'registration_number', 'contact_person', 'phone_number', 'email',
            'county', 'physical_address', 'total_capacity',
            'emergency_contact', 'security_measures'
        ];

        const missing = requiredFields.filter(field => !formData[field as keyof typeof formData]);
        if (missing.length > 0) {
            setSnackbar({ open: true, message: `Please fill in required fields: ${missing.join(', ')}`, severity: 'error' });
            return;
        }

        const submissionData = {
            ...formData,
            photos: newPhotos, // Only used for new registration
            id: initialData?.id // Pass ID if editing
        };
        onSubmit(submissionData);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{
                fontWeight: 'bold',
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
            }}>
                {initialData ? 'Edit Shelter Home' : 'Register Shelter Home'}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* Basic Information */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Basic Information *
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Shelter Name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Registration Number"
                                value={formData.registration_number}
                                onChange={(e) => handleChange('registration_number', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Contact Person"
                                value={formData.contact_person}
                                onChange={(e) => handleChange('contact_person', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Phone Number"
                                value={formData.phone_number}
                                onChange={(e) => handleChange('phone_number', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Emergency Contact"
                                placeholder="+254..."
                                value={formData.emergency_contact}
                                onChange={(e) => handleChange('emergency_contact', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                type="email"
                                label="Email Address"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    {/* Location */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
                        Location *
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>County</InputLabel>
                                <Select
                                    value={formData.county}
                                    label="County"
                                    onChange={(e) => {
                                        handleChange('county', e.target.value);
                                        handleChange('sub_county', ''); // Reset sub-county when county changes
                                    }}
                                >
                                    {KENYA_COUNTIES.map(c => (
                                        <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required={!!formData.county}>
                                <InputLabel>Sub-County</InputLabel>
                                <Select
                                    value={formData.sub_county}
                                    label="Sub-County"
                                    disabled={!formData.county}
                                    onChange={(e) => handleChange('sub_county', e.target.value)}
                                >
                                    {KENYA_COUNTIES.find(c => c.name === formData.county)?.sub_counties.map(sc => (
                                        <MenuItem key={sc} value={sc}>{sc}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                multiline
                                rows={2}
                                label="Physical Address"
                                value={formData.physical_address}
                                onChange={(e) => handleChange('physical_address', e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    {/* Capacity & Demographics */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
                        Capacity & Demographics *
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Total Capacity"
                                value={formData.total_capacity}
                                onChange={(e) => handleChange('total_capacity', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Age Range (Min)"
                                value={formData.age_range_min}
                                onChange={(e) => handleChange('age_range_min', e.target.value)}
                                InputProps={{ inputProps: { min: 0, max: 18 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Age Range (Max)"
                                value={formData.age_range_max}
                                onChange={(e) => handleChange('age_range_max', e.target.value)}
                                InputProps={{ inputProps: { min: 0, max: 18 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Gender Policy</InputLabel>
                                <Select
                                    value={formData.gender_policy}
                                    label="Gender Policy"
                                    onChange={(e) => handleChange('gender_policy', e.target.value)}
                                >
                                    <MenuItem value="MALE_ONLY">Male Only</MenuItem>
                                    <MenuItem value="FEMALE_ONLY">Female Only</MenuItem>
                                    <MenuItem value="CO_ED">Co-Educational</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Disability Support */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
                        Disability Accommodations
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.disability_accommodations}
                                onChange={(e) => handleChange('disability_accommodations', e.target.checked)}
                            />
                        }
                        label="We accommodate children with disabilities"
                    />
                    {formData.disability_accommodations && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Disability Capacity"
                                    value={formData.disability_capacity}
                                    onChange={(e) => handleChange('disability_capacity', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Disability Types Supported</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.disability_types_supported}
                                        onChange={(e) => handleChange('disability_types_supported', e.target.value)}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {DISABILITY_TYPES.map((type) => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    )}

                    {/* Facilities */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
                        Facilities & Services
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={4}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.has_medical_facility} onChange={(e) => handleChange('has_medical_facility', e.target.checked)} />}
                                label="Medical Facility"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.has_education_facility} onChange={(e) => handleChange('has_education_facility', e.target.checked)} />}
                                label="Education Facility"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.has_counseling_services} onChange={(e) => handleChange('has_counseling_services', e.target.checked)} />}
                                label="Counseling Services"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.fire_safety_certified} onChange={(e) => handleChange('fire_safety_certified', e.target.checked)} />}
                                label="Fire Safety Certified"
                            />
                        </Grid>
                    </Grid>

                    {/* Security */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
                        Security Measures *
                    </Typography>
                    <TextField
                        fullWidth
                        required
                        multiline
                        rows={3}
                        label="Describe Security Arrangements"
                        placeholder="e.g., 24/7 security guard, CCTV cameras, perimeter fence..."
                        value={formData.security_measures}
                        onChange={(e) => handleChange('security_measures', e.target.value)}
                    />

                    {/* Photos */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
                        Shelter Photos * {initialData ? '(Manage)' : '(Minimum 3 required)'}
                    </Typography>

                    <ImageGallery
                        images={initialData ? existingPhotos : newPhotoPreviews}
                        onAdd={handleGalleryAdd}
                        onDelete={handleGalleryDelete}
                        onSetPrimary={initialData ? handleGallerySetPrimary : undefined}
                        maxImages={10}
                        minImages={initialData ? 0 : 3}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!initialData && newPhotos.length < 3}
                    sx={{ px: 4 }}
                >
                    {initialData ? 'Update Shelter' : 'Submit for Approval'}
                </Button>
            </DialogActions>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}
