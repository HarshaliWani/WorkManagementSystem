import { StrictMode } from 'react';
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

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
  <StrictMode>
    <App />
  </StrictMode>
  </ErrorBoundary>
);
