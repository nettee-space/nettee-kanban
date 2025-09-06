// components/Sidebar/AssigneeFilter.tsx
import { useEffect } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Checkbox } from '@/shared/components/ui/checkbox';

import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';
import { cn } from '@/shared/lib/utils/cn';
import { useUserStore } from '@/store/userStore';
import { useFilterStore } from '../../store/filterStore';

export function AssigneeFilter() {
  const {
    selectedTeams,
    selectedAssignees,
    toggleTeam,
    toggleAssignee,
    teamList,
    loadTeamList,
  } = useFilterStore();

  const { users, loadUsers } = useUserStore();

  useEffect(() => {
    loadTeamList();
    if (users.length === 0) {
      loadUsers();
    }
  }, [loadTeamList, users.length, loadUsers]);

  const teamObjects = teamList.map(([id, name]) => ({ id, name }));

  // 동적 사용자 데이터 사용
  const teamMembers = selectedTeams.includes('All')
    ? users
    : selectedTeams.flatMap((teamId) => {
        return users.filter((user) => user.team_id.includes(parseInt(teamId)));
      });

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <Accordion
        type="single"
        collapsible
        defaultValue="assignee"
        className="w-full"
      >
        <AccordionItem value="assignee" className="border-none">
          <AccordionTrigger className="text-black-8 py-0 text-sm font-semibold hover:no-underline">
            <p>담당자</p>
          </AccordionTrigger>

          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-sm">
            <div className="flex flex-wrap gap-[8px] pt-[8px] pb-[16px]">
              {teamObjects.map((team) => (
                <Button
                  key={`${team.id}_button`}
                  type="button"
                  variant={'default'}
                  className={`flex h-[28px] w-[60px] cursor-pointer items-center justify-center text-xs ${
                    selectedTeams.includes(team.id)
                      ? 'bg-primary-12 text-white'
                      : 'text-black-7 bg-[#ededed]'
                  }`}
                  onClick={() => toggleTeam(team.id)}
                >
                  {team.name}
                </Button>
              ))}
            </div>

            <ul className="h-[306px] w-full space-y-1 overflow-y-scroll">
              {teamMembers.map((user) => {
                const checked = selectedAssignees.includes(user.login);
                return (
                  <li
                    key={`${user.login}_assignee`}
                    className="px-[8px] py-[4px]"
                  >
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-[8px] font-medium',
                        checked ? 'text-black-13' : 'text-black-7'
                      )}
                    >
                      <Checkbox
                        id={`checkbox-${user.login}`}
                        checked={checked}
                        onCheckedChange={() => {
                          console.log('toggleAssignee 호출값: ', user.login);
                          toggleAssignee(user.login);
                        }}
                      />
                      <Icon
                        src={ICONS.worker24}
                        size={24}
                        alt={`${user.real_name}-github-profile`}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.real_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          @{user.login}
                        </span>
                        {user.team_id.length > 1 && (
                          <span className="text-xs text-blue-600">
                            다중 팀:{' '}
                            {user.team_id
                              .map(
                                (id) =>
                                  teamList.find(
                                    ([tId]) => tId === id.toString()
                                  )?.[1] || id
                              )
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
