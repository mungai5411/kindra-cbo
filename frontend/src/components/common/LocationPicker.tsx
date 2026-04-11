import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    alpha,
    Chip,
    Stack,
    InputAdornment,
    Autocomplete,
    Alert
} from '@mui/material';
import { LocationOn, Clear, CheckCircle } from '@mui/icons-material';
import { KENYA_COUNTIES, getCountyCenter, searchCounties } from '../../utils/locationData';

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

interface LocationPickerProps {
    latitude?: number | string;
    longitude?: number | string;
    onLocationChange: (lat: number, lng: number) => void;
    label?: string;
    error?: boolean;
    helperText?: string;
}

// Component to handle map click events
const MapClickHandler: React.FC<{
    onLocationSelect: (lat: number, lng: number) => void;
    markerPos: { lat: number; lng: number } | null;
}> = ({ onLocationSelect, markerPos }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationSelect(lat, lng);
        },
    });

    return markerPos ? (
        <Marker
            position={[markerPos.lat, markerPos.lng]}
            icon={DefaultIcon}
        />
    ) : null;
};

// Component to automatically center map on marker
const MapCenterHandler: React.FC<{ center: [number, number] | null }> = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            // Fly to location with animation
            map.flyTo(center, 15, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [center, map]);

    return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
    latitude,
    longitude,
    onLocationChange,
    label = 'Shelter Location',
    error = false,
    helperText = ''
}) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
        latitude && longitude
            ? { lat: Number(latitude), lng: Number(longitude) }
            : null
    );
    const [latInput, setLatInput] = useState(latitude?.toString() || '');
    const [lngInput, setLngInput] = useState(longitude?.toString() || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuccess, setSearchSuccess] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

    // Auto-open map dialog and center on search result
    useEffect(() => {
        if (markerPos && searchSuccess) {
            setOpen(true);
            setMapCenter([markerPos.lat, markerPos.lng]);
            // Reset search success flag after animation
            setTimeout(() => setSearchSuccess(false), 1500);
        }
    }, [markerPos, searchSuccess]);

    // Default center: Nairobi, Kenya
    const defaultCenter: [number, number] = [-1.286389, 36.817223];
    const displayMapCenter = mapCenter || (markerPos ? [markerPos.lat, markerPos.lng] as [number, number] : defaultCenter);

    const handleMapClick = (lat: number, lng: number) => {
        setMarkerPos({ lat, lng });
        setLatInput(lat.toFixed(6));
        setLngInput(lng.toFixed(6));
    };

    const handleSaveLocation = () => {
        if (markerPos) {
            onLocationChange(markerPos.lat, markerPos.lng);
            setOpen(false);
        }
    };

    const handleClearLocation = () => {
        setMarkerPos(null);
        setLatInput('');
        setLngInput('');
        onLocationChange(0, 0);
    };

    const handleManualInput = () => {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (!isNaN(lat) && !isNaN(lng)) {
            setMarkerPos({ lat, lng });
        }
    };

    // Enhanced search for Kenya counties and locations
    const searchLocations = async (query: string) => {
        if (query.length < 2) return;

        // First, try to find if it's a Kenya county
        const countyMatches = searchCounties(query);
        if (countyMatches.length > 0) {
            const county = countyMatches[0];
            const [lat, lng] = getCountyCenter(county.name);
            setMarkerPos({ lat, lng });
            setLatInput(lat.toFixed(6));
            setLngInput(lng.toFixed(6));
            setSearchSuccess(true);
            return;
        }

        // Fall back to Nominatim geocoding
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}, Kenya&format=json&limit=5`
            );
            const results = await response.json();

            if (results.length > 0) {
                const first = results[0];
                const lat = parseFloat(first.lat);
                const lng = parseFloat(first.lon);
                setMarkerPos({ lat, lng });
                setLatInput(lat.toFixed(6));
                setLngInput(lng.toFixed(6));
                setSearchSuccess(true);
            }
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    {label}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
                    <Autocomplete
                        freeSolo
                        size="small"
                        options={KENYA_COUNTIES.map(c => c.name)}
                        inputValue={searchQuery}
                        onInputChange={(event, newInputValue) => {
                            setSearchQuery(newInputValue);
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                searchLocations(searchQuery);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search location"
                                placeholder="e.g., 'Nairobi', 'Westlands', 'Kisumu', 'Maiduguri St'"
                                helperText="Search by county, town, street, or area name"
                                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        )}
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => searchLocations(searchQuery)}
                        size="small"
                    >
                        Search
                    </Button>
                </Box>

                {searchSuccess && (
                    <Alert
                        severity="success"
                        icon={<CheckCircle />}
                        sx={{ mb: 2, borderRadius: 2 }}
                        onClose={() => setSearchSuccess(false)}
                    >
                        Location found! The map has moved to this location. You can click to adjust if needed.
                    </Alert>
                )}

                {markerPos && (
                    <Paper
                        sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            border: `1px solid ${theme.palette.success.main}`,
                            borderRadius: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn sx={{ color: 'success.main', fontSize: 18 }} />
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                    Location Selected
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                startIcon={<Clear />}
                                onClick={handleClearLocation}
                                color="error"
                            >
                                Clear
                            </Button>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Chip
                                label={`Latitude: ${markerPos.lat.toFixed(6)}`}
                                size="small"
                                variant="outlined"
                            />
                            <Chip
                                label={`Longitude: ${markerPos.lng.toFixed(6)}`}
                                size="small"
                                variant="outlined"
                            />
                        </Stack>
                    </Paper>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Latitude"
                        type="number"
                        size="small"
                        value={latInput}
                        onChange={(e) => setLatInput(e.target.value)}
                        inputProps={{ step: '0.000001', min: '-90', max: '90' }}
                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        error={error}
                    />
                    <TextField
                        label="Longitude"
                        type="number"
                        size="small"
                        value={lngInput}
                        onChange={(e) => setLngInput(e.target.value)}
                        inputProps={{ step: '0.000001', min: '-180', max: '180' }}
                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        error={error}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleManualInput}
                        size="small"
                    >
                        Update
                    </Button>
                </Box>
                {helperText && (
                    <Typography variant="caption" color={error ? 'error' : 'textSecondary'} sx={{ mt: 0.5, display: 'block' }}>
                        {helperText}
                    </Typography>
                )}

                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LocationOn />}
                    onClick={() => setOpen(true)}
                    sx={{ mt: 2, borderRadius: 2 }}
                >
                    {markerPos ? 'Update on Map' : 'Pick Location on Map'}
                </Button>
            </Box>

            {/* Map Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', nb: 1 }}>
                    Locate Your Shelter
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Search for your county, town, street, or area above. The map will center on the location. Click on the map to pin the exact shelter location.
                    </Typography>
                    <Paper
                        sx={{
                            height: 400,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <MapContainer
                            center={displayMapCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapCenterHandler center={mapCenter} />
                            <MapClickHandler
                                onLocationSelect={handleMapClick}
                                markerPos={markerPos}
                            />
                        </MapContainer>
                    </Paper>

                    {markerPos && (
                        <Paper
                            sx={{
                                p: 2,
                                mt: 2,
                                bgcolor: alpha(theme.palette.info.main, 0.08),
                                border: `1px solid ${theme.palette.info.main}`,
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                Selected Coordinates:
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Chip
                                    label={`Latitude: ${markerPos.lat.toFixed(8)}`}
                                    size="small"
                                />
                                <Chip
                                    label={`Longitude: ${markerPos.lng.toFixed(8)}`}
                                    size="small"
                                />
                            </Stack>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpen(false)}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveLocation}
                        variant="contained"
                        disabled={!markerPos}
                        sx={{ borderRadius: 2 }}
                    >
                        Confirm Location
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
