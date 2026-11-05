import assert from 'node:assert/strict';
import { SCHEDULE_DATA } from '../constants.ts';
import { getUpcomingRoutes } from '../utils/upcomingDepartures.ts';

const weekday = SCHEDULE_DATA.weekday;
const holiday = SCHEDULE_DATA.holiday;
const firstRoute = (today, tomorrow, hour, minute) =>
  getUpcomingRoutes(today, tomorrow, hour * 60 + minute)[0].upcoming;

const beforeLoop = firstRoute(weekday, weekday, 7, 19);
assert.equal(beforeLoop[0].time, '07:20');
assert.equal(beforeLoop[0].minutesUntil, 1);
assert.equal(beforeLoop[0].isLooping, false);

assert.equal(firstRoute(weekday, weekday, 7, 20)[0].isLooping, true);
assert.equal(firstRoute(weekday, weekday, 9, 40)[0].isLooping, true);
assert.equal(firstRoute(weekday, weekday, 9, 41)[0].time, '10:00');

// A fixed departure is excluded once the clock reaches that minute.
assert.equal(firstRoute(holiday, holiday, 7, 20)[0].time, '07:40');
const duplicate = firstRoute(weekday, weekday, 7, 29);
assert.equal(duplicate[0].isLooping, true);
assert.equal(duplicate[1].time, '07:30');

const nextWeekday = firstRoute(weekday, weekday, 23, 0);
assert.equal(nextWeekday[0].time, '07:20');
assert.equal(nextWeekday[0].minutesUntil, 500);
assert.equal(nextWeekday[0].isTomorrow, true);
assert.equal(nextWeekday[1].time, '07:30');

const nextHoliday = firstRoute(weekday, holiday, 23, 0);
assert.deepEqual(nextHoliday.map(item => item.time), ['07:20', '07:40']);
assert.ok(nextHoliday.every(item => item.isTomorrow));

console.log('Upcoming departure boundary checks passed.');
