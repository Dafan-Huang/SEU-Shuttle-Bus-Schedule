
import React, { memo, useCallback, useState } from 'react';
import { SCHEDULE_DATA } from './constants';
import type { Route, UpcomingDeparture } from './types';
import { BusIcon, CalendarIcon, SunIcon, MoonIcon, RouteIcon, ResetIcon, SettingsIcon } from './components/Icons';
import { HolidayManagerComponent } from './components/HolidayManager';
import { AppCredit } from './components/AppCredit';
import { TransitHeader } from './components/TransitHeader';
import { LiveClock } from './components/LiveClock';
import { AppearanceSettings } from './components/AppearanceSettings';
import { useScheduleQuery } from './utils/useScheduleQuery';

const DepartureCard: React.FC<{ route: Route; departures: UpcomingDeparture[]; isQueryToday: boolean }> = ({ route, departures, isQueryToday }) => (
  <div className="transit-route p-6 w-full">
    <div className="transit-route-heading flex items-center mb-4">
      <BusIcon className="w-6 h-6 text-cyan-400 mr-3" />
      <h3 className="text-xl font-bold text-slate-100">{route.name}</h3>
    </div>
    <div className="space-y-4">
      {departures.length > 0 ? (
        departures.map((departure, index) => (
          <div key={index} className="transit-departure flex justify-between items-center p-4 rounded-lg">
            <div className="min-w-0 flex-grow">
              <p className="text-2xl transit-time font-mono font-bold">{departure.time}</p>
              <div className="flex items-center gap-2 mt-2 text-slate-400">
                <RouteIcon className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">{departure.routeDetail}</p>
              </div>
              {departure.isTomorrow && <p className="text-xs text-amber-400 mt-1">明天</p>}
            </div>
            <div className="transit-countdown text-right flex-shrink-0 ml-4">
              {departure.isLooping ? (
                 <p className="text-lg font-semibold text-cyan-300">循环中</p>
              ) : (
                <>
                  <p className="text-lg font-semibold text-cyan-300">{departure.minutesUntil} 分钟</p>
                  <p className="text-xs text-slate-400">后</p>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 bg-slate-700/50 rounded-lg">
          <p className="text-slate-400">{isQueryToday ? '今日已无班次' : '当日已无班次'}</p>
        </div>
      )}
    </div>
  </div>
);

const FullScheduleView: React.FC<{ routes: Route[] }> = memo(({ routes }) => {
    return (
        <div className="mt-6 space-y-6">
            {routes.map((route, index) => {
                // Group departures by routeDetail
                const departuresByRoute = route.departures.reduce((acc, departure) => {
                    if (!acc[departure.routeDetail]) {
                        acc[departure.routeDetail] = [];
                    }
                    acc[departure.routeDetail].push(departure.time);
                    return acc;
                }, {} as Record<string, string[]>);

                return (
                    <div key={index} className="transit-schedule p-4">
                        <h4 className="text-lg font-semibold text-cyan-400 mb-3 border-b border-slate-700 pb-2">{route.name}</h4>
                        
                        {/* Display looping services */}
                        {route.loopingServices && route.loopingServices.length > 0 && (
                            <div className="space-y-4 mb-4">
                                {route.loopingServices.map((loop, loopIndex) => (
                                    <div key={`loop-${loopIndex}`}>
                                        <p className="text-sm text-slate-300 mb-2 flex items-center gap-2">
                                            <RouteIcon className="w-4 h-4 flex-shrink-0" />
                                            <span>{loop.routeDetail}</span>
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                          <div className="transit-time-slot text-center py-1 px-2 col-span-2">
                                              <span className="font-mono text-sm text-white">{loop.startTime} - {loop.endTime}</span>
                                          </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Display timed departures */}
                        <div className="space-y-4">
                            {Object.entries(departuresByRoute).map(([routeDetail, times]: [string, string[]]) => (
                                <div key={routeDetail}>
                                    <p className="text-sm text-slate-300 mb-2 flex items-center gap-2">
                                        <RouteIcon className="w-4 h-4 flex-shrink-0" />
                                        <span>{routeDetail}</span>
                                    </p>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                        {times.map((time, timeIndex) => (
                                            <div key={timeIndex} className="transit-time-slot text-center py-1 px-2">
                                                <span className="font-mono text-sm text-white">{time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});


const App: React.FC = () => {
  const {
    scheduleType, isSmartMode, setScheduleMode, queryDateValue, queryTimeValue,
    queryFormattedDate, isQueryToday, isQueryNow, upcomingDepartures,
    handleTimeChange, handleDateChange, handleResetToRealTime, handleHolidayConfigChange
  } = useScheduleQuery();
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [showHolidayManager, setShowHolidayManager] = useState(false);
  const [showAppearanceSettings, setShowAppearanceSettings] = useState(false);
  const closeAppearanceSettings = useCallback(() => setShowAppearanceSettings(false), []);

  return (
    <div className="transit-shell min-h-screen font-sans">
      <div className="transit-container mx-auto">
        <TransitHeader>
          <button
            onClick={() => setShowAppearanceSettings(true)}
            className="transit-settings"
            aria-label="打开外观设置"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </TransitHeader>

        <div className="transit-panel p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <LiveClock />
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center bg-slate-900 rounded-full p-1">
                        <button
                            onClick={() => setScheduleMode('smart')}
                            aria-pressed={isSmartMode}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${isSmartMode ? 'transit-selected' : 'text-slate-300 hover:bg-slate-600'}`}
                        >
                            <SettingsIcon className="w-4 h-4"/>
                            智能
                        </button>
                        <button
                            onClick={() => setScheduleMode('weekday')}
                            aria-pressed={!isSmartMode && scheduleType === 'weekday'}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${!isSmartMode && scheduleType === 'weekday' ? 'transit-selected' : 'text-slate-300 hover:bg-slate-600'}`}
                        >
                            <MoonIcon className="w-4 h-4"/>
                            工作日
                        </button>
                        <button
                            onClick={() => setScheduleMode('holiday')}
                            aria-pressed={!isSmartMode && scheduleType === 'holiday'}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${!isSmartMode && scheduleType === 'holiday' ? 'transit-selected' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            <SunIcon className="w-4 h-4"/>
                            节假日
                        </button>
                    </div>
                    <button
                        onClick={() => setShowHolidayManager(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors text-sm"
                    >
                        <CalendarIcon className="w-4 h-4" />
                        节假日设置
                    </button>
                </div>
            </div>
             <div className="border-t border-slate-700 my-4"></div>
            
            {/* 日期和时间选择器 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <label className="text-sm font-medium text-slate-300">
                    查询时间：
                </label>
                <input
                    type="date"
                    id="queryDate"
                    value={queryDateValue}
                    onChange={event => handleDateChange(event.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-white transit-field font-mono text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    aria-label="查询日期"
                />
                <input
                    type="time"
                    id="queryTime"
                    value={queryTimeValue}
                    onChange={event => handleTimeChange(event.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-white transit-field font-mono text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    aria-label="查询时间"
                />
                <button
                    onClick={handleResetToRealTime}
                    className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isQueryNow}
                    aria-label="使用当前时间"
                >
                    <ResetIcon className="w-4 h-4"/>
                    <span>使用当前时间</span>
                </button>
            </div>
        </div>

        <main className="space-y-8">
            <div className="transit-section-heading">
                {!isQueryToday && (
                    <p className="text-lg text-amber-400 mb-2">
                        查询日期：{queryFormattedDate}
                    </p>
                )}
                <h2 className="text-2xl font-bold text-slate-300 flex flex-wrap items-center gap-3">
                    <CalendarIcon className="w-6 h-6"/>
                    <span className="transit-badge">{scheduleType === 'weekday' ? '工作日' : '节假日'}</span>
                    {isQueryToday ? '即将发车' : '班次信息'}
                </h2>
            </div>
          <div className="transit-routes">
            {upcomingDepartures.map((route, index) => (
              <DepartureCard key={index} route={route} departures={route.upcoming} isQueryToday={isQueryToday} />
            ))}
          </div>
        </main>

        <footer className="text-center mt-12">
            <button
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                aria-expanded={showFullSchedule}
                className="transit-schedule-toggle font-semibold py-2 px-6 rounded-lg transition-all"
            >
                {showFullSchedule ? '隐藏' : '显示'}完整时刻表
            </button>
            {showFullSchedule && <FullScheduleView routes={SCHEDULE_DATA[scheduleType]} />}
            <AppCredit />
        </footer>

      </div>
      
      {/* 节假日管理器 */}
      <AppearanceSettings isOpen={showAppearanceSettings} onClose={closeAppearanceSettings} />
      {showHolidayManager && (
        <HolidayManagerComponent
          onClose={() => setShowHolidayManager(false)}
          onConfigChange={handleHolidayConfigChange}
        />
      )}
    </div>
  );
};

export default App;
