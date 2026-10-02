import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MotionConfig } from 'framer-motion';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MotionConfig transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgb(var(--yumbite-card))',
                  color: 'rgb(var(--yumbite-white))',
                  border: '1px solid rgb(var(--yumbite-border) / 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--yumbite-shadow-xl)',
                },
                success: {
                  iconTheme: {
                    primary: 'rgb(var(--yumbite-yellow))',
                    secondary: 'rgb(var(--yumbite-black))',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'rgb(var(--yumbite-red))',
                    secondary: 'rgb(var(--yumbite-white))',
                  },
                },
              }}
            />
          </MotionConfig>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
