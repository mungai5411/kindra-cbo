document.title = 'Kindra CBO Management System';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Only log errors in development
const isDev = import.meta.env.DEV;

// Set up error logging for unhandled promise rejections
window.addEventListener('error', (event) => {
    if (isDev) console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    if (isDev) console.error('Unhandled promise rejection:', event.reason);
});

if (isDev) {
    console.log('Mounting Kindra App in DEVELOPMENT mode');
    console.log('Environment:', {
        mode: import.meta.env.MODE,
        apiUrl: import.meta.env.VITE_API_URL,
    });
}

const rootElement = document.getElementById('root');

if (rootElement) {
    try {
        const root = ReactDOM.createRoot(rootElement);
        
        root.render(
            <React.StrictMode>
                <Provider store={store}>
                    <ErrorBoundary>
                        <App />
                    </ErrorBoundary>
                </Provider>
            </React.StrictMode>
        );
        if (isDev) console.log('Render call successful');
    } catch (error: any) {
        console.error('Mount error:', error);
        if (isDev) console.error('Stack trace:', error?.stack);
        rootElement.innerHTML = `<div style="padding: 20px; border: 2px solid red; background: #fee;"><h1>Mount Error</h1><pre style="overflow: auto; max-height: 400px;">${error?.stack || error?.message || 'Unknown error'}</pre></div>`;
    }
} else {
    console.error('Root element #root not found!');
    document.body.innerHTML += '<h1 style="color:red">ERROR: Root element not found</h1>';
}
