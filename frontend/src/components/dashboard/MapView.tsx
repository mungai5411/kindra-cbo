import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Paper, Typography, useTheme, alpha, Chip, Divider, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { LocationOn } from '@mui/icons-material';

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


export const MapView: React.FC = () => {
    const theme = useTheme();
    const families = useSelector((state: RootState) => state.caseManagement.families);
    const shelters = useSelector((state: RootState) => state.shelters.shelters);

    // Filter entities with valid coordinates
    const familiesWithCoords = families.filter(f => f.latitude && f.longitude);
    const sheltersWithCoords = shelters.filter(s => s.latitude && s.longitude);

    // Default center: Nairobi, Kenya
    const center: [number, number] = [-1.286389, 36.817223];

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', width: '100%', position: 'relative' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />
                    Geospatial Resource Hub
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Real-time mapping of humanitarian resources, family locations, and shelter availability across the region.
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ height: 'calc(100% - 80px)' }}>
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
                                    key={family.id}
                                    position={[Number(family.latitude), Number(family.longitude)]}
                                    icon={familyIcon}
                                >
                                    <Popup>
                                        <Box sx={{ minWidth: 200, p: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                Family: {family.family_code}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Contact:</strong> {family.primary_contact_name}
                                            </Typography>
                                            <Chip
                                                label={family.vulnerability_level}
                                                size="small"
                                                color={family.vulnerability_level === 'CRITICAL' ? 'error' : 'warning'}
                                                sx={{ mb: 1 }}
                                            />
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {family.county} County
                                            </Typography>
                                        </Box>
                                    </Popup>
                                </Marker>
                            ))}

                            {sheltersWithCoords.map((shelter) => (
                                <Marker
                                    key={shelter.id}
                                    position={[Number(shelter.latitude), Number(shelter.longitude)]}
                                    icon={shelterIcon}
                                >
                                    <Popup>
                                        <Box sx={{ minWidth: 200, p: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                                                Shelter: {shelter.name}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Capacity:</strong> {shelter.current_occupancy}/{shelter.total_capacity}
                                            </Typography>
                                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                                                <Chip label={`${shelter.available_beds} beds free`} size="small" color="success" />
                                            </Box>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {shelter.physical_address}
                                            </Typography>
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
                            gap: 2
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold">Map Legend</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                            <Typography variant="body2">Registered Families ({familiesWithCoords.length})</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#0288d1' }} />
                            <Typography variant="body2">Shelter Partners ({sheltersWithCoords.length})</Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="subtitle2" fontWeight="bold">Key Statistics</Typography>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Total Mapped Points</Typography>
                            <Typography variant="h5" fontWeight="900" color="primary">
                                {familiesWithCoords.length + sheltersWithCoords.length}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Critical Areas (High Risk)</Typography>
                            <Typography variant="h5" fontWeight="900" color="error">
                                {families.filter(f => f.vulnerability_level === 'CRITICAL').length}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 'auto' }}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), border: '1px dashed', borderColor: 'info.main' }}>
                                <Typography variant="caption" color="info.main" fontWeight="bold">
                                    PRO TIP:
                                </Typography>
                                <Typography variant="caption" display="block">
                                    Click on markers to view detailed case or shelter status.
                                </Typography>
                            </Paper>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
