'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { customer, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Customer Portal
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-black">
              {customer?.name || customer?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-black hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

