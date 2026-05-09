/**
 * Utility to handle secure file downloads via Axios
 * This ensures JWT tokens are sent with the request to prevent 401 logouts
 */
import apiClient from '../api/client';

/**
 * Downloads a file from a given URL
 * - Uses apiClient (with auth) for relative/internal URLs
 * - Uses native fetch (no auth) for external URLs to avoid CORS/401 issues
 * @param url The relative or absolute URL to download from
 * @param defaultFilename Recommended filename for the download
 */
export const downloadFile = async (url: string, defaultFilename: string = 'download') => {
    try {
        const isExternal = url.startsWith('http') || url.startsWith('//');

        let blob: Blob;

        if (isExternal) {
            // For external URLs (like Cloudinary), direct download via fetch often fails with 401/CORS
            // Fallback to direct opening using a link element (more reliable than window.open)
            
            let finalUrl = url;
            // Optimization for Cloudinary: Add fl_attachment to force download if it's an upload URL
            if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.includes('fl_attachment')) {
                finalUrl = url.replace('/upload/', '/upload/fl_attachment/');
            }

            const link = document.createElement('a');
            link.href = finalUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            // link.setAttribute('download', defaultFilename); // Note: only works for same-origin or fl_attachment
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Use authenticated apiClient for internal URLs
        const response = await apiClient.get(url, {
            responseType: 'blob',
        });
        blob = new Blob([response.data]);

        // Create blob link to download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', defaultFilename);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};
