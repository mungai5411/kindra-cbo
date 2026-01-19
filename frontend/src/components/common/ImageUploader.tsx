/**
 * ImageUploader Component
 * Reusable component for single image uploads with drag-and-drop, preview, and validation
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Button,
    Typography,
    IconButton,
    CircularProgress,
    alpha,
    useTheme,
    Alert
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    Image as ImageIcon,
    Close
} from '@mui/icons-material';

interface ImageUploaderProps {
    value?: string | File | null;
    onChange: (file: File | null) => void;
    onDelete?: () => Promise<void>;
    maxSizeMB?: number;
    accept?: string;
    label?: string;
    helperText?: string;
    disabled?: boolean;
    showPreview?: boolean;
}

export function ImageUploader({
    value,
    onChange,
    onDelete,
    maxSizeMB = 10,
    accept = 'image/*',
    label = 'Upload Image',
    helperText,
    disabled = false,
    showPreview = true
}: ImageUploaderProps) {
    const theme = useTheme();
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        
        if (acceptedFiles.length === 0) {
            setError('No valid image file selected');
            return;
        }

        const file = acceptedFiles[0];
        const maxBytes = maxSizeMB * 1024 * 1024;

        // Validate file size
        if (file.size > maxBytes) {
            setError(`Image must be smaller than ${maxSizeMB}MB`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        onChange(file);
    }, [maxSizeMB, onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { [accept]: [] },
        multiple: false,
        disabled
    });

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (onDelete) {
                await onDelete();
            }
            onChange(null);
            setPreview(null);
            setError(null);
        } catch (err) {
            setError('Failed to delete image');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRemove = () => {
        onChange(null);
        setPreview(null);
        setError(null);
    };

    // Determine current image URL
    const currentImageUrl = value instanceof File ? preview : (typeof value === 'string' ? value : null);
    const hasImage = !!currentImageUrl;

    return (
        <Box>
            {label && (
                <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: 'text.primary' }}>
                    {label}
                </Typography>
            )}

            {hasImage && showPreview ? (
                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: 'divider',
                        maxWidth: 400
                    }}
                >
                    <Box
                        component="img"
                        src={currentImageUrl}
                        alt="Preview"
                        sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: 300,
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 1
                        }}
                    >
                        {typeof value === 'string' && onDelete && (
                            <IconButton
                                size="small"
                                onClick={handleDelete}
                                disabled={isDeleting || disabled}
                                sx={{
                                    bgcolor: alpha(theme.palette.error.main, 0.9),
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 1)
                                    }
                                }}
                            >
                                {isDeleting ? (
                                    <CircularProgress size={20} sx={{ color: 'white' }} />
                                ) : (
                                    <Delete fontSize="small" />
                                )}
                            </IconButton>
                        )}
                        <IconButton
                            size="small"
                            onClick={handleRemove}
                            disabled={disabled}
                            sx={{
                                bgcolor: alpha(theme.palette.background.paper, 0.9),
                                '&:hover': {
                                    bgcolor: theme.palette.background.paper
                                }
                            }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.95),
                            borderTop: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Button
                            fullWidth
                            variant="outlined"
                            component="label"
                            disabled={disabled}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Replace Image
                            <input {...getInputProps()} />
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'divider',
                        borderRadius: 3,
                        p: 4,
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
                    
                    {isDragActive ? (
                        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    ) : (
                        <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    )}

                    <Typography variant="body1" fontWeight="600" gutterBottom>
                        {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        or click to browse
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Maximum size: {maxSizeMB}MB
                    </Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {helperText && !error && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {helperText}
                </Typography>
            )}
        </Box>
    );
}
