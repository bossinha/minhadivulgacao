import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

// Pre-mount hash normalization: ensures links like #fortaleza, #fortaleza/, or bare paths
// are normalized to #/fortaleza so HashRouter always resolves the route on all mobile phones.
try {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash;
    if (rawHash && !rawHash.startsWith('#/')) {
      const clean = rawHash.replace(/^#\/?/, '');
      window.location.hash = `#/${clean}`;
    }
  }
} catch (e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

