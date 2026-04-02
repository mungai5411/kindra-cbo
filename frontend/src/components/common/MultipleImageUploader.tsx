import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, IconButton, alpha, useTheme, Grid, Alert } from '@mui/material';
import { CloudUpload, Delete, Close } from '@mui/icons-material';

export interface MediaItem {
    id?: string;
    url?: string;
    file?: File;
}

interface MultipleImageUploaderProps {
    values?: MediaItem[];
    onChange: (files: MediaItem[]) => void;
    onDelete?: (id: string) => Promise<void>;
    maxSizeMB?: number;
    accept?: string;
    label?: string;
    helperText?: string;
    disabled?: boolean;
}

export function MultipleImageUploader({
    values = [],
    onChange,
    onDelete,
    maxSizeMB = 10,
    accept = 'image/*',
    label = 'Media Gallery Images',
    helperText,
    disabled = false,
}: MultipleImageUploaderProps) {
    const theme = useTheme();
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        const maxBytes = maxSizeMB * 1024 * 1024;
        
        const validFiles = acceptedFiles.filter(file => {
            if (file.size > maxBytes) return false;
            if (!file.type.startsWith('image/')) return false;
            return true;
        });

        if (validFiles.length !== acceptedFiles.length) {
            setError(`Some files were ignored (must be < ${maxSizeMB}MB and be images).`);
        }

        onChange([...values, ...validFiles.map(f => ({ file: f, url: URL.createObjectURL(f) }))]);
    }, [values, maxSizeMB, onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { [accept]: [] },
        multiple: true,
        disabled
    });

    const handleRemove = async (index: number) => {
        const item = values[index];
        if (item.id && onDelete) {
            try {
                await onDelete(item.id);
            } catch (err) {
                setError('Failed to delete media asset');
                return;
            }
        }
        const newValues = [...values];
        newValues.splice(index, 1);
        onChange(newValues);
    };

    return (
        <Box>
            {label && (
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                    {label}
                </Typography>
            )}

            <Grid container spacing={2} sx={{ mb: 2 }}>
                {values.map((val, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={val.id || idx}>
                        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', height: 120, border: '1px solid', borderColor: 'divider' }}>
                            <Box
                                component="img"
                                src={val.url}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleRemove(idx)}
                                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: alpha(theme.palette.background.paper, 0.8), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.9), color: '#fff' } }}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Box
                {...getRootProps()}
                sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'divider',
                    borderRadius: 3,
                    p: 3,
                    textAlign: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    transition: 'all 0.3s',
                    '&:hover': disabled ? {} : { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02) }
                }}
            >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 32, color: isDragActive ? 'primary.main' : 'text.disabled', mb: 1 }} />
                <Typography variant="body2" fontWeight="600">
                    {isDragActive ? 'Drop images here' : 'Drag & drop images to add to gallery'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    or click to browse ({maxSizeMB}MB max per file)
                </Typography>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2, py: 0 }}>
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
