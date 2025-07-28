import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthActions, AuthState } from '@/features/kanban/types/auth';
import { supabase } from '@/shared/lib/supa-client';

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      status: 'loading',
      user: null,
      session: null,
      isLoading: false,

      // Actions
      setStatus: (status) => set({ status }),

      setUser: (user) => set({ user }),

      setSession: (session) => set({ session }),

      loginAsGuest: () => {
        set({
          status: 'guest',
          user: {
            id: 'guest',
            email: 'guest@example.com',
            name: 'Guest User',
          },
          session: null,
        });
      },

      loginWithGitHub: async () => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              scopes: 'read:user user:email read:org',
            },
          });

          if (error) throw error;

          // OAuth 리디렉션이 발생하므로 여기서는 상태 변경하지 않음
        } catch (error) {
          console.error('GitHub login failed:', error);
          set({ isLoading: false, status: 'unauthenticated' });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          if (get().status === 'guest') {
            // 게스트 로그아웃
            set({
              status: 'unauthenticated',
              user: null,
              session: null,
              isLoading: false,
            });
          } else {
            // GitHub 로그아웃
            await supabase.auth.signOut();
            set({
              status: 'unauthenticated',
              user: null,
              session: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Logout failed:', error);
          set({ isLoading: false });
        }
      },

      checkAuthStatus: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            set({
              status: 'authenticated',
              user: {
                id: session.user.id,
                email: session.user.email!,
                name:
                  session.user.user_metadata?.full_name || session.user.email!,
                avatar_url: session.user.user_metadata?.avatar_url,
                github_username: session.user.user_metadata?.user_name,
              },
              session,
            });
          } else {
            const currentStatus = get().status;
            if (currentStatus !== 'guest') {
              set({ status: 'unauthenticated' });
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ status: 'unauthenticated' });
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        await get().checkAuthStatus();
        set({ isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        status: state.status,
        user: state.user,
      }),
    }
  )
);
