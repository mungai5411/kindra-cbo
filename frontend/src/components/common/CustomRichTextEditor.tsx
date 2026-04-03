import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    Box, IconButton, Paper, Tooltip, Divider, CircularProgress,
    MenuItem, Select, FormControl, ToggleButton, ToggleButtonGroup, alpha, useTheme
} from '@mui/material';
import {
    FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted,
    FormatListNumbered, FormatQuote, Image, Code,
    FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify,
    Link, HorizontalRule, Undo, Redo, Title, FormatSize, TextFields
} from '@mui/icons-material';

interface CustomRichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
    onImageUpload?: (file: File) => Promise<string>;
}

export default function CustomRichTextEditor({ value, onChange, placeholder, minHeight = 200, onImageUpload }: CustomRichTextEditorProps) {
    const theme = useTheme();
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Status of current formatting for selection awareness
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        listBulleted: false,
        listNumbered: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
        justifyFull: false,
        isDropcap: false
    });

    const updateActiveStates = useCallback(() => {
        if (!editorRef.current) return;
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            listBulleted: document.queryCommandState('insertUnorderedList'),
            listNumbered: document.queryCommandState('insertOrderedList'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull'),
            isDropcap: checkDropcapActive()
        });
    }, []);

    const checkDropcapActive = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return false;
        let container = selection.anchorNode as HTMLElement;
        if (container.nodeType === 3) container = container.parentElement!;
        
        const p = container.closest('p');
        return p ? p.classList.contains('drop-cap') : false;
    };

    // Sync external value to internal content editable if not focused
    useEffect(() => {
        if (editorRef.current && document.activeElement !== editorRef.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    useEffect(() => {
        const handleSelectionChange = () => {
            if (isFocused) updateActiveStates();
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [isFocused, updateActiveStates]);

    const execCmd = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
        handleChange();
        updateActiveStates();
    };

    const handleLink = () => {
        const url = prompt('Enter URL:', 'https://');
        if (url) execCmd('createLink', url);
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

    const handleAlignImage = (align: 'left' | 'right' | 'center' | 'none') => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        let container = selection.anchorNode as HTMLElement;
        if (container.nodeType === 3) container = container.parentElement!;
        
        // Find the image in or near the selection
        let img = container.tagName === 'IMG' ? container as HTMLImageElement : container.querySelector('img');
        
        if (img) {
            if (align === 'left') {
                img.style.float = 'left';
                img.style.marginRight = '1.5rem';
                img.style.marginBottom = '1rem';
                img.style.marginLeft = '0';
                img.style.display = 'inline';
            } else if (align === 'right') {
                img.style.float = 'right';
                img.style.marginLeft = '1.5rem';
                img.style.marginBottom = '1rem';
                img.style.marginRight = '0';
                img.style.display = 'inline';
            } else if (align === 'center') {
                img.style.float = 'none';
                img.style.display = 'block';
                img.style.margin = '1.5rem auto';
            } else {
                img.style.float = 'none';
                img.style.margin = '1rem 0';
                img.style.display = 'block';
            }
            handleChange();
        }
    };

    const handleDropcap = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        let container = selection.anchorNode as HTMLElement;
        if (container.nodeType === 3) container = container.parentElement!;
        
        const p = container.closest('p');
        if (p) {
            p.classList.toggle('drop-cap');
            handleChange();
            updateActiveStates();
        } else {
            // Force wrap in P if not in one
            execCmd('formatBlock', 'P');
            const newP = (window.getSelection()?.anchorNode as HTMLElement)?.closest('p');
            if (newP) {
                newP.classList.toggle('drop-cap');
                handleChange();
                updateActiveStates();
            }
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
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.2s',
                boxShadow: isFocused ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}` : 'none'
            }}
        >
            <Box sx={{ 
                p: 1, 
                display: 'flex', 
                gap: 0.5, 
                bgcolor: 'background.default', 
                borderBottom: '1px solid', 
                borderColor: 'divider', 
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* History */}
                <Tooltip title="Undo"><IconButton size="small" onClick={() => execCmd('undo')}><Undo fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Redo"><IconButton size="small" onClick={() => execCmd('redo')}><Redo fontSize="small" /></IconButton></Tooltip>
                
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* Text Style */}
                <Select
                    size="small"
                    defaultValue="P"
                    onChange={(e) => execCmd('formatBlock', e.target.value)}
                    sx={{ height: 32, fontSize: '0.8rem', minWidth: 80, '.MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                >
                    <MenuItem value="P">Paragraph</MenuItem>
                    <MenuItem value="H1">Heading 1</MenuItem>
                    <MenuItem value="H2">Heading 2</MenuItem>
                    <MenuItem value="H3">Heading 3</MenuItem>
                </Select>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* Main Formatting */}
                <ToggleButton
                    size="small"
                    value="bold"
                    selected={activeFormats.bold}
                    onClick={() => execCmd('bold')}
                    sx={{ border: 'none', borderRadius: 1 }}
                >
                    <FormatBold fontSize="small" />
                </ToggleButton>
                <ToggleButton
                    size="small"
                    value="italic"
                    selected={activeFormats.italic}
                    onClick={() => execCmd('italic')}
                    sx={{ border: 'none', borderRadius: 1 }}
                >
                    <FormatItalic fontSize="small" />
                </ToggleButton>
                <ToggleButton
                    size="small"
                    value="underline"
                    selected={activeFormats.underline}
                    onClick={() => execCmd('underline')}
                    sx={{ border: 'none', borderRadius: 1 }}
                >
                    <FormatUnderlined fontSize="small" />
                </ToggleButton>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* Alignments */}
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={activeFormats.justifyLeft ? 'left' : activeFormats.justifyCenter ? 'center' : activeFormats.justifyRight ? 'right' : 'full'}
                    onChange={(_, val) => val && execCmd(`justify${val.charAt(0).toUpperCase() + val.slice(1)}`)}
                    sx={{ border: 'none' }}
                >
                    <ToggleButton value="left" sx={{ border: 'none', borderRadius: 1 }}><FormatAlignLeft fontSize="small" /></ToggleButton>
                    <ToggleButton value="center" sx={{ border: 'none', borderRadius: 1 }}><FormatAlignCenter fontSize="small" /></ToggleButton>
                    <ToggleButton value="right" sx={{ border: 'none', borderRadius: 1 }}><FormatAlignRight fontSize="small" /></ToggleButton>
                    <ToggleButton value="full" sx={{ border: 'none', borderRadius: 1 }}><FormatAlignJustify fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* Lists & Features */}
                <ToggleButton
                    size="small"
                    value="ul"
                    selected={activeFormats.listBulleted}
                    onClick={() => execCmd('insertUnorderedList')}
                    sx={{ border: 'none', borderRadius: 1 }}
                >
                    <FormatListBulleted fontSize="small" />
                </ToggleButton>
                <ToggleButton
                    size="small"
                    value="ol"
                    selected={activeFormats.listNumbered}
                    onClick={() => execCmd('insertOrderedList')}
                    sx={{ border: 'none', borderRadius: 1 }}
                >
                    <FormatListNumbered fontSize="small" />
                </ToggleButton>
                
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                
                <Tooltip title="Link"><IconButton size="small" onClick={handleLink}><Link fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Horizontal Rule"><IconButton size="small" onClick={() => execCmd('insertHorizontalRule')}><HorizontalRule fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Quote"><IconButton size="small" onClick={() => execCmd('formatBlock', 'BLOCKQUOTE')}><FormatQuote fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Code"><IconButton size="small" onClick={() => execCmd('formatBlock', 'PRE')}><Code fontSize="small" /></IconButton></Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* Dropcap Toggle */}
                <Tooltip title="Dropcap Paragraph">
                    <ToggleButton
                        size="small"
                        val="dropcap"
                        selected={activeFormats.isDropcap}
                        onClick={handleDropcap}
                        sx={{ border: 'none', borderRadius: 1 }}
                    >
                        <TextFields fontSize="small" />
                    </ToggleButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* Image Tools */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Insert Image">
                        <IconButton size="small" onClick={handleImageInsert} disabled={isUploading} color={isUploading ? 'primary' : 'inherit'}>
                            {isUploading ? <CircularProgress size={16} /> : <Image fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    
                    {!isUploading && (
                        <>
                            <Tooltip title="Float Left"><IconButton size="small" onClick={() => handleAlignImage('left')}><FormatAlignLeft fontSize="inherit" style={{ fontSize: 14 }} /></IconButton></Tooltip>
                            <Tooltip title="Float Right"><IconButton size="small" onClick={() => handleAlignImage('right')}><FormatAlignRight fontSize="inherit" style={{ fontSize: 14 }} /></IconButton></Tooltip>
                            <Tooltip title="Standard Block"><IconButton size="small" onClick={() => handleAlignImage('none')}><HorizontalRule fontSize="inherit" style={{ fontSize: 14 }} /></IconButton></Tooltip>
                        </>
                    )}
                </Box>
                
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
                onBlur={() => {
                    setIsFocused(false);
                    // Selection handling might fail on blur, but we want to capture the final state
                }}
                onFocus={() => setIsFocused(true)}
                onKeyUp={updateActiveStates}
                onMouseUp={updateActiveStates}
                sx={{
                    p: 3,
                    minHeight: minHeight,
                    outline: 'none',
                    typography: 'body1',
                    color: 'text.primary',
                    lineHeight: 1.8,
                    '&:empty::before': {
                        content: `"${placeholder || 'Begin writing...'}"`,
                        color: 'text.disabled',
                    },
                    '& p': { mb: 2 },
                    '& h1': { typography: 'h3', fontWeight: 900, mb: 3, mt: 4 },
                    '& h2': { typography: 'h4', fontWeight: 800, mb: 2, mt: 3 },
                    '& h3': { typography: 'h5', fontWeight: 700, mb: 2, mt: 2 },
                    '& img': { 
                        maxWidth: '100%', 
                        borderRadius: 2, 
                        my: 2, 
                        display: 'block',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.01)' }
                    },
                    '& blockquote': { 
                        borderLeft: '4px solid', 
                        borderColor: 'primary.main', 
                        pl: 3, 
                        my: 3,
                        fontStyle: 'italic', 
                        color: 'text.secondary',
                        typography: 'h6',
                        lineHeight: 1.6
                    },
                    '& pre': { 
                        bgcolor: 'action.hover', 
                        p: 2, 
                        borderRadius: 2, 
                        overflowX: 'auto', 
                        fontFamily: 'monospace',
                        my: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                    },
                    '& p.drop-cap::first-letter': {
                        float: 'left',
                        fontSize: '4.5rem',
                        lineHeight: '3.5rem',
                        paddingTop: '0.4rem',
                        paddingRight: '0.8rem',
                        paddingLeft: '0.3rem',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 900,
                        color: theme.palette.primary.main,
                        textTransform: 'uppercase'
                    },
                    '& a': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                        fontWeight: 600
                    }
                }}
            />
        </Paper>
    );
}
