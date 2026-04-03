import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Paper, Tooltip, Divider, CircularProgress } from '@mui/material';
import {
    FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted,
    FormatListNumbered, FormatQuote, Image, Code
} from '@mui/icons-material';

interface CustomRichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
    onImageUpload?: (file: File) => Promise<string>;
}

export default function CustomRichTextEditor({ value, onChange, placeholder, minHeight = 200, onImageUpload }: CustomRichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Sync external value to internal content editable if not focused
    useEffect(() => {
        if (editorRef.current && document.activeElement !== editorRef.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const execCmd = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
        handleChange();
    };

    const handleImageInsert = () => {
        if (onImageUpload) {
            fileInputRef.current?.click();
        } else {
            const url = prompt('Enter Image URL:');
            if (url) {
                execCmd('insertImage', url);
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onImageUpload) return;

        setIsUploading(true);
        try {
            const url = await onImageUpload(file);
            execCmd('insertImage', url);
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleChange = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                border: '1px solid',
                borderColor: isFocused ? 'primary.main' : 'divider',
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            <Box sx={{ p: 0.5, display: 'flex', gap: 0.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
                <Tooltip title="Bold"><IconButton size="small" onClick={() => execCmd('bold')}><FormatBold fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Italic"><IconButton size="small" onClick={() => execCmd('italic')}><FormatItalic fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Underline"><IconButton size="small" onClick={() => execCmd('underline')}><FormatUnderlined fontSize="small" /></IconButton></Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Tooltip title="Bullet List"><IconButton size="small" onClick={() => execCmd('insertUnorderedList')}><FormatListBulleted fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Number List"><IconButton size="small" onClick={() => execCmd('insertOrderedList')}><FormatListNumbered fontSize="small" /></IconButton></Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Tooltip title="Blockquote"><IconButton size="small" onClick={() => execCmd('formatBlock', 'BLOCKQUOTE')}><FormatQuote fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Code snippet"><IconButton size="small" onClick={() => execCmd('formatBlock', 'PRE')}><Code fontSize="small" /></IconButton></Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Tooltip title="Insert Image">
                    <IconButton size="small" onClick={handleImageInsert} disabled={isUploading}>
                        {isUploading ? <CircularProgress size={16} color="primary" /> : <Image fontSize="small" />}
                    </IconButton>
                </Tooltip>
                
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </Box>
            <Box
                ref={editorRef}
                contentEditable
                onInput={handleChange}
                onBlur={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
                sx={{
                    p: 2,
                    minHeight: minHeight,
                    outline: 'none',
                    typography: 'body1',
                    '&:empty::before': {
                        content: `"${placeholder || 'Write here...'}"`,
                        color: 'text.disabled',
                    },
                    '& img': { maxWidth: '100%', borderRadius: 1, my: 1, display: 'block' },
                    '& blockquote': { borderLeft: '4px solid', borderColor: 'primary.main', pl: 2, ml: 0, fontStyle: 'italic', color: 'text.secondary' },
                    '& pre': { bgcolor: 'action.hover', p: 1, borderRadius: 1, overflowX: 'auto', fontFamily: 'monospace' }
                }}
            />
        </Paper>
    );
}
