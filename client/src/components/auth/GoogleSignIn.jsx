import { useEffect, useRef, useState } from 'react';

// Public OAuth client ID only — safe to ship in the frontend bundle.
// The secret never exists: GIS ID-token flow needs no client secret.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

let scriptPromise = null;
function loadGis() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load Google sign-in'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

function GoogleMark({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c0 1.1-.7 2.7-2 3.6l-.1.1 2.9 2.2.2.1c1.8-1.7 2.8-4.1 2.8-8.2z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.1.1-3 2.3v.1C4 21.3 7.7 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-2.9-2.3-.1.1C.7 8.9 0 10.4 0 12s.7 3.1 2.1 4.7l3.1-2.3z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.7 0 4 2.7 2.1 7.3l3.1 2.4c.9-2.9 3.6-5 6.8-5z" />
    </svg>
  );
}

// Official Google button (rendered by Google Identity Services) when a
// client ID is configured; Google-styled fallback otherwise.
// Closing the Google popup without signing in is a no-op by design —
// the user stays on the page and can retry, nothing gets stuck.
export default function GoogleSignIn({ mode = 'signin', onSuccess, onError }) {
  const btnRef = useRef(null);
  const cbRef = useRef({ onSuccess, onError });
  cbRef.current = { onSuccess, onError };
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !btnRef.current) return;
        btnRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => {
            if (resp?.credential) cbRef.current.onSuccess?.(resp.credential);
            else cbRef.current.onError?.('Google sign-in was cancelled. Please try again.');
          },
          // Popup closed / FedCM failure — stay on page, let the user retry
          error_callback: () => cbRef.current.onError?.('Google sign-in was cancelled. Please try again.'),
          ux_mode: 'popup',
        });
        const width = Math.min(btnRef.current.parentElement?.clientWidth || 320, 400);
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          type: 'standard',
          shape: 'pill',
          size: 'large',
          width,
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          logo_alignment: 'left',
        });
      })
      .catch(() => {
        if (!cancelled) setScriptFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  if (!CLIENT_ID || scriptFailed) {
    return (
      <button
        type="button"
        onClick={() => onError?.(
          scriptFailed
            ? 'Could not reach Google. Check your connection and try again.'
            : 'Google sign-in is not configured yet. The owner needs to add a client ID.'
        )}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-full py-3 px-4 transition-colors"
      >
        <GoogleMark />
        Continue with Google
      </button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={btnRef} aria-label="Continue with Google" />
    </div>
  );
}
