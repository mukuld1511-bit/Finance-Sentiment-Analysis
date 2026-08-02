import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Requests to the backend may be tunneled through ngrok's free tier, which
// serves an HTML "browser warning" interstitial instead of JSON unless this
// header is present. Patching fetch here covers every API call in the app
// without editing each component individually.
const apiOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
if (apiOrigin) {
  const originalFetch = window.fetch;
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    if (url.startsWith(apiOrigin)) {
      init = { ...init, headers: { ...(init?.headers || {}), 'ngrok-skip-browser-warning': 'true' } };
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);