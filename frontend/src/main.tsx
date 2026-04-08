document.title = 'Kindra CBO Management System';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Set up error logging for unhandled promise rejections
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

console.log('Mounting Kindra App...');
console.log('Environment:', {
    mode: import.meta.env.MODE,
    viteEnv: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

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
        console.log('Render call successful');
    } catch (error: any) {
        console.error('Mount error:', error);
        console.error('Stack trace:', error?.stack);
        rootElement.innerHTML = `<div style="padding: 20px; border: 2px solid red; background: #fee;"><h1>Mount Error</h1><pre style="overflow: auto; max-height: 400px;">${error?.stack || error?.message || 'Unknown error'}</pre></div>`;
    }
} else {
    console.error('Root element #root not found!');
    document.body.innerHTML += '<h1 style="color:red">ERROR: Root element not found</h1>';
}
