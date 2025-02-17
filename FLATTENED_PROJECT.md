# Flattened Project Code

This document combines the main files of the Lexara IP Management system into one file.

---

## File: src/App.jsx

```jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import PublicDashboard from './pages/Dashboard/components/PublicDashboard';
import ApplicationForm from './pages/ApplicationForm';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './providers/AuthProvider';
import { testSupabaseConnection } from './lib/supabase';
import AdminRoutes from './routes/adminRoutes';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  useEffect(() => {
    testSupabaseConnection().then(isConnected => {
      if (isConnected) {
        console.log('✅ Supabase connection verified');
      } else {
        console.error('❌ Supabase connection failed');
      }
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<PublicDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/applications/new" element={<ApplicationForm />} />
                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

---

## File: src/main.tsx

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## File: index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lexara IP Management</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## File: src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
  height: 100vh;
}

@layer base {
  body {
    @apply bg-background text-primary;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-background hover:bg-primary-light focus:ring-2 focus:ring-primary-lighter focus:ring-offset-2 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-background-alt text-primary border border-primary hover:bg-background focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors;
  }
}
```

---

## File: tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#484949',
          light: '#525252',
          lighter: '#636363',
        },
        background: {
          DEFAULT: '#EDEAE4',
          alt: '#EDEBE6',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```

---

## File: src/providers/AuthProvider.tsx

```tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthContextType {
  user: any;
  loading: boolean;
  error?: Error;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    console.log('AuthProvider mounted');
    console.log('Auth state:', {
      user: auth.user ? 'Logged in' : 'Not logged in',
      loading: auth.loading
    });
  }, [auth.user, auth.loading]);

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading authentication...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 
```

---

## File: src/lib/supabase.ts

```ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test function to verify connection
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!supabaseKey);
  
  try {
    // First test basic connection
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (userError) {
      console.error('Initial connection test error:', userError.message);
      if (userError.message.includes('authentication')) {
        console.error('❌ Authentication failed. Check your SUPABASE_ANON_KEY');
      } else if (userError.message.includes('does not exist')) {
        console.error('❌ User roles table not found. Run the migrations first.');
      }
      return false;
    }

    // Then test applications table
    const { data, error } = await supabase
      .from('applications')
      .select('count')
      .single();

    if (error) {
      console.error('Applications table test error:', error.message);
      if (error.message.includes('does not exist')) {
        console.error('❌ Applications table not found. Run the migrations first.');
      }
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('✅ Database tables exist and are accessible');
    return true;
  } catch (err) {
    console.error('Unexpected error during connection test:', err);
    return false;
  }
}
```

---

## File: src/components/NotificationBell.tsx

```tsx
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationContext } from '../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';
import NotificationBadge from './notifications/NotificationBadge';

export default function NotificationBell() {
  const { unreadCount } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <NotificationBadge
            count={unreadCount}
            priority={unreadCount > 10 ? 'high' : 'medium'}
          />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 sm:w-[32rem] z-50">
            <NotificationCenter onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
} 
```

---

*Additional files and their contents have been flattened in a similar manner.*

# End of Flattened Project Code 