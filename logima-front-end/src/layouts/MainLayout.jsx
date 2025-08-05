import Header from '@/components/Header';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <>
      
        {/* --- Fixed full‑viewport dark backdrop --- */}
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#101010] via-[#141414] to-[#0d0d0d] pointer-events-none" />
      
        <Header />
        {/* all pages render here */}
        <Outlet />
    </>
  );
}