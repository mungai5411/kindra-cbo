import { useState } from 'react';
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
    IconButton,
    Alert,
    Chip,
    useTheme,
    alpha,
    Snackbar
} from '@mui/material';
import { Delete, PhotoCamera } from '@mui/icons-material';
import { KENYA_COUNTIES } from '../../utils/locationData';

interface ShelterRegistrationDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
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

export function ShelterRegistrationDialog({ open, onClose, onSubmit }: ShelterRegistrationDialogProps) {
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

    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'success' | 'info' | 'warning' | 'error' });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (photos.length + files.length > 10) {
            setSnackbar({ open: true, message: 'Maximum 10 photos allowed', severity: 'warning' });
            return;
        }

        const newPhotos = [...photos, ...files];
        setPhotos(newPhotos);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        // Validation
        if (photos.length < 3) {
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
            photos
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
                Register Shelter Home
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
                        Shelter Photos * (Minimum 3 required)
                    </Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        disabled={photos.length >= 10}
                        startIcon={<PhotoCamera />}
                        sx={{
                            borderStyle: 'dashed',
                            py: 2,
                            borderColor: photos.length < 3 ? 'error.main' : 'divider'
                        }}
                    >
                        Upload Photos ({photos.length}/10)
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handlePhotoUpload}
                        />
                    </Button>

                    {photos.length < 3 && (
                        <Alert severity="warning">
                            Please upload at least 3 photos of your shelter facilities (exterior, dormitory, facilities)
                        </Alert>
                    )}

                    {/* Photo Previews */}
                    {photoPreview.length > 0 && (
                        <Grid container spacing={1}>
                            {photoPreview.map((preview, idx) => (
                                <Grid item xs={4} key={idx}>
                                    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                                        <img
                                            src={preview}
                                            alt={`Preview ${idx + 1}`}
                                            style={{ width: '100%', height: 120, objectFit: 'cover' }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => removePhoto(idx)}
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'error.dark' }
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={photos.length < 3}
                    sx={{ px: 4 }}
                >
                    Submit for Approval
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
