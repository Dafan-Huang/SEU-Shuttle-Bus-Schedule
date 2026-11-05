import type { Route, UpcomingDeparture } from '../types';

const minutesInDay = 24 * 60;
const departuresPerRoute = 2;

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getUpcomingRoutes(today: Route[], tomorrow: Route[], queryMinutes: number) {
  return today.map((route, index) => {
    const upcoming: UpcomingDeparture[] = [];

    for (const loop of route.loopingServices ?? []) {
      const start = timeToMinutes(loop.startTime);
      const end = timeToMinutes(loop.endTime);
      if (queryMinutes > end) continue;

      const isLooping = queryMinutes >= start;
      upcoming.push({
        time: isLooping ? '--' : loop.startTime,
        minutesUntil: isLooping ? 0 : start - queryMinutes,
        routeDetail: loop.routeDetail,
        isTomorrow: false,
        isLooping
      });
    }

    for (const departure of route.departures) {
      if (upcoming.length >= departuresPerRoute) break;
      const minutesUntil = timeToMinutes(departure.time) - queryMinutes;
      if (minutesUntil > 0) {
        upcoming.push({ ...departure, minutesUntil, isTomorrow: false });
      }
    }

    const nextRoute = tomorrow[index];
    const minutesToMidnight = minutesInDay - queryMinutes;
    for (const loop of nextRoute?.loopingServices ?? []) {
      if (upcoming.length >= departuresPerRoute) break;
      upcoming.push({
        time: loop.startTime,
        minutesUntil: minutesToMidnight + timeToMinutes(loop.startTime),
        routeDetail: loop.routeDetail,
        isTomorrow: true,
        isLooping: false
      });
    }

    for (const departure of nextRoute?.departures ?? []) {
      if (upcoming.length >= departuresPerRoute) break;
      upcoming.push({
        ...departure,
        minutesUntil: minutesToMidnight + timeToMinutes(departure.time),
        isTomorrow: true
      });
    }

    return { ...route, upcoming };
  });
}
