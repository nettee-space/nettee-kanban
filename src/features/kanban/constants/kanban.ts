export enum E_Team {
  all = 'All',
  lead = 'Lead',
  pl = 'PL',
  fe = 'FE',
  be = 'BE',
  ux = 'UX/UI',
}
export const sidebarList = ['project', 'team', 'assignee', 'label', 'more'];
export const projectList = ['All', 'Blolet'];
export const dummyLabels = ['보류', '낮음', '보통', '높음', '매우 높음'];

export const kanbanStyleMap = {
  TODO: {
    bg: 'bg-[#FFFBDE]',
    text: 'text-[#F9AA01]',
  },
  DOING: {
    bg: 'bg-[#E7F3FE]',
    text: 'text-[#1E85E4]',
  },
  DONE: {
    bg: 'bg-[#EEFBE6]',
    text: 'text-[#58BE1A]',
  },
  DEFAULT: {
    bg: 'bg-[#f5f5f5]',
    text: 'text-[#767676]',
  },
} as const;
