// src/hooks/useAuth.ts
import { useEffect } from 'react';

import { supabase } from '@/shared/lib/supa-client';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const authStore = useAuthStore();

  useEffect(() => {
    // 초기 인증 상태 확인
    authStore.initializeAuth();

    // Supabase 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        authStore.setStatus('authenticated');
        authStore.setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!,
          avatar_url: session.user.user_metadata?.avatar_url,
          github_username: session.user.user_metadata?.user_name,
        });
        authStore.setSession(session);
      } else if (event === 'SIGNED_OUT') {
        if (authStore.status !== 'guest') {
          authStore.setStatus('unauthenticated');
          authStore.setUser(null);
          authStore.setSession(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return authStore;
};
