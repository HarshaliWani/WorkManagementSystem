import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800">Something went wrong:</p>
      <pre className="text-sm text-red-600">{error.message}</pre>
    </div>
  );
}

// React.StrictMode removed for production to eliminate dev warnings
// StrictMode causes double-renders and extra warnings that are only useful in development
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
);
