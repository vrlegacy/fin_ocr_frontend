import { Outlet } from 'react-router';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { Auth0Provider } from '@auth0/auth0-react';
import { Toaster } from './ui/sonner';

export function Layout() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || "dev-f26bdihea4sqt7k4.us.auth0.com";
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "glTXHJq0MuLfyceaq1hbmjrBY42BgIKD";

  return (
    <ThemeProvider>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_API_URL || "https://finocr.onrender.com",
        }}
      >
        <AuthProvider>
          <Outlet />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </Auth0Provider>
    </ThemeProvider>
  );
}
