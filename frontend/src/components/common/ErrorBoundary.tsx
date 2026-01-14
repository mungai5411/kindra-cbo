import React from 'react';

type Props = {
    children: React.ReactNode;
};

type State = {
    hasError: boolean;
    error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = { hasError: false };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error): void {
        console.error('UI ErrorBoundary caught an error:', error);
    }

    public render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 24 }}>
                    <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
                    <p>The page crashed while rendering. You can refresh or go back to the dashboard.</p>
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                        {this.state.error?.message}
                    </pre>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: undefined });
                            window.location.reload();
                        }}
                        style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                    >
                        Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
