
import React, { useState, useEffect, useMemo } from 'react';
import { SymptomLogEntry, UserProfile } from '../types';
import { TRANSLATIONS } from '../translations';

interface SymptomTrackerModalProps {
  user: UserProfile;
  onClose: () => void;
  language?: string;
}

export const SymptomTrackerModal: React.FC<SymptomTrackerModalProps> = ({ user, onClose, language = 'en' }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const trackerT = t.tracker || TRANSLATIONS['en'].tracker;

  const storageKey = `mediGuide_symptomLogs_${user.emailOrPhone}`;
  
  const [logs, setLogs] = useState<SymptomLogEntry[]>([]);
  const [view, setView] = useState<'add' | 'list'>('list');

  // Form State
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState<number>(5);
  const [duration, setDuration] = useState('');
  const [frequency, setFrequency] = useState('Intermittent');
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState<string>(''); // For datetime-local input

  // Filter & Chart State
  const [filterSymptom, setFilterSymptom] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('7');
  const [chartMode, setChartMode] = useState<'severity' | 'frequency'>('severity');

  useEffect(() => {
    // Initialize date to current local time ISO string for the input
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setLogDate(now.toISOString().slice(0, 16));

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLogs(parsed.sort((a: SymptomLogEntry, b: SymptomLogEntry) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error("Failed to load logs", e);
      }
    } else {
        setView('add');
    }
  }, [storageKey]);

  // Derive unique symptoms for suggestions and filters
  const uniqueSymptoms = useMemo(() => {
    const symptoms = new Set(logs.map(l => l.symptom));
    return Array.from(symptoms).sort();
  }, [logs]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptom.trim()) return;

    const timestamp = logDate ? new Date(logDate).getTime() : Date.now();

    const newLog: SymptomLogEntry = {
      id: Date.now().toString(),
      timestamp: timestamp,
      symptom: symptom.trim(),
      severity,
      duration: duration.trim(),
      frequency: frequency,
      notes: notes.trim()
    };

    const updatedLogs = [newLog, ...logs].sort((a, b) => b.timestamp - a.timestamp);
    setLogs(updatedLogs);
    localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
    
    // Reset form but keep date current
    setSymptom('');
    setSeverity(5);
    setDuration('');
    setFrequency('Intermittent');
    setNotes('');
    setView('list');
    setFilterSymptom('All'); // Reset filter to show the new log
  };

  const handleDelete = (id: string) => {
    if(!window.confirm("Delete this log?")) return;
    const updatedLogs = logs.filter(l => l.id !== id);
    setLogs(updatedLogs);
    localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
  };

  // --- Filtered Data ---
  const filteredLogs = useMemo(() => {
    let result = logs;
    // 1. Filter by Symptom Name
    if (filterSymptom !== 'All') {
        result = result.filter(l => l.symptom === filterSymptom);
    }
    
    // 2. Filter by Time Range
    const now = Date.now();
    let cutoff = 0;
    if (timeRange === '7') {
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
    } else if (timeRange === '30') {
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
    }
    
    if (cutoff > 0) {
        result = result.filter(l => l.timestamp >= cutoff);
    }

    return result;
  }, [logs, filterSymptom, timeRange]);

  // --- Stats for Cards ---
  const stats = useMemo(() => {
    if (filteredLogs.length === 0) return null;
    const avgSev = filteredLogs.reduce((acc, curr) => acc + curr.severity, 0) / filteredLogs.length;
    const maxSev = Math.max(...filteredLogs.map(l => l.severity));
    return {
        avg: avgSev.toFixed(1),
        max: maxSev,
        count: filteredLogs.length
    };
  }, [filteredLogs]);

  // --- Data for Overview Chart (Bar Chart) ---
  const overviewData = useMemo(() => {
      const statsMap: Record<string, { totalSev: number, count: number }> = {};
      
      // Aggregate data per symptom within time range
      filteredLogs.forEach(l => {
          if (!statsMap[l.symptom]) {
              statsMap[l.symptom] = { totalSev: 0, count: 0 };
          }
          statsMap[l.symptom].totalSev += l.severity;
          statsMap[l.symptom].count += 1;
      });

      const data = Object.entries(statsMap)
         .map(([name, d]) => ({
             name,
             avg: d.totalSev / d.count,
             count: d.count
         }));

      // Sort based on selected mode
      if (chartMode === 'severity') {
          return data.sort((a, b) => b.avg - a.avg).slice(0, 5);
      } else {
          return data.sort((a, b) => b.count - a.count).slice(0, 5);
      }
  }, [filteredLogs, chartMode]);

  const maxFrequency = useMemo(() => {
      if (overviewData.length === 0) return 0;
      return Math.max(...overviewData.map(d => d.count));
  }, [overviewData]);

  // --- Data for Trend Chart (Line Chart) ---
  const lineChartData = useMemo(() => {
    // Reverse to chronological order (Oldest -> Newest) for the graph
    return [...filteredLogs].reverse();
  }, [filteredLogs]);


  const renderChart = () => {
    const TimeRangeSelector = () => (
        <div className="flex bg-gray-100 p-1 rounded-lg text-xs">
            {(['7', '30', 'all'] as const).map((r) => (
                <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded-md transition-all ${timeRange === r ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {r === '7' ? trackerT.time_range_7 : r === '30' ? trackerT.time_range_30 : trackerT.time_range_all}
                </button>
            ))}
        </div>
    );

    // MODE 1: OVERVIEW (Bar Chart for All Symptoms)
    if (filterSymptom === 'All') {
        return (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                            {chartMode === 'severity' ? 'Top by Severity' : 'Most Frequent'}
                        </h4>
                        <p className="text-xs text-gray-400">Comparing top 5 symptoms</p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                        {/* Metric Toggle */}
                        <div className="flex bg-indigo-50 p-1 rounded-lg text-xs">
                             <button 
                                onClick={() => setChartMode('severity')}
                                className={`px-3 py-1 rounded-md transition-all ${chartMode === 'severity' ? 'bg-white shadow text-indigo-700 font-bold' : 'text-indigo-400 hover:text-indigo-600'}`}
                             >
                                Severity
                             </button>
                             <button 
                                onClick={() => setChartMode('frequency')}
                                className={`px-3 py-1 rounded-md transition-all ${chartMode === 'frequency' ? 'bg-white shadow text-indigo-700 font-bold' : 'text-indigo-400 hover:text-indigo-600'}`}
                             >
                                Frequency
                             </button>
                        </div>
                        <TimeRangeSelector />
                    </div>
                </div>

                {overviewData.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs py-8 border-2 border-dashed border-gray-100 rounded-xl">
                        No logs found for this time range.
                    </div>
                ) : (
                    <div className="flex items-end space-x-4 h-40 px-2 pb-1 relative">
                        {/* Background Grid Lines for context */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0 opacity-10">
                             <div className="border-t border-gray-900 w-full h-0"></div>
                             <div className="border-t border-gray-900 w-full h-0"></div>
                             <div className="border-t border-gray-900 w-full h-0"></div>
                             <div className="border-b border-gray-900 w-full h-0"></div>
                        </div>

                        {overviewData.map((item) => {
                            let heightPercent = 0;
                            let barColor = '';
                            let valueDisplay = '';

                            if (chartMode === 'severity') {
                                // Severity Mode: 0-10 scale
                                heightPercent = (item.avg / 10) * 100;
                                valueDisplay = item.avg.toFixed(1);
                                // Dynamic Severity Color
                                if (item.avg >= 8) barColor = 'bg-rose-500';
                                else if (item.avg >= 5) barColor = 'bg-orange-400';
                                else barColor = 'bg-emerald-400';
                            } else {
                                // Frequency Mode: Relative to max count
                                heightPercent = (item.count / maxFrequency) * 100;
                                valueDisplay = item.count.toString();
                                barColor = 'bg-indigo-500';
                            }

                            // Ensure min-height for visibility
                            heightPercent = Math.max(heightPercent, 5);

                            return (
                                <div key={item.name} className="flex-1 flex flex-col items-center justify-end h-full z-10 group relative">
                                    {/* Value Tooltip */}
                                    <div className="mb-2 text-xs font-bold text-gray-700 bg-white/80 px-2 py-0.5 rounded shadow-sm opacity-100 transition-opacity">
                                        {valueDisplay}
                                        {chartMode === 'severity' && <span className="text-[9px] text-gray-400 font-normal ml-0.5">/10</span>}
                                    </div>
                                    
                                    {/* The Bar */}
                                    <div 
                                        className={`w-full max-w-[40px] rounded-t-lg shadow-sm transition-all duration-500 relative overflow-hidden group-hover:opacity-90 ${barColor}`}
                                        style={{ height: `${heightPercent}%` }}
                                    >
                                       {/* Glossy effect overlay */}
                                       <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                                    </div>

                                    {/* Label */}
                                    <div className="mt-2 text-[10px] text-gray-600 font-semibold text-center leading-tight w-full truncate px-1" title={item.name}>
                                        {item.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // MODE 2: TREND (Line Chart for Specific Symptom)
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
             <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{trackerT.trend}</h4>
                <div className="flex items-center mt-1">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                        {filterSymptom}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-2">Severity over time</span>
                </div>
             </div>
             <TimeRangeSelector />
        </div>
        
        {lineChartData.length < 2 ? (
             <div className="text-center text-gray-400 text-xs py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                Not enough data to show a trend line.<br/>Add more logs for <strong>{filterSymptom}</strong>.
            </div>
        ) : (
            <div className="relative w-full aspect-[2.5/1]">
               {(() => {
                   const width = 100; 
                   const height = 50;
                   const padding = 2; // Keep padding minimal inside SVG
                   const maxVal = 10;
                   const xStep = (width - padding * 2) / (lineChartData.length - 1);
                   
                   const points = lineChartData.map((d, i) => {
                      const x = padding + i * xStep;
                      // Invert Y axis because SVG 0 is top
                      const y = height - ((d.severity / maxVal) * height);
                      return `${x},${y}`;
                   }).join(' ');

                   return (
                       <div className="relative w-full h-full">
                           {/* Custom Grid Labels */}
                           <div className="absolute left-0 top-0 bottom-0 w-full flex flex-col justify-between text-[9px] text-gray-300 font-bold pointer-events-none select-none z-0">
                               <div className="border-t border-dashed border-red-100 w-full pt-1 pl-1">Severe (10)</div>
                               <div className="border-t border-dashed border-orange-100 w-full pt-1 pl-1">Moderate (5)</div>
                               <div className="border-b border-dashed border-emerald-100 w-full pb-1 pl-1">Mild (0)</div>
                           </div>

                           <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible relative z-10">
                              <defs>
                                <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              
                              {/* Area Fill */}
                              <polygon 
                                 points={`${padding},${height} ${points} ${width-padding},${height}`}
                                 fill="url(#trendGradient)"
                              />
                              
                              {/* The Line */}
                              <polyline 
                                fill="none" 
                                stroke="#f43f5e" 
                                strokeWidth="1.5" 
                                points={points} 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                              
                              {/* Data Points */}
                              {lineChartData.map((d, i) => {
                                 const x = padding + i * xStep;
                                 const y = height - ((d.severity / maxVal) * height);
                                 return (
                                    <g key={d.id} className="group">
                                        {/* Invisible larger hit area for easier hovering */}
                                        <circle cx={x} cy={y} r="4" className="fill-transparent stroke-none" />
                                        
                                        {/* Visible dot */}
                                        <circle cx={x} cy={y} r="1.5" className="fill-white stroke-rose-500 stroke-[1.5px] group-hover:r-2 transition-all cursor-pointer" />
                                        
                                        {/* Tooltip on hover */}
                                        <foreignObject x={x - 10} y={y - 12} width="20" height="10" className="overflow-visible opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="bg-gray-800 text-white text-[5px] rounded px-1 py-0.5 text-center shadow-md whitespace-nowrap">
                                                {d.severity}
                                            </div>
                                        </foreignObject>
                                    </g>
                                 );
                              })}
                           </svg>
                       </div>
                   );
               })()}
               {/* X-Axis Dates */}
               <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                 <span>{new Date(lineChartData[0].timestamp).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                 <span>{new Date(lineChartData[lineChartData.length-1].timestamp).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
               </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
                <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{trackerT.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
            
            {/* Toggle Views */}
            <div className="flex bg-gray-200 rounded-lg p-1 mb-6 shrink-0">
                <button 
                    onClick={() => setView('list')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {trackerT.history}
                </button>
                <button 
                    onClick={() => setView('add')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'add' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {trackerT.add_log}
                </button>
            </div>

            {view === 'list' ? (
                <>
                    {/* Filter and Stats */}
                    {logs.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-medium text-gray-600">Filter by:</label>
                                <select 
                                    value={filterSymptom}
                                    onChange={(e) => setFilterSymptom(e.target.value)}
                                    className="bg-white border border-gray-300 text-sm rounded-lg p-1.5 focus:ring-rose-500 focus:border-rose-500 shadow-sm outline-none"
                                >
                                    <option value="All">All Symptoms</option>
                                    {uniqueSymptoms.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {stats && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-rose-50 p-3 rounded-lg text-center border border-rose-100">
                                        <div className="text-[10px] text-rose-500 uppercase font-bold tracking-wide">Avg Severity</div>
                                        <div className="text-lg font-bold text-rose-700">{stats.avg}</div>
                                    </div>
                                    <div className="bg-rose-50 p-3 rounded-lg text-center border border-rose-100">
                                        <div className="text-[10px] text-rose-500 uppercase font-bold tracking-wide">Max Severity</div>
                                        <div className="text-lg font-bold text-rose-700">{stats.max}</div>
                                    </div>
                                    <div className="bg-rose-50 p-3 rounded-lg text-center border border-rose-100">
                                        <div className="text-[10px] text-rose-500 uppercase font-bold tracking-wide">Entries</div>
                                        <div className="text-lg font-bold text-rose-700">{stats.count}</div>
                                    </div>
                                </div>
                            )}

                            {renderChart()}
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        {filteredLogs.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <p>{logs.length === 0 ? trackerT.no_logs : "No logs match this filter/time range."}</p>
                            </div>
                        ) : (
                            filteredLogs.map(log => (
                                <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start group hover:border-rose-200 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            <span className="font-bold text-gray-900 mr-2">{log.symptom}</span>
                                            <div className="flex space-x-0.5" title={`Severity: ${log.severity}/10`}>
                                                <div className={`w-1.5 h-3 rounded-sm ${log.severity >= 1 ? 'bg-rose-300' : 'bg-gray-100'}`}></div>
                                                <div className={`w-1.5 h-3 rounded-sm ${log.severity >= 3 ? 'bg-rose-300' : 'bg-gray-100'}`}></div>
                                                <div className={`w-1.5 h-3 rounded-sm ${log.severity >= 5 ? 'bg-rose-400' : 'bg-gray-100'}`}></div>
                                                <div className={`w-1.5 h-3 rounded-sm ${log.severity >= 7 ? 'bg-rose-500' : 'bg-gray-100'}`}></div>
                                                <div className={`w-1.5 h-3 rounded-sm ${log.severity >= 9 ? 'bg-rose-600' : 'bg-gray-100'}`}></div>
                                            </div>
                                            <span className="ml-2 text-xs text-gray-400 font-medium">({log.severity}/10)</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {new Date(log.timestamp).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                            })}
                                        </div>
                                        
                                        {(log.duration || log.frequency) && (
                                            <div className="flex gap-2 mb-2 text-xs">
                                                {log.duration && (
                                                    <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">
                                                        ⏱ {log.duration}
                                                    </span>
                                                )}
                                                {log.frequency && (
                                                    <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">
                                                        🔁 {log.frequency}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {log.notes && (
                                            <p className="text-sm text-gray-600 italic bg-gray-50/50 p-2 rounded mt-1 border border-gray-100/50">
                                                "{log.notes}"
                                            </p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(log.id)}
                                        className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title={trackerT.delete}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <form onSubmit={handleSave} className="space-y-5 animate-in slide-in-from-right duration-200">
                    
                    {/* Quick Add Suggestion Chips */}
                    {uniqueSymptoms.length > 0 && (
                         <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quick Add</label>
                            <div className="flex flex-wrap gap-2">
                                {uniqueSymptoms.slice(0, 6).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSymptom(s)}
                                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${symptom === s ? 'bg-rose-100 border-rose-300 text-rose-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                         </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{trackerT.symptom_label}</label>
                        <input 
                            type="text" 
                            required
                            value={symptom}
                            onChange={(e) => setSymptom(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                            placeholder="e.g. Headache, Nausea"
                        />
                    </div>
                    
                    {/* Date Time Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                        <input 
                            type="datetime-local" 
                            required
                            value={logDate}
                            onChange={(e) => setLogDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-gray-600"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{trackerT.duration_label}</label>
                            <input 
                                type="text"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                                placeholder="e.g. 30 mins"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{trackerT.frequency_label}</label>
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white"
                            >
                                <option>One-time</option>
                                <option>Intermittent</option>
                                <option>Constant</option>
                                <option>Hourly</option>
                                <option>Daily</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">{trackerT.severity_label}</label>
                            <div className="flex items-center">
                                <span className={`text-lg font-bold mr-2 ${severity > 7 ? 'text-red-600' : 'text-rose-600'}`}>{severity}</span>
                                <span className="text-xs text-gray-400">/ 10</span>
                            </div>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={severity}
                            onChange={(e) => setSeverity(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                            <span>Mild</span>
                            <span>Moderate</span>
                            <span>Severe</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{trackerT.notes_label}</label>
                        <textarea 
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
                            placeholder="e.g. Took 200mg Ibuprofen, rested for an hour"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                    >
                        {trackerT.save}
                    </button>
                </form>
            )}

        </div>
      </div>
    </div>
  );
};
