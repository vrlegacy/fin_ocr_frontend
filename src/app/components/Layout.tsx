import { Outlet } from 'react-router';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from './ui/sonner';

export function Layout() {
  return (
    <ThemeProvider>
      <Outlet />
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
