/**
 * ImageGallery Component
 * Manages multiple images with add, delete, reorder, and set primary functionality
 */

import { useState } from 'react';
import {
    Box,
    Grid,
    IconButton,
    Typography,
    Button,
    Dialog,
    DialogContent,
    CircularProgress,
    alpha,
    useTheme,
    Chip,
    Tooltip
} from '@mui/material';
import {
    Delete,
    Star,
    StarBorder,
    Add,
    Close,
    ZoomIn
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export interface ImageItem {
    id: string;
    url: string;
    isPrimary?: boolean;
}

interface ImageGalleryProps {
    images: ImageItem[];
    onAdd: (files: File[]) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onSetPrimary?: (id: string) => Promise<void>;
    maxImages?: number;
    disabled?: boolean;
    minImages?: number;
}

export function ImageGallery({
    images,
    onAdd,
    onDelete,
    onSetPrimary,
    maxImages = 10,
    disabled = false,
    minImages = 0
}: ImageGalleryProps) {
    const theme = useTheme();
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;

            // Check if adding files would exceed max
            if (images.length + acceptedFiles.length > maxImages) {
                alert(`Maximum ${maxImages} images allowed`);
                return;
            }

            setIsUploading(true);
            try {
                await onAdd(acceptedFiles);
            } catch (error) {
                console.error('Failed to upload images:', error);
            } finally {
                setIsUploading(false);
            }
        },
        accept: { 'image/*': [] },
        multiple: true,
        disabled: disabled || images.length >= maxImages
    });

    const handleDelete = async (id: string) => {
        if (images.length <= minImages) {
            alert(`At least ${minImages} image(s) required`);
            return;
        }

        if (!window.confirm('Delete this image?')) return;

        setDeletingId(id);
        try {
            await onDelete(id);
        } catch (error) {
            console.error('Failed to delete image:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetPrimary = async (id: string) => {
        if (!onSetPrimary) return;
        try {
            await onSetPrimary(id);
        } catch (error) {
            console.error('Failed to set primary image:', error);
        }
    };

    const lightboxSlides = images.map(img => ({ src: img.url }));

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="600">
                    Images ({images.length}/{maxImages})
                </Typography>
                {minImages > 0 && (
                    <Typography variant="caption" color="text.secondary">
                        Minimum {minImages} required
                    </Typography>
                )}
            </Box>

            <Grid container spacing={2}>
                {images.map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={image.id}>
                        <Box
                            sx={{
                                position: 'relative',
                                paddingBottom: '100%',
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '2px solid',
                                borderColor: image.isPrimary ? 'primary.main' : 'divider',
                                boxShadow: image.isPrimary ? theme.shadows[4] : theme.shadows[1],
                                '&:hover .image-actions': {
                                    opacity: 1
                                }
                            }}
                        >
                            <Box
                                component="img"
                                src={image.url}
                                alt={`Image ${index + 1}`}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />

                            {image.isPrimary && (
                                <Chip
                                    label="Primary"
                                    size="small"
                                    icon={<Star sx={{ fontSize: 16 }} />}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        bgcolor: alpha(theme.palette.primary.main, 0.9),
                                        color: 'white',
                                        fontWeight: 700,
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                />
                            )}

                            <Box
                                className="image-actions"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: alpha(theme.palette.common.black, 0.5),
                                    opacity: 0,
                                    transition: 'opacity 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1
                                }}
                            >
                                <Tooltip title="View Full Size">
                                    <IconButton
                                        size="small"
                                        onClick={() => setLightboxIndex(index)}
                                        sx={{
                                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                                            '&:hover': { bgcolor: theme.palette.background.paper }
                                        }}
                                    >
                                        <ZoomIn fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                {onSetPrimary && !image.isPrimary && (
                                    <Tooltip title="Set as Primary">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleSetPrimary(image.id)}
                                            disabled={disabled}
                                            sx={{
                                                bgcolor: alpha(theme.palette.warning.main, 0.9),
                                                color: 'white',
                                                '&:hover': { bgcolor: theme.palette.warning.main }
                                            }}
                                        >
                                            <StarBorder fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                <Tooltip title="Delete">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(image.id)}
                                        disabled={disabled || deletingId === image.id}
                                        sx={{
                                            bgcolor: alpha(theme.palette.error.main, 0.9),
                                            color: 'white',
                                            '&:hover': { bgcolor: theme.palette.error.main }
                                        }}
                                    >
                                        {deletingId === image.id ? (
                                            <CircularProgress size={16} sx={{ color: 'white' }} />
                                        ) : (
                                            <Delete fontSize="small" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Grid>
                ))}

                {/* Add Image Button */}
                {images.length < maxImages && (
                    <Grid item xs={6} sm={4} md={3}>
                        <Box
                            {...getRootProps()}
                            sx={{
                                paddingBottom: '100%',
                                position: 'relative',
                                border: '2px dashed',
                                borderColor: isDragActive ? 'primary.main' : 'divider',
                                borderRadius: 2,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                transition: 'all 0.3s',
                                '&:hover': disabled ? {} : {
                                    borderColor: 'primary.main',
                                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                                }
                            }}
                        >
                            <input {...getInputProps()} />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1
                                }}
                            >
                                {isUploading ? (
                                    <CircularProgress />
                                ) : (
                                    <>
                                        <Add sx={{ fontSize: 40, color: 'text.disabled' }} />
                                        <Typography variant="caption" color="text.secondary" textAlign="center" px={1}>
                                            {isDragActive ? 'Drop here' : 'Add Image'}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {images.length === 0 && (
                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'divider',
                        borderRadius: 3,
                        p: 6,
                        textAlign: 'center',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                        transition: 'all 0.3s',
                        '&:hover': disabled ? {} : {
                            borderColor: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                        }
                    }}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Add sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {isDragActive ? 'Drop images here' : 'Add Images'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Drag & drop or click to browse
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                {minImages > 0 ? `Minimum ${minImages} image(s) required` : `Maximum ${maxImages} images`}
                            </Typography>
                        </>
                    )}
                </Box>
            )}

            {/* Lightbox */}
            <Lightbox
                open={lightboxIndex >= 0}
                close={() => setLightboxIndex(-1)}
                index={lightboxIndex}
                slides={lightboxSlides}
            />
        </Box>
    );
}
