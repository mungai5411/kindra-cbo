/**
 * Keep-Alive Utility
 * 
 * Prevents the server from spinning down due to inactivity by sending
 * periodic ping requests to the backend API.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const PING_ENDPOINT = `${API_BASE_URL}/`; // Root API endpoint

let pingIntervalId: NodeJS.Timeout | null = null;

/**
 * Sends a ping request to the server
 */
const sendPing = async (): Promise<void> => {
  try {
    const response = await fetch(PING_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Keep-Alive] Server ping successful:', data.message || 'OK');
    } else {
      console.warn('[Keep-Alive] Server ping failed with status:', response.status);
    }
  } catch (error) {
    console.warn('[Keep-Alive] Server ping error:', error);
    // Silently fail - don't disrupt the user experience
  }
};

/**
 * Starts the keep-alive mechanism
 * Sends an initial ping and sets up periodic pings
 */
export const startKeepAlive = (): void => {
  if (pingIntervalId) {
    console.log('[Keep-Alive] Already running');
    return;
  }

  console.log('[Keep-Alive] Starting keep-alive mechanism');
  console.log(`[Keep-Alive] Pinging server every ${PING_INTERVAL / 1000 / 60} minutes`);

  // Send initial ping
  sendPing();

  // Set up periodic pings
  pingIntervalId = setInterval(sendPing, PING_INTERVAL);
};

/**
 * Stops the keep-alive mechanism
 */
export const stopKeepAlive = (): void => {
  if (pingIntervalId) {
    console.log('[Keep-Alive] Stopping keep-alive mechanism');
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
};

/**
 * Checks if keep-alive is currently running
 */
export const isKeepAliveActive = (): boolean => {
  return pingIntervalId !== null;
};
