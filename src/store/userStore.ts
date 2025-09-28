import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { getNetteeUsers } from '@/supabase/api/netteeUser';

export interface NetteeUser {
  login: string;
  real_name: string;
  team_id: number[];
}

interface UserState {
  users: NetteeUser[];
  loading: boolean;
  error: string | null;
  loadUsers: () => Promise<void>;
  getUsersByTeamId: (teamId: number) => NetteeUser[];
  getUserByLogin: (login: string) => NetteeUser | undefined;
  getUserByRealName: (realName: string) => NetteeUser | undefined;
  getAllUsers: () => NetteeUser[];
  getUsersByTeamName: (
    teamName: string,
    teamList: [string, string][]
  ) => NetteeUser[];
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      users: [],
      loading: false,
      error: null,

      loadUsers: async () => {
        try {
          set({ loading: true, error: null });
          const users = await getNetteeUsers();
          set({ users, loading: false });
        } catch (error) {
          console.error('사용자 목록 로드 실패:', error);
          set({
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            loading: false,
          });
        }
      },

      getUsersByTeamId: (teamId: number) => {
        return get().users.filter((user) => user.team_id.includes(teamId));
      },

      getUserByLogin: (login: string) => {
        return get().users.find((user) => user.login === login);
      },

      getUserByRealName: (realName: string) => {
        return get().users.find((user) => user.real_name === realName);
      },

      getAllUsers: () => {
        return get().users;
      },

      // 팀 이름으로 사용자 목록 가져오기 (teamList를 통해 팀 이름을 ID로 변환)
      getUsersByTeamName: (teamName: string, teamList: [string, string][]) => {
        if (teamName === 'All' || teamName === '전체') {
          return get().users;
        }

        const team = teamList.find(
          ([id, name]) => name === teamName || id === teamName
        );
        if (!team) return [];

        const teamId = parseInt(team[0]);
        return get().getUsersByTeamId(teamId);
      },
    }),
    {
      name: 'user-store',
    }
  )
);
