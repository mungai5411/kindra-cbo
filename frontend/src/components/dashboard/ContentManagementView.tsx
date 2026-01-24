import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import apiClient, { endpoints } from '../../api/client';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    IconButton,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    useTheme,
    alpha,
    Tooltip,
    Avatar,
    Stack,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    PermMedia,
    Groups,
    Add,
    Delete,
    Edit,
    CloudUpload,
    Link as LinkIcon,
    Visibility,
    Image as ImageIcon,
    FolderOpen,
    PersonAdd,
    LinkedIn,
    Twitter,
    Save,
    VisibilityOff
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { SubTabView } from './SubTabView';
import { ImageUploader } from '../common/ImageUploader';
import { glassCard, gradientText } from '../../theme/glassmorphism';

// Status Label Mapping
const SOURCE_LABELS: { [key: string]: string } = {
    'CAMPAIGN': 'Campaign',
    'STORY': 'Story/Blog',
    'SHELTER': 'Shelter',
    'TEAM': 'Team Member',
    'USER': 'System User',
    'GENERAL': 'General Asset'
};

export function ContentManagementView({ initialTab = 'media' }: { initialTab?: string }) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    const [media, setMedia] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [siteContent, setSiteContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog States
    const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
    const [teamDialogOpen, setTeamDialogOpen] = useState(false);
    const [contentDialogOpen, setContentDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [selectedContent, setSelectedContent] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: string, type: 'media' | 'team' | 'content', title: string }>({ open: false, id: '', type: 'media', title: '' });

    // Form States
    const [mediaForm, setMediaForm] = useState({
        title: '',
        alt_text: '',
        source_type: 'GENERAL',
        file: null as File | null
    });

    const [teamForm, setTeamForm] = useState({
        name: '',
        role: '',
        bio: '',
        order: 0,
        linkedin: '',
        twitter: '',
        is_active: true,
        image: null as File | null
    });

    const [contentForm, setContentForm] = useState({
        key: '',
        section: 'OTHER',
        title: '',
        content: '',
        value: '',
        is_active: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mediaRes, teamRes, contentRes] = await Promise.all([
                apiClient.get('/blog/admin/media/'),
                apiClient.get('/blog/admin/team/'),
                apiClient.get('/blog/admin/content/')
            ]);
            setMedia(mediaRes.data.results || mediaRes.data);
            setTeam(teamRes.data.results || teamRes.data);
            setSiteContent(contentRes.data.results || contentRes.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch content data:', err);
            setError('Failed to sync content management data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Media Handlers
    const handleMediaUpload = async () => {
        if (!mediaForm.file) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', mediaForm.file);
            formData.append('title', mediaForm.title || mediaForm.file.name);
            formData.append('alt_text', mediaForm.alt_text);
            formData.append('source_type', mediaForm.source_type);

            await apiClient.post('/blog/admin/media/', formData);
            setMediaDialogOpen(false);
            setMediaForm({ title: '', alt_text: '', source_type: 'GENERAL', file: null });
            fetchData();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // Team Handlers
    const handleTeamSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(teamForm).forEach(([key, value]) => {
                if (key === 'image' && value === null) return;
                formData.append(key, value as any);
            });

            if (selectedTeam) {
                await apiClient.patch(`/blog/admin/team/${selectedTeam.id}/`, formData);
            } else {
                await apiClient.post('/blog/admin/team/', formData);
            }
            setTeamDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error('Team save failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // Section Label Mapping
    const SECTION_LABELS: { [key: string]: string } = {
        'HERO': 'Hero Sections',
        'ABOUT': 'About Narrative',
        'MISSION_VISION': 'Mission & Vision',
        'STATS': 'Impact Statistics',
        'FOOTER': 'Footer Info',
        'OTHER': 'Miscellaneous'
    };

    // Content Handlers
    const handleContentSubmit = async () => {
        setLoading(true);
        try {
            if (selectedContent) {
                await apiClient.patch(`/blog/admin/content/${selectedContent.key}/`, contentForm);
            } else {
                await apiClient.post('/blog/admin/content/', contentForm);
            }
            setContentDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error('Content save failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        setLoading(true);
        try {
            let endpoint = '';
            if (deleteConfirm.type === 'media') endpoint = `/blog/admin/media/${deleteConfirm.id}/`;
            else if (deleteConfirm.type === 'team') endpoint = `/blog/admin/team/${deleteConfirm.id}/`;
            else if (deleteConfirm.type === 'content') endpoint = `/blog/admin/content/${deleteConfirm.id}/`;

            await apiClient.delete(endpoint);
            setDeleteConfirm({ ...deleteConfirm, open: false });
            fetchData();
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderMediaLibrary = () => (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Global Media Registry</Typography>
                    <Typography variant="body2" color="text.secondary">All uploads from campaigns, stories, and field ops centralized here.</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setMediaDialogOpen(true)}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                >
                    Upload Asset
                </Button>
            </Box>

            {loading && media.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={2}>
                    {media.map((asset) => (
                        <Grid item xs={12} sm={6} md={3} key={asset.id}>
                            <Card sx={{
                                ...glassCard(theme),
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{ position: 'relative', pt: '75%', overflow: 'hidden' }}>
                                    <CardMedia
                                        component="img"
                                        image={asset.file}
                                        alt={asset.alt_text}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        display: 'flex',
                                        gap: 0.5
                                    }}>
                                        <Tooltip title="Delete Permanently">
                                            <IconButton
                                                size="small"
                                                sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'error.main' } }}
                                                onClick={() => setDeleteConfirm({ open: true, id: asset.id, type: 'media', title: asset.title || 'this asset' })}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Typography variant="subtitle2" noWrap fontWeight="bold">{asset.title || 'Untitled Asset'}</Typography>
                                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Chip
                                            label={SOURCE_LABELS[asset.source_type] || asset.source_type}
                                            size="small"
                                            sx={{ fontSize: '0.65rem', height: 20, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {asset.file_size ? `${(asset.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        size="small"
                                        startIcon={<LinkIcon fontSize="small" />}
                                        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.75rem' }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(asset.file);
                                            // TODO: Add snackbar
                                        }}
                                    >
                                        Copy Link
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                    {media.length === 0 && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 8, textAlign: 'center', border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                                <FolderOpen sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography color="text.secondary">Your media library is empty. Start by uploading an asset.</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}
        </Box>
    );

    const renderTeamManagement = () => (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Organizational Visionaries</Typography>
                    <Typography variant="body2" color="text.secondary">Manage lead profiles displayed on the public About page.</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PersonAdd />}
                    onClick={() => {
                        setSelectedTeam(null);
                        setTeamForm({ name: '', role: '', bio: '', order: team.length, linkedin: '', twitter: '', is_active: true, image: null });
                        setTeamDialogOpen(true);
                    }}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                >
                    Add Visionary
                </Button>
            </Box>

            <Grid container spacing={3}>
                {team.map((member) => (
                    <Grid item xs={12} md={4} key={member.id}>
                        <Paper sx={{
                            ...glassCard(theme),
                            p: 3,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <Avatar
                                sx={{ width: 100, height: 100, mb: 2, border: `4px solid ${alpha(theme.palette.secondary.main, 0.2)}`, opacity: member.is_active ? 1 : 0.5 }}
                            />
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="h6" fontWeight="bold">{member.name}</Typography>
                                {!member.is_active && (
                                    <Tooltip title="Hidden from public side">
                                        <Chip label="Hidden" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                                    </Tooltip>
                                )}
                            </Stack>
                            <Typography variant="body2" color="secondary" fontWeight="700" sx={{ mb: 2 }}>{member.role}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{
                                mb: 3,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: 50
                            }}>
                                {member.bio}
                            </Typography>
                            <Divider sx={{ width: '100%', mb: 2 }} />
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Edit Profile">
                                    <IconButton size="small" color="primary" onClick={() => {
                                        setSelectedTeam(member);
                                        setTeamForm({
                                            name: member.name,
                                            role: member.role,
                                            bio: member.bio,
                                            order: member.order,
                                            linkedin: member.linkedin || '',
                                            twitter: member.twitter || '',
                                            is_active: member.is_active,
                                            image: null
                                        });
                                        setTeamDialogOpen(true);
                                    }}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ open: true, id: member.id, type: 'team', title: member.name })}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                {member.linkedin && <IconButton size="small" sx={{ color: '#0077b5' }} href={member.linkedin} target="_blank"><LinkedIn fontSize="small" /></IconButton>}
                                {member.twitter && <IconButton size="small" sx={{ color: '#1da1f2' }} href={member.twitter} target="_blank"><Twitter fontSize="small" /></IconButton>}
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
                {team.length === 0 && !loading && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                            <Typography color="text.secondary">No team members added yet.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );

    const renderSiteContent = () => (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Universal No-Code Editor</Typography>
                    <Typography variant="body2" color="text.secondary">Update site narrative, mission statement, and stats without touching code.</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => {
                        setSelectedContent(null);
                        setContentForm({ key: '', section: 'OTHER', title: '', content: '', value: '', is_active: true });
                        setContentDialogOpen(true);
                    }}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                >
                    Create Content Block
                </Button>
            </Box>

            <Grid container spacing={3}>
                {siteContent.map((content) => (
                    <Grid item xs={12} md={6} key={content.id}>
                        <Paper sx={{
                            ...glassCard(theme),
                            p: 3,
                            position: 'relative',
                            '&:hover .content-actions': { opacity: 1 }
                        }}>
                            <Box className="content-actions" sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.5, transition: 'opacity 0.2s' }}>
                                <IconButton size="small" onClick={() => {
                                    setSelectedContent(content);
                                    setContentForm({
                                        key: content.key,
                                        section: content.section,
                                        title: content.title || '',
                                        content: content.content || '',
                                        value: content.value || '',
                                        is_active: content.is_active
                                    });
                                    setContentDialogOpen(true);
                                }}>
                                    <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ open: true, id: content.key, type: 'content', title: content.key })}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>

                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label={content.section} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>key: {content.key}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h6" fontWeight="bold">{content.title || 'Untitled Block'}</Typography>
                                    {!content.is_active && (
                                        <Chip label="Hidden" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                                    )}
                                </Stack>
                                {content.value && (
                                    <Typography variant="h4" color="primary" fontWeight="900">{content.value}</Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {content.content}
                                </Typography>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const tabs = [
        { id: 'media', label: 'Global Media Library', icon: <PermMedia />, component: renderMediaLibrary() },
        { id: 'team', label: 'Team & Visionaries', icon: <Groups />, component: renderTeamManagement() },
        { id: 'content', label: 'Site Content (No-Code)', icon: <Visibility />, component: renderSiteContent() },
    ];

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PermMedia sx={{ fontSize: 40, color: 'primary.main' }} />
                    Content & Media Hub
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Centralized command center for managing organization assets and lead profiles.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            <SubTabView title="Content Management" tabs={tabs} activeTab={initialTab === 'content_management' ? 'media' : initialTab} />

            {/* Media Upload Dialog */}
            <Dialog open={mediaDialogOpen} onClose={() => setMediaDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Register Global Asset</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <TextField
                            label="Asset Title"
                            fullWidth
                            value={mediaForm.title}
                            onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                            placeholder="e.g. Campaign Hero Banner"
                            size="small"
                        />
                        <TextField
                            select
                            label="Classification"
                            fullWidth
                            value={mediaForm.source_type}
                            onChange={(e) => setMediaForm({ ...mediaForm, source_type: e.target.value })}
                            size="small"
                        >
                            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                                <MenuItem key={key} value={key}>{label}</MenuItem>
                            ))}
                        </TextField>
                        <ImageUploader
                            label="Media File"
                            value={mediaForm.file}
                            onChange={(file) => setMediaForm({ ...mediaForm, file })}
                            maxSizeMB={10}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setMediaDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleMediaUpload}
                        disabled={!mediaForm.file || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
                    >
                        Upload to Cloud
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Site Content Dialog */}
            <Dialog open={contentDialogOpen} onClose={() => setContentDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedContent ? 'Edit Content Block' : 'Define New Content Block'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2.5} sx={{ pt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Content Key (Slug)"
                                fullWidth
                                disabled={!!selectedContent}
                                value={contentForm.key}
                                onChange={(e) => setContentForm({ ...contentForm, key: e.target.value })}
                                placeholder="e.g. about-genesis-story"
                                helperText="Immutable identifier used in code"
                                size="small"
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                select
                                label="Section"
                                fullWidth
                                value={contentForm.section}
                                onChange={(e) => setContentForm({ ...contentForm, section: e.target.value })}
                                size="small"
                            >
                                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                                    <MenuItem key={key} value={key}>{label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Title / Header"
                                fullWidth
                                value={contentForm.title}
                                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                                size="small"
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Value / Stat (Optional)"
                                fullWidth
                                value={contentForm.value}
                                onChange={(e) => setContentForm({ ...contentForm, value: e.target.value })}
                                placeholder="e.g. 50+ or 10,000"
                                size="small"
                                sx={{ mb: 2 }}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={contentForm.is_active}
                                        onChange={(e) => setContentForm({ ...contentForm, is_active: e.target.checked })}
                                    />
                                }
                                label="Published (Publicly Visible)"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Narrative Content"
                                fullWidth
                                multiline
                                rows={8}
                                value={contentForm.content}
                                onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                                placeholder="Supports Markdown formatting..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setContentDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleContentSubmit}
                        disabled={loading || !contentForm.key}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                        Save Block
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Team Management Dialog */}
            <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedTeam ? 'Refine Visionary Profile' : 'Register New Visionary'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ pt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Full Name"
                                    fullWidth
                                    value={teamForm.name}
                                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                                    size="small"
                                />
                                <TextField
                                    label="Role / Title"
                                    fullWidth
                                    value={teamForm.role}
                                    onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                                    size="small"
                                />
                                <TextField
                                    label="Bio / Experience"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={teamForm.bio}
                                    onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                                />
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2.5}>
                                <ImageUploader
                                    label="Profile Image"
                                    value={teamForm.image || selectedTeam?.image}
                                    onChange={(file) => setTeamForm({ ...teamForm, image: file })}
                                    maxSizeMB={2}
                                />
                                <TextField
                                    label="LinkedIn URL"
                                    fullWidth
                                    value={teamForm.linkedin}
                                    onChange={(e) => setTeamForm({ ...teamForm, linkedin: e.target.value })}
                                    size="small"
                                    InputProps={{ startAdornment: <LinkedIn sx={{ mr: 1, color: 'text.disabled' }} /> }}
                                />
                                <TextField
                                    label="Twitter URL"
                                    fullWidth
                                    value={teamForm.twitter}
                                    onChange={(e) => setTeamForm({ ...teamForm, twitter: e.target.value })}
                                    size="small"
                                    InputProps={{ startAdornment: <Twitter sx={{ mr: 1, color: 'text.disabled' }} /> }}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={teamForm.is_active}
                                            onChange={(e) => setTeamForm({ ...teamForm, is_active: e.target.checked })}
                                        />
                                    }
                                    label="Active Visionary (Show on About Page)"
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setTeamDialogOpen(false)}>Dismiss</Button>
                    <Button
                        variant="contained"
                        onClick={handleTeamSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                        Save Profile
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })} PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to remove <strong>{deleteConfirm.title}</strong>? This action is irreversible.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={confirmDelete} disabled={loading}>Delete Permanently</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
