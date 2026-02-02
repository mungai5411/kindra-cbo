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
            // Use native fetch for external URLs to ensure NO headers are sent
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors', // Explicitly request CORS access
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }

            blob = await response.blob();
        } else {
            // Use authenticated apiClient for internal URLs
            const response = await apiClient.get(url, {
                responseType: 'blob',
            });
            blob = new Blob([response.data]);
        }

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
