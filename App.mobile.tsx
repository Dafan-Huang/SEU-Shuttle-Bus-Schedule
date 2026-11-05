import React, { memo, useState } from 'react';
import { SCHEDULE_DATA } from './constants';
import type { ScheduleType, Route, UpcomingDeparture } from './types';
import { BusIcon, CalendarIcon, SunIcon, MoonIcon, RouteIcon, ResetIcon, SettingsIcon } from './components/Icons';
import { HolidayManagerComponent } from './components/HolidayManager';
import { AppCredit } from './components/AppCredit';
import { TransitHeader } from './components/TransitHeader';
import { LiveClock } from './components/LiveClock';
import { TransitPalette } from './components/TransitPalette';
import { useScheduleQuery } from './utils/useScheduleQuery';
import type { ScheduleMode } from './utils/useScheduleQuery';

const DepartureCard: React.FC<{ route: Route; departures: UpcomingDeparture[]; isQueryToday: boolean }> = ({ route, departures, isQueryToday }) => (
  <div className="transit-route p-4 w-full">
    <div className="transit-route-heading flex items-center mb-3">
      <BusIcon className="w-5 h-5 text-cyan-400 mr-2" />
      <h3 className="text-lg font-bold text-slate-100">{route.name}</h3>
    </div>
    <div className="space-y-3">
      {departures.length > 0 ? (
        departures.map((departure, index) => (
          <div key={index} className="transit-departure flex justify-between items-center p-3 rounded-lg">
            <div className="min-w-0 flex-grow">
              <p className="text-xl transit-time font-mono font-bold">{departure.time}</p>
              <div className="flex items-center gap-2 mt-1 text-slate-400">
                <RouteIcon className="w-3 h-3 flex-shrink-0" />
                <p className="text-xs">{departure.routeDetail}</p>
              </div>
              {departure.isTomorrow && <p className="text-xs text-amber-400 mt-1">明天</p>}
            </div>
            <div className="transit-countdown text-right flex-shrink-0 ml-3">
              {departure.isLooping ? (
                 <p className="text-base font-semibold text-cyan-300">循环中</p>
              ) : (
                <>
                  <p className="text-base font-semibold text-cyan-300">{departure.minutesUntil} 分钟</p>
                  <p className="text-xs text-slate-400">后</p>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-3 bg-slate-700/50 rounded-lg">
          <p className="text-slate-400 text-sm">{isQueryToday ? '今日已无班次' : '当日已无班次'}</p>
        </div>
      )}
    </div>
  </div>
);

const FullScheduleView: React.FC<{ routes: Route[] }> = memo(({ routes }) => {
    return (
        <div className="mt-4 space-y-4">
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
                    <div key={index} className="transit-schedule p-3">
                        <h4 className="text-base font-semibold text-cyan-400 mb-2 border-b border-slate-700 pb-1">{route.name}</h4>
                        
                        {/* Display looping services */}
                        {route.loopingServices && route.loopingServices.length > 0 && (
                            <div className="space-y-3 mb-3">
                                {route.loopingServices.map((loop, loopIndex) => (
                                    <div key={`loop-${loopIndex}`}>
                                        <p className="text-xs text-slate-300 mb-1 flex items-center gap-1">
                                            <RouteIcon className="w-3 h-3 flex-shrink-0" />
                                            <span>{loop.routeDetail}</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-1">
                                          <div className="transit-time-slot text-center py-1 px-2 col-span-2">
                                              <span className="font-mono text-xs text-white">{loop.startTime} - {loop.endTime}</span>
                                          </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Display timed departures */}
                        <div className="space-y-3">
                            {Object.entries(departuresByRoute).map(([routeDetail, times]: [string, string[]]) => (
                                <div key={routeDetail}>
                                    <p className="text-xs text-slate-300 mb-1 flex items-center gap-1">
                                        <RouteIcon className="w-3 h-3 flex-shrink-0" />
                                        <span>{routeDetail}</span>
                                    </p>
                                    <div className="grid grid-cols-4 gap-1">
                                        {times.map((time, timeIndex) => (
                                            <div key={timeIndex} className="transit-time-slot text-center py-1 px-1">
                                                <span className="font-mono text-xs text-white">{time}</span>
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

// 控制面板组件
const ControlPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  queryTimeValue: string;
  queryDateValue: string;
  scheduleType: ScheduleType;
  isSmartMode: boolean;
  onTimeChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onScheduleModeChange: (mode: ScheduleMode) => void;
  onShowHolidayManager: () => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  onClose,
  queryTimeValue,
  queryDateValue,
  scheduleType,
  isSmartMode,
  onTimeChange,
  onDateChange,
  onScheduleModeChange,
  onShowHolidayManager,
  onConfirm
}) => {
  return (
    <div hidden={!isOpen}>
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="mobile-settings-title"
        className="transit-panel w-full max-w-sm mt-16 mr-2 self-start max-h-[calc(100%-4rem)] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 id="mobile-settings-title" className="text-lg font-bold text-slate-100">控制面板</h3>
            <button
              onClick={onClose}
              aria-label="关闭控制面板"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 模式选择 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-300 block mb-2">时刻表模式</label>
            <div className="flex items-center bg-slate-900 rounded-lg p-1">
              <button
                onClick={() => onScheduleModeChange('smart')}
                aria-pressed={isSmartMode}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-300 flex items-center gap-1 flex-1 justify-center ${isSmartMode ? 'transit-selected' : 'text-slate-300 hover:bg-slate-600'}`}
              >
                <SettingsIcon className="w-3 h-3"/>
                智能
              </button>
              <button
                onClick={() => onScheduleModeChange('weekday')}
                aria-pressed={!isSmartMode && scheduleType === 'weekday'}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-300 flex items-center gap-1 flex-1 justify-center ${!isSmartMode && scheduleType === 'weekday' ? 'transit-selected' : 'text-slate-300 hover:bg-slate-600'}`}
              >
                <MoonIcon className="w-3 h-3"/>
                工作日
              </button>
              <button
                onClick={() => onScheduleModeChange('holiday')}
                aria-pressed={!isSmartMode && scheduleType === 'holiday'}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-300 flex items-center gap-1 flex-1 justify-center ${!isSmartMode && scheduleType === 'holiday' ? 'transit-selected' : 'text-slate-300 hover:bg-slate-700'}`}
              >
                <SunIcon className="w-3 h-3"/>
                节假日
              </button>
            </div>
          </div>

          {/* 时间查询 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-300 block mb-2">查询时间</label>
            <div className="space-y-2">
              <input
                type="date"
                value={queryDateValue}
                aria-label="查询日期"
                onChange={event => onDateChange(event.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white transit-field font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
              <input
                type="time"
                value={queryTimeValue}
                aria-label="查询时间"
                onChange={event => onTimeChange(event.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white transit-field font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 节假日设置 */}
          <div className="mb-4">
            <button
              onClick={onShowHolidayManager}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors text-sm"
            >
              <CalendarIcon className="w-4 h-4" />
              节假日设置
            </button>
          </div>

          <div className="mb-4">
            <TransitPalette />
          </div>

          {/* 确定按钮 */}
          <button
            onClick={onConfirm}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

const App: React.FC = () => {
  const {
    scheduleType, isSmartMode, setScheduleMode, queryDateValue, queryTimeValue,
    queryFormattedDate, queryTimeFormatted, isQueryToday, isQueryNow, upcomingDepartures,
    handleTimeChange, handleDateChange, handleResetToRealTime, handleHolidayConfigChange
  } = useScheduleQuery();
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [showHolidayManager, setShowHolidayManager] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);

  return (
    <div className="transit-shell transit-mobile min-h-screen font-sans">
      <div className="max-w-lg mx-auto">
        {/* 头部 */}
        <TransitHeader>
          <button
            onClick={() => setShowControlPanel(true)}
            className="transit-settings"
            aria-label="打开控制面板"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </TransitHeader>

        {/* 日期时间窗口 */}
        <div className="transit-panel p-4 mb-4">
          <LiveClock mobile />
        </div>

        {/* 查询信息显示 */}
        {!isQueryNow && (
          <div className="transit-panel p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-amber-400 text-sm font-medium">
                  查询时间：{queryFormattedDate} {queryTimeFormatted}
                </p>
              </div>
              <button
                onClick={handleResetToRealTime}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors ml-2"
              >
                <ResetIcon className="w-3 h-3"/>
                <span>使用当前时间</span>
              </button>
            </div>
          </div>
        )}

        <main className="space-y-4">
          <div className="transit-section-heading">
            <h2 className="text-lg font-bold text-slate-300 flex flex-wrap items-center gap-2">
              <CalendarIcon className="w-5 h-5"/>
              <span className="transit-badge">{scheduleType === 'weekday' ? '工作日' : '节假日'}</span>
              {isQueryToday ? '即将发车' : '班次信息'}
            </h2>
          </div>
          {upcomingDepartures.map((route, index) => (
            <DepartureCard key={index} route={route} departures={route.upcoming} isQueryToday={isQueryToday} />
          ))}
        </main>

        <footer className="text-center mt-8">
          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            aria-expanded={showFullSchedule}
            className="transit-schedule-toggle font-semibold py-2 px-4 rounded-lg transition-all text-sm"
          >
            {showFullSchedule ? '隐藏' : '显示'}完整时刻表
          </button>
          {showFullSchedule && <FullScheduleView routes={SCHEDULE_DATA[scheduleType]} />}
          <AppCredit />
        </footer>
      </div>
      
      {/* 控制面板 */}
      <ControlPanel
        isOpen={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        queryTimeValue={queryTimeValue}
        queryDateValue={queryDateValue}
        scheduleType={scheduleType}
        isSmartMode={isSmartMode}
        onTimeChange={handleTimeChange}
        onDateChange={handleDateChange}
        onScheduleModeChange={setScheduleMode}
        onShowHolidayManager={() => setShowHolidayManager(true)}
        onConfirm={() => setShowControlPanel(false)}
      />
      
      {/* 节假日管理器 */}
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
