/**
 * Utility to handle secure file downloads via Axios
 * This ensures JWT tokens are sent with the request to prevent 401 logouts
 */
import apiClient from '../api/client';

/**
 * Downloads a file from a given URL using the authenticated apiClient
 * @param url The relative or absolute URL to download from
 * @param defaultFilename Recommended filename for the download
 */
export const downloadFile = async (url: string, defaultFilename: string = 'download') => {
    try {
        const response = await apiClient.get(url, {
            responseType: 'blob',
        });

        // Try to get filename from content-disposition header
        let filename = defaultFilename;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition && contentDisposition.includes('filename=')) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        // Create blob link to download
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        // We don't throw here to avoid triggering global error handlers 
        // if the caller wants to handle it specifically
        throw error;
    }
};
