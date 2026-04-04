import { useStore } from '../store/useStore';

export default function Footer() {
  const { companyName } = useStore();
  
  return (
    <footer className="border-t border-white/5 bg-black/40 py-12 px-8 mt-20 relative z-10 w-full text-center">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-70 text-sm font-medium text-gray-400">
        <div>&copy; {new Date().getFullYear()} {companyName}. All rights reserved. Edge OS running on neural core.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
        </div>
      </div>
    </footer>
  );
}
