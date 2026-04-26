/**
 * API Client Configuration
 * Axios instance with authentication and error handling
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL_FROM_ENV = import.meta.env.VITE_API_URL || '/api/v1';

const rawBaseUrl = API_URL_FROM_ENV;
export const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

// Fetch client IP from the internet
let clientPublicIp: string | null = null;
if (typeof window !== 'undefined') {
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            if (data.ip) clientPublicIp = data.ip;
        })
        .catch(err => console.warn('Failed to fetch client IP:', err));
}

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for cookies/CORS
    headers: {
        // Axios defaults to 'application/json' for objects.
        // Removing this allows Axios to automatically set the correct 
        // Content-Type (with boundary) when sending FormData.
    },
    timeout: 60000, // 60 seconds
});

// Request interceptor - add auth token and client context
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (config.headers) {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            // Appending internet IP & Browser Time/Timezone context
            try {
                config.headers['X-Client-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
                config.headers['X-Client-Time'] = new Date().toISOString();
            } catch (e) {
                // Ignore Intl exceptions
            }
            if (clientPublicIp) {
                config.headers['X-Client-IP'] = clientPublicIp;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Try to refresh the token
                const response = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('accessToken', access);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                }

                processQueue(null, access);
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh failed - logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Redirect to home instead of login to avoid loops with LoginRedirect component
                window.location.href = '/';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

// API endpoints
export const endpoints = {
    // Authentication
    auth: {
        login: '/accounts/login/',
        register: '/accounts/register/',
        logout: '/accounts/logout/',
        refresh: '/accounts/token/refresh/',
        profile: '/accounts/profile/',
        users: '/accounts/users/',
        groups: '/accounts/groups/',
        passwordReset: '/accounts/password-reset/',
        passwordResetConfirm: '/accounts/password-reset-confirm/',
        googleLogin: '/accounts/google-login/',
        notifications: '/accounts/notifications/',
        bugReports: '/accounts/bug-reports/',
    },

    // Blog
    blog: {
        posts: '/blog/posts/',
        categories: '/blog/categories/',
        tags: '/blog/tags/',
        comments: '/blog/comments/',
        newsletter: '/blog/newsletter/subscribe/',
        adminPosts: '/blog/admin/posts/',
        adminCategories: '/blog/admin/categories/',
        adminTags: '/blog/admin/tags/',
        adminComments: '/blog/admin/comments/',
        media: '/blog/media/',
        adminMedia: '/blog/admin/media/',
    },

    // Donations
    donations: {
        campaigns: '/donations/campaigns/',
        donations: '/donations/',
        donors: '/donations/donors/',
        receipts: '/donations/receipts/',
        mpesa: '/donations/payments/mpesa/',
        mpesaStatus: '/donations/payments/mpesa/status/',
        paypal: '/donations/payments/paypal/',
        stripe: '/donations/payments/stripe/',
        materialDonations: '/donations/material-donations/',
        impact: '/donations/impact/',
        impactSummary: '/donations/impact/submit-summary/',
    },

    // Volunteers
    volunteers: {
        volunteers: '/volunteers/',
        tasks: '/volunteers/tasks/',
        taskApplications: '/volunteers/tasks/applications/',
        events: '/volunteers/events/',
        timelogs: '/volunteers/timelogs/',
        training: '/volunteers/training/',
        groups: '/volunteers/groups/',
        groupMessages: (groupId: string) => `/volunteers/groups/${groupId}/messages/`,
    },

    // Cases
    cases: {
        families: '/cases/families/',
        children: '/cases/children/',
        cases: '/cases/cases/',
        assessments: '/cases/assessments/',
        notes: '/cases/notes/',
    },

    // Shelters
    shelters: {
        shelters: '/shelters/',
        placements: '/shelters/placements/',
        resources: '/shelters/resources/',
        staff: '/shelters/staff/',
        requests: '/shelters/requests/',
        incidents: '/shelters/incidents/',
    },

    // Reports
    reports: {
        dashboard: '/reporting/dashboard/',
        reports: '/reporting/reports/',
        kpis: '/reporting/kpis/',
        analytics: '/reporting/activity/',
    },

    // Social Chat
    socialChat: {
        messages: '/social-chat/messages/',
        users: '/social-chat/messages/users/',
    },
};
