import { useEffect, useState } from 'react';
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
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const keyPressed = event.key.toLowerCase() === 'a';
      const openCombo = keyPressed && event.shiftKey && (event.ctrlKey || event.metaKey);
      if (openCombo) {
        event.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-body selection:bg-primary/20 relative flex flex-col overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(13,78,216,0.18),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(249,115,22,0.16),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_35%,#f8fafc_100%)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 grid-pattern opacity-30" />
        <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />
        <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

        <div className="site-shell flex-1 relative z-10 pt-24 md:pt-28 flex flex-col">
          <AnimatedRoutes />
        </div>

        <Footer />
      </div>
    </Router>
  );
}
