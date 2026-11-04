import { useEffect, useState } from 'react';

const CALLBACK_NAME = '__hostListingGoogleMapsReady';
const PLACEHOLDER_KEY = 'your_google_maps_api_key_here';

// One script tag for the whole app; a failed load can be retried by a later mount.
let loaderPromise = null;

export const loadGoogleMaps = (apiKey) => {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    window[CALLBACK_NAME] = () => resolve(window.google.maps);
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&libraries=marker&loading=async&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.dataset.hostListingMaps = 'true';
    script.onerror = () => {
      loaderPromise = null;
      script.remove();
      reject(new Error('Không tải được Google Maps.'));
    };
    document.head.appendChild(script);
  });
  return loaderPromise;
};

const readApiKey = () => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return key && key !== PLACEHOLDER_KEY ? key : '';
};

// status: 'no-key' | 'loading' | 'ready' | 'error'
export const useGoogleMaps = () => {
  const apiKey = readApiKey();
  const [state, setState] = useState(() => ({ key: apiKey, status: apiKey ? 'loading' : 'no-key' }));

  useEffect(() => {
    if (!apiKey) return undefined;
    let active = true;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (active) setState({ key: apiKey, status: 'ready' });
      })
      .catch(() => {
        if (active) setState({ key: apiKey, status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [apiKey]);

  if (!apiKey) return 'no-key';
  return state.key === apiKey ? state.status : 'loading';
};
