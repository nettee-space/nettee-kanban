export type AuthStatus =
  | 'loading'
  | 'guest'
  | 'authenticated'
  | 'unauthenticated';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  github_username?: string;
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: any; // Supabase Session 타입
  isLoading: boolean;

  // Computed properties (getters) - boolean 헬퍼들
  readonly isGuest: boolean;
  readonly isAuthenticated: boolean;
  readonly isGitHubUser: boolean;
  readonly isUnauthenticated: boolean;
  readonly isLoadingAuth: boolean;
}

export interface AuthActions {
  setStatus: (status: AuthStatus) => void;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  loginAsGuest: () => void;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
