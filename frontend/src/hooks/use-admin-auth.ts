/**
 * Admin authentication hook.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAdmin, isLoading as authIsLoading } from '@/lib/auth';

export function useAdminAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      setIsLoading(true);
      
      if (authIsLoading()) {
        return;
      }

      const user = getCurrentUser();
      const admin = isAdmin();

      if (!user || !admin) {
        router.push('/login');
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }

      setIsLoading(false);
    };

    checkAdminAccess();
  }, [router]);

  return { isLoading, isAuthorized, user: getCurrentUser() };
}

