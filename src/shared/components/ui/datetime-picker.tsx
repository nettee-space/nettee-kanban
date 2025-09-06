'use client';

import { type DateRange, type Locale } from 'react-day-picker';
import { Calendar } from './calendar';
import { cn } from '@/shared/lib/utils/cn';

interface DatePickerProps {
  mode?: 'single' | 'range';
  selected?: Date | DateRange;
  onSelect?: (date: any) => void; // 타입을 더 유연하게 변경
  className?: string;
  locale?: Locale;
  defaultMonth?: Date;
}

function DatePicker({ 
  mode = 'single', 
  selected, 
  onSelect,
  className,
  locale,
  defaultMonth
}: DatePickerProps) {
  return (
    <div className={cn("bg-white border rounded-lg shadow-lg", className)}>
      <Calendar
        mode={mode as any}
        selected={selected as any}
        onSelect={onSelect}
        locale={locale}
        defaultMonth={defaultMonth}
        className="border-0 shadow-none"
      />
    </div>
  );
}

// 한국시간 기준 날짜만 ISO String 생성 (시분초 제거)
export const toKoreanDateString = (date: Date): string => {
  // 한국 표준시(KST) 기준으로 날짜 생성
  const koreanDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
  
  // 날짜만 추출하여 한국시간 00:00:00으로 설정
  const year = koreanDate.getFullYear();
  const month = String(koreanDate.getMonth() + 1).padStart(2, '0');
  const day = String(koreanDate.getDate()).padStart(2, '0');
  
  // ISO 8601 형식으로 한국시간 기준 날짜 반환 (시분초는 00:00:00으로 고정)
  return `${year}-${month}-${day}T00:00:00+09:00`;
};

// 한국시간 날짜 ISO String을 Date 객체로 변환
export const fromKoreanDateString = (isoString: string): Date => {
  return new Date(isoString);
};

// Date 객체를 yyyy.mm.dd 포맷으로 변환
export const formatDateToYYYYMMDD = (date: Date | string): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  // 유효하지 않은 날짜 처리
  if (isNaN(targetDate.getTime())) {
    return '';
  }
  
  // 한국 시간 기준으로 변환
  const koreanDate = new Date(targetDate.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
  
  const year = koreanDate.getFullYear();
  const month = String(koreanDate.getMonth() + 1).padStart(2, '0');
  const day = String(koreanDate.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};

export { DatePicker };