'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('uttp_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.rol === 'vazirlik') router.replace('/dashboard');
        else if (u.rol === 'admin') router.replace('/admin');
        else router.replace('/profile');
        return;
      } catch {
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #06b6d4', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Tizim yuklanmoqda...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
