document.title = 'Kindra CBO Management System';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

console.log('Mounting Kindra App...');
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
        rootElement.innerHTML = `<div style="padding: 20px; border: 2px solid red;"><h1>Mount Error</h1><pre>${error.stack}</pre></div>`;
    }
} else {
    console.error('Root element #root not found!');
    document.body.innerHTML += '<h1 style="color:red">ERROR: Root element not found</h1>';
}
