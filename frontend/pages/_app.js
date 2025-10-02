import '../styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '../store/store';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Check auth state when app loads
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // If there's no token but user data exists, clean up
    if (!token && user) {
      localStorage.removeItem('user');
    }

    // If there's a token but no user data, clean up
    if (token && !user) {
      localStorage.removeItem('token');
    }
  }, []);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
