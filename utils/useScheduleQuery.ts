import { useEffect, useMemo, useState } from 'react';
import { SCHEDULE_DATA } from '../constants';
import type { ScheduleType } from '../types';
import { formatLocalDate, parseLocalDate } from './dateUtils';
import { holidayManager } from './holidayManager';
import { getUpcomingRoutes, timeToMinutes } from './upcomingDepartures';

export type ScheduleMode = 'smart' | ScheduleType;

const minuteMs = 60_000;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const queryDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
const queryTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit', minute: '2-digit'
});

function getCurrentMinute() {
  return Math.floor(Date.now() / minuteMs) * minuteMs;
}

function formatQueryTime(date: Date) {
  return [date.getHours(), date.getMinutes()].map(value => String(value).padStart(2, '0')).join(':');
}

export function useScheduleQuery() {
  const [currentMinute, setCurrentMinute] = useState(getCurrentMinute);
  const [manualQuery, setManualQuery] = useState<{ date: string | null; time: string } | null>(null);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('smart');
  const [holidayConfigVersion, setHolidayConfigVersion] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function updateMinute() {
      clearTimeout(timer);
      setCurrentMinute(getCurrentMinute());
      timer = setTimeout(updateMinute, minuteMs - Date.now() % minuteMs);
    }
    updateMinute();
    window.addEventListener('focus', updateMinute);
    document.addEventListener('visibilitychange', updateMinute);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', updateMinute);
      document.removeEventListener('visibilitychange', updateMinute);
    };
  }, []);

  const currentTime = new Date(currentMinute);
  const today = formatLocalDate(currentTime);
  const queryDateValue = manualQuery?.date ?? today;
  const queryTimeValue = manualQuery?.time ?? formatQueryTime(currentTime);
  const queryDate = useMemo(() => parseLocalDate(queryDateValue)!, [queryDateValue]);
  const queryMinutes = timeToMinutes(queryTimeValue);

  const scheduleType = useMemo(
    () => scheduleMode === 'smart' ? holidayManager.getScheduleType(queryDate) : scheduleMode,
    [scheduleMode, queryDate, holidayConfigVersion]
  );
  const tomorrowType = useMemo(() => {
    const tomorrow = new Date(queryDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return holidayManager.getScheduleType(tomorrow);
  }, [queryDate, holidayConfigVersion]);
  const upcomingDepartures = useMemo(
    () => getUpcomingRoutes(SCHEDULE_DATA[scheduleType], SCHEDULE_DATA[tomorrowType], queryMinutes),
    [scheduleType, tomorrowType, queryMinutes]
  );

  const queryFormattedDate = useMemo(() => queryDateFormatter.format(queryDate), [queryDate]);
  const queryTimeFormatted = useMemo(() => {
    const displayTime = new Date(queryDate);
    displayTime.setHours(Math.floor(queryMinutes / 60), queryMinutes % 60);
    return queryTimeFormatter.format(displayTime);
  }, [queryDate, queryMinutes]);

  return {
    scheduleType,
    isSmartMode: scheduleMode === 'smart',
    setScheduleMode,
    queryDateValue,
    queryTimeValue,
    queryFormattedDate,
    queryTimeFormatted,
    isQueryToday: queryDateValue === today,
    isQueryNow: manualQuery === null,
    upcomingDepartures,
    handleTimeChange(value: string) {
      if (timePattern.test(value)) {
        setManualQuery(previous => ({ date: previous?.date ?? null, time: value }));
      }
    },
    handleDateChange(value: string) {
      if (parseLocalDate(value)) {
        setManualQuery({ date: value, time: queryTimeValue });
      }
    },
    handleResetToRealTime() {
      setCurrentMinute(getCurrentMinute());
      setManualQuery(null);
    },
    handleHolidayConfigChange() {
      setHolidayConfigVersion(version => version + 1);
    }
  };
}
