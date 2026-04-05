import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';

const ThreeCanvas = lazy(() => import('./components/ThreeCanvas'));

// Animated Route Wrapper
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [isAdminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret shortcut: Ctrl + Shift + A to toggle Admin Panel
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAdminOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary/30 relative flex flex-col overflow-x-hidden">
        {/* Deep 3D Space Background Layer */}
        <Suspense fallback={<div className="absolute inset-0 bg-slate-950 z-0" />}>
          <div className="fixed inset-0 pointer-events-none z-0">
            <ThreeCanvas />
          </div>
        </Suspense>

        <Navbar />
        <AdminPanel isOpen={isAdminOpen} onClose={() => setAdminOpen(false)} />

        <div className="flex-1 relative z-10 w-full pt-32 px-4 md:px-12 max-w-7xl mx-auto flex flex-col">
          <AnimatedRoutes />
        </div>

        <Footer />
      </div>
    </Router>
  );
}
