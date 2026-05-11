import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { BarChart3, TrendingUp, Calendar, Zap, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';


const Analytics = () => {
  const [logs, setLogs] = useState([]);
  const [fitnessLogs, setFitnessLogs] = useState([]);
  const [habits, setHabits] = useState([]);
  const [dailyNotes, setDailyNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [habitLogsRes, fitnessRes, habitsRes, notesRes] = await Promise.all([
          api.get('/api/habitlog/').catch(() => ({ data: { logs: [] } })),
          api.get('/api/fitness/').catch(() => ({ data: { logs: [] } })),
          api.get('/api/habits/get_habits').catch(() => ({ data: { habits: [] } })),
          api.get('/api/dailynote/recent').catch(() => ({ data: { notes: [] } }))
        ]);

        setLogs(habitLogsRes.data.logs || []);
        setFitnessLogs(fitnessRes.data.logs || []);
        setHabits(habitsRes.data.habits || []);
        setDailyNotes(notesRes.data.notes || []);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const completedLogs = logs.filter(log => log.status === 'completed');
  const totalHabitLogs = completedLogs.length;
  const totalFitnessDays = fitnessLogs.length;

  const past7Days = new Date();
  past7Days.setDate(past7Days.getDate() - 7);

  const recentLogs = completedLogs.filter(log => new Date(log.date) >= past7Days);
  const maxPossibleLogs = habits.length * 7;
  const consistencyScore = maxPossibleLogs > 0 ? Math.round((recentLogs.length / maxPossibleLogs) * 100) : 0;

  let weeklyPoints = 0;
  recentLogs.forEach(log => {
    const habit = habits.find(h => h._id === log.habit);
    if (habit) weeklyPoints += (habit.points || 10);
  });

  const habitCounts = {};
  completedLogs.forEach(log => {
    habitCounts[log.habit] = (habitCounts[log.habit] || 0) + 1;
  });
  const topHabitId = Object.keys(habitCounts).sort((a, b) => habitCounts[b] - habitCounts[a])[0];
  const topHabit = habits.find(h => h._id === topHabitId);
  const topHabitName = topHabit ? (topHabit.habit_title || topHabit.name) : 'No data yet';

  const avgMood = dailyNotes.length > 0
    ? (dailyNotes.reduce((sum, n) => sum + (n.mood || 3), 0) / dailyNotes.length).toFixed(1)
    : 'N/A';

  // Current Week Logic (Mon-Sun)
  const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const monday = getMonday(new Date());

  // Prepare chart data for Recharts
  const pieData = Object.keys(habitCounts).map(id => {
    const h = habits.find(hb => hb._id === id);
    return { name: h ? (h.habit_title || h.name) : 'Unknown', value: habitCounts[id] };
  });
  const COLORS = ['#101928', '#2B4B77', '#4A7CA6', '#87A8C2', '#C4D4DF'];

  const moodData = [...Array(7)].map((_, i) => {
    const d = new Date(past7Days);
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const noteForDay = dailyNotes.find(n => new Date(n.createdAt || n.date).toISOString().split('T')[0] === dateStr);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      mood: noteForDay ? (noteForDay.mood || 3) : 0
    };
  });

  const pointsData = [...Array(7)].map((_, i) => {
    const d = new Date(past7Days);
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const logsForDay = completedLogs.filter(l => new Date(l.date).toISOString().split('T')[0] === dateStr);
    let dayPoints = 0;
    logsForDay.forEach(log => {
      const habit = habits.find(h => h._id === log.habit);
      if (habit) dayPoints += (habit.points || 10);
    });
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      points: dayPoints
    };
  });

  return (
    <main className="pt-8 pb-24 px-4 lg:px-8 max-w-7xl mx-auto relative overflow-hidden bg-secondary min-h-screen text-black">

      <div className="flex justify-between items-end mb-12 border-b-2 border-primary/20 pb-4">
        <div>
          <h1 className="font-handwritten text-6xl text-primary mb-2">Insights & Analytics</h1>
          <p className="text-tertiary font-newsreader italic">Uncover patterns in your daily rituals.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-white p-6 border-2 border-primary paper-stack">
          <div className="text-primary mb-4 opacity-50">
            <Zap size={24} />
          </div>
          <p className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold mb-1">Total Logs</p>
          <h3 className="font-epilogue font-bold text-4xl text-primary">{totalHabitLogs}</h3>
        </div>

        <div className="bg-white p-6 border-2 border-primary paper-stack">
          <div className="text-primary mb-4 opacity-50">
            <span className="material-symbols-outlined">stars</span>
          </div>
          <p className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold mb-1">Weekly Points</p>
          <h3 className="font-epilogue font-bold text-4xl text-primary">{weeklyPoints}</h3>
        </div>

        <div className="bg-white p-6 border-2 border-primary paper-stack">
          <div className="text-primary mb-4 opacity-50">
            <Calendar size={24} />
          </div>
          <p className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold mb-1">Fitness Days</p>
          <h3 className="font-epilogue font-bold text-4xl text-primary">{totalFitnessDays}</h3>
        </div>

        <div className="bg-white p-6 border-2 border-primary paper-stack">
          <div className="text-primary mb-4 opacity-50">
            <TrendingUp size={24} />
          </div>
          <p className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold mb-1">Consistency (7d)</p>
          <h3 className="font-epilogue font-bold text-4xl text-primary">
            {maxPossibleLogs > 0 ? `${consistencyScore}%` : 'N/A'}
          </h3>
        </div>

        <div className="bg-white p-6 border-2 border-primary paper-stack">
          <div className="text-primary mb-4 opacity-50">
            <PieChartIcon size={24} />
          </div>
          <p className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold mb-1">Top Habit</p>
          <h3 className="font-epilogue font-bold text-xl text-primary mt-2">
            {topHabitName}
          </h3>
        </div>

        <div className="bg-white p-6 border-2 border-primary paper-stack">
          <div className="text-primary mb-4 text-2xl">
            🙂
          </div>
          <p className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold mb-1">Avg Mood (7d)</p>
          <h3 className="font-epilogue font-bold text-4xl text-primary">
            {avgMood} <span className="text-xl text-tertiary/50">{avgMood !== 'N/A' && '/ 5'}</span>
          </h3>
        </div>
      </div>

      {/* New Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div className="bg-white p-6 border-2 border-primary paper-stack min-h-[300px]">
          <h3 className="font-epilogue font-bold text-lg text-primary mb-6 border-b border-primary/10 pb-2">Points Earned (Last 7 Days)</h3>
          <div className="h-[250px] animate-none transition-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pointsData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontFamily: 'Newsreader', fontSize: 12, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontFamily: 'Newsreader', fontSize: 12, fill: '#666' }} />
                <Tooltip contentStyle={{ borderRadius: 0, border: '2px solid #101928', fontFamily: 'Epilogue' }} />
                <Line type="monotone" dataKey="points" stroke="#101928" strokeWidth={3} dot={{ r: 4, fill: '#101928' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 border-2 border-primary paper-stack min-h-[300px]">
          <h3 className="font-epilogue font-bold text-lg text-primary mb-6 border-b border-primary/10 pb-2">Habit Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 0, border: '2px solid #101928', fontFamily: 'Epilogue' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-secondary p-8 border border-tertiary/20 rounded-none shadow-[4px_4px_0px_rgba(112,112,112,0.1)] relative paper-texture min-h-[400px]">
          <h2 className="font-epilogue font-bold text-2xl text-primary border-b-2 border-dashed border-tertiary/30 pb-2 mb-8">
            Weekly Habit Completion
          </h2>
          <div className="flex items-end gap-4 h-64 w-full py-4 px-2 ruled-line border-l-2 border-b-2 border-primary/20">
            {[...Array(7)].map((_, i) => {
             const d = new Date();
d.setDate(d.getDate() - (6 - i));
              const dateStr = d.toISOString().split('T')[0];
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

              const logsForDay = completedLogs.filter(l => new Date(l.date).toISOString().split('T')[0] === dateStr);
              const countForDay = logsForDay.length;
              const val = habits.length > 0 ? (countForDay / habits.length) * 100 : 0;

              let dayPoints = 0;
              logsForDay.forEach(log => {
                const habit = habits.find(h => h._id === log.habit);
                if (habit) dayPoints += (habit.points || 10);
              });

              return (
                <div key={i} className="flex-1 bg-white/50 border border-primary/10 rounded-t-none relative group h-full flex items-end">
                  <div
                    className="w-full bg-primary transition-all duration-500 group-hover:bg-primary ink-bleed border border-primary relative"
                    style={{ height: `${val}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white font-newsreader text-xs py-1 px-2 whitespace-nowrap z-20 pointer-events-none">
                      {dayPoints} Pts
                    </div>
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-newsreader uppercase tracking-widest text-tertiary">{dayName}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-secondary p-8 border border-tertiary/20 rounded-none shadow-[4px_4px_0px_rgba(112,112,112,0.1)] relative paper-texture min-h-[400px]">
          <h2 className="font-epilogue font-bold text-2xl text-primary border-b-2 border-dashed border-tertiary/30 pb-2 mb-8 flex items-center justify-between">
            <span>Daily Logs</span>
            <span className="material-symbols-outlined text-tertiary/50">fitness_center</span>
          </h2>

          <ScrollArea className="h-64 pr-4">
            {fitnessLogs.length > 0 ? (
              <ul className="ruled-line space-y-4 animate-in fade-in duration-500">
                {fitnessLogs.map(log => {
                  const d = new Date(log.date);
                  const dateFormatted = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getFullYear()).slice(-2)}`;
                  const dailyNoteObj = dailyNotes.find(n => n.date === log.date);
                  const noteText = dailyNoteObj?.note || 'No daily note recorded.';

                  return (
                    <li key={log._id} className="pb-4 border-b border-primary/10">
                      <div className="flex justify-between font-bold text-primary font-epilogue mb-3">
                        <span>{dateFormatted}</span>
                        <span className="text-tertiary font-newsreader font-normal italic text-xs">
                          In: {log.caloriesEstimate} | Burn: {log.caloriesBurned || 'N/A'} | Pro: {log.proteinEstimate}
                        </span>
                      </div>

                      <p className="text-tertiary font-newsreader text-sm line-clamp-2">
                        {noteText}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center h-full flex flex-col justify-center items-center">
                <BarChart3 size={48} className="mx-auto mb-4 text-tertiary/30" />
                <p className="font-newsreader italic text-tertiary">
                  Accumulate more fitness data to see trends.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </main>
  );
};

export default Analytics;
