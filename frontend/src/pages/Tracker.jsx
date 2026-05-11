import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../lib/axios';
import GoalSection from '../components/GoalSection';
import FitnessTab from '../components/FitnessTab';
import { useAuth } from '../context/AuthContext';
import { Activity, Utensils, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Tracker = () => {

  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fitnessProfile, setFitnessProfile] = useState(null);

  const [weather, setWeather] = useState("Checking skies...");
  const [quote, setQuote] = useState("...");

  const [dailyNote, setDailyNote] = useState("");
  const [mood, setMood] = useState(3);
  const [saveStatus, setSaveStatus] = useState("");
  const typingTimeoutRef = useRef(null);

  const [habitDialog, setHabitDialog] = useState(false);
  const [newHabit, setNewHabit] = useState({ habit_title: '', target_value: '', frequency: 'Daily', points: 10, customDate: '', goalId: '' });

  // ---------------------------------------------

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchTodayLog = async () => {
      try {
        const res = await api.get('/api/fitness/');
        if (res.data.logs && res.data.logs.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todayLog = res.data.logs.find(log => {
            // ensure we match the date string format
            const logDate = log.date ? (log.date.includes('T') ? log.date.split('T')[0] : log.date) : null;
            return logDate === today;
          });
          if (todayLog && todayLog.summary) {
            setSummary({
              caloriesEstimate: todayLog.caloriesEstimate,
              caloriesBurned: todayLog.caloriesBurned,
              proteinEstimate: todayLog.proteinEstimate,
              summary: todayLog.summary
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch fitness logs", error);
      }
    };
    fetchTodayLog();
  }, []);

  //  ----------------------------------------------------

  useEffect(() => {
    fetchData();
    fetchQuote();
    fetchWeather();
    fetchDailyNote();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, habitsRes, logsRes, profileRes] = await Promise.all([
        api.get('/api/goals/get_goals').catch(() => ({ data: { goals: [] } })),
        api.get('/api/habits/get_habits').catch(() => ({ data: { habits: [] } })),
        api.get('/api/habitlog/').catch(() => ({ data: { logs: [] } })),
        api.get('/api/fitness/profile').catch(() => ({ data: { profile: null } }))
      ]);

      const logs = logsRes.data.logs || [];
      const today = new Date().toISOString().split('T')[0];

      const habitsWithStatus = (habitsRes.data.habits || []).map(h => {
        const todaysLog = logs.find(l => l.habit === h._id && l.date === today);
        return { ...h, completedToday: todaysLog ? todaysLog.status === 'completed' : false };
      });

      setGoals(goalsRes.data.goals || []);
      setHabits(habitsWithStatus);
      setFitnessProfile(profileRes.data.profile || null);
    } catch (error) {
      console.error("Error fetching tracker data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quotes = [
    "Discipline is choosing between what you want now and what you want most.",
    "Small disciplines repeated with consistency every day lead to great achievements.",
    "Motivation gets you going, but discipline keeps you growing.",
    "The only bad workout is the one that didn't happen.",
    "Don't stop when you're tired. Stop when you're done.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "You don't have to be extreme, just consistent.",
    "What you do today can improve all your tomorrows.",
    "Doubt kills more dreams than failure ever will.",
    "Growth is uncomfortable; staying the same is worse."
  ];

  const fetchQuote = () => {
    const seed = new Date().getDate();
    setQuote(quotes[seed % quotes.length]);
  };

  const fetchWeather = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`);
          const data = await res.json();
          const temp = Math.round(data.current_weather.temperature);
          setWeather(`${temp}°F`);
        } catch (error) {
          setWeather("Weather unavailable");
        }
      }, () => {
        setWeather("Skies unknown");
      });
    } else {
      setWeather("Skies unknown");
    }
  };

  const fetchDailyNote = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/api/dailynote?date=${today}`);
      if (res.data && res.data.dailyNote) {
        setDailyNote(res.data.dailyNote.note || "");
        setMood(res.data.dailyNote.mood || 3);
      }
    } catch (err) {
      console.error("Error fetching daily note", err);
    }
  };

  const saveDailyNote = async (newNote, newMood) => {
    try {
      setSaveStatus("Saving...");
      const today = new Date().toISOString().split('T')[0];
      await api.post('/api/dailynote', { date: today, note: newNote, mood: newMood });
      setSaveStatus("Saved");
      setTimeout(() => {
        setSaveStatus((prev) => prev === "Saved" ? "" : prev);
      }, 3000);
    } catch (err) {
      console.error("Error saving daily note", err);
      setSaveStatus("Error saving");
    }
  };

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setDailyNote(val);
    setSaveStatus("Saving...");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      saveDailyNote(val, mood);
    }, 1000);
  };

  const handleLogHabit = async (habitId) => {
    try {
      const habitToLog = habits.find(h => h._id === habitId);
      const newStatus = habitToLog.completedToday ? 'missed' : 'completed';
      const today = new Date().toISOString().split('T')[0];

      setHabits(habits.map(h =>
        h._id === habitId ? { ...h, completedToday: newStatus === 'completed' } : h
      ));

      await api.post('/api/habitlog/log', {
        habitId,
        status: newStatus,
        date: today
      });
    } catch (error) {
      console.error("Error logging habit:", error);
      fetchData();
    }
  };

  const handleSaveHabit = async () => {
    try {
      if (newHabit.frequency === 'Custom Date' && !newHabit.customDate) {
        alert("Please select a date for your custom habit.");
        return;
      }
      await api.post('/api/habits/create_habit', newHabit);
      setHabitDialog(false);
      setNewHabit({ habit_title: '', target_value: '', frequency: 'Daily', points: 10, customDate: '', goalId: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to create habit.");
    }
  };

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completedToday).length;
  const progressPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const totalPoints = habits.filter(h => h.completedToday).reduce((sum, h) => sum + (h.points || 10), 0);

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  const createdDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const diffTime = Math.abs(new Date() - createdDate);
  const pageNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <main className="pt-2  px-4 lg:px-12 max-w-7xl mx-auto relative overflow-hidden bg-secondary pb-8 text-black ">
      <div className="absolute top-40 -right-20 w-64 h-64 border-[12px] border-tertiary/10 rounded-full coffee-stain"></div>
      <div className="absolute bottom-20 -left-10 w-40 h-40 border-[8px] border-tertiary/10 rounded-full coffee-stain"></div>

      <section className="mb-12 relative z-10 flex flex md:flex-row md:items-center justify-between gap-6 ">
        <div className='animate-in fade-in duration-500 '>
          <h1 className="font-handwritten text-5xl md:text-7xl text-primary mb-2 capitalize"><span className='text-3xl font-epilogue tracking-tighter'>{greeting},</span><br /> {user?.username || 'User'}</h1>
          <div className="flex items-center gap-3 font-epilogue text-tertiary tracking-wider">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span className="uppercase text-xs font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="h-[1px] w-12 bg-tertiary/30"></span>
            {/* <span className="italic text-xs">{weather}</span> */}

          </div>
        </div>
        <div className="bg-primary text-white p-4 rounded-lg relative overflow-hidden ink-bleed max-w-[50%]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-6xl">format_quote</span>
          </div>
          <p className="font-newsreader text-xs opacity-60 uppercase mb-4 tracking-widest">Quote of the day</p>
          <p className="font-handwritten text-2xl md:text-3xl leading-snug">"{quote}"</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-secondary p-3  px-10 border border-tertiary/20 rounded-lg shadow-[4px_4px_0px_rgba(112,112,112,0.1)] relative paper-texture">

            <div className=" relative z-10 bg-ambwer-300">

              <Tabs defaultValue="habits" className="w-full ">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-tertiary/10 rounded-none border border-tertiary/20 p-1 ">
                  <TabsTrigger value="habits" className=" font-newsreader uppercase text-sm tracking-widest font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer rounded-none">Habit Tracker</TabsTrigger>
                  <TabsTrigger value="fitness" className=" font-newsreader uppercase text-sm tracking-widest font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer rounded-none">Fitness Tracker</TabsTrigger>

                </TabsList>
                <div className="">
                  <h3 className=" font-epilogue font-bold text-2xl text-primary border-b-2 border-dashed border-tertiary/30 pb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">edit_square</span>
                    The Daily Log
                  </h3>
                  <span className=" absolute right-0 top-20 font-handwritten text-2xl text-tertiary/70">Page {pageNumber}</span>
                </div>

                <TabsContent value="habits" className="animate-in fade-in duration-500 ">
                  {loading ? (
                    <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
                  ) : (
                    <>
                      <div className="flex justify-between relative  animate-none transition-none">
                        <Dialog open={habitDialog} onOpenChange={setHabitDialog} >
                          <DialogTrigger asChild className=''>
                            <button className="hidden md:flex absolute right-0 -top-32 p-2  items-center justify-center gap-3 cursor-pointer border-2 border-primary bg-transparent text-primary font-epilogue font-bold uppercase transition-none animate-none hover:bg-primary hover:text-white active:scale-95 ink-bleed">
                              <span className="material-symbols-outlined">add_circle</span>
                              New Entry
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-secondary paper-texture rounded-none border-2 border-primary ink-bleed animate-none transition-none">
                            <DialogHeader>
                              <DialogTitle className="font-epilogue font-bold text-primary">Create New Habit</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <Input className="border-primary bg-white rounded-none px-2" placeholder="Habit Title" value={newHabit.habit_title} onChange={e => setNewHabit({ ...newHabit, habit_title: e.target.value })} />
                              <Input className="border-primary bg-white rounded-none px-2" placeholder="Target (e.g., 20 mins)" value={newHabit.target_value} onChange={e => setNewHabit({ ...newHabit, target_value: e.target.value })} />
                              <Input className="border-primary bg-white rounded-none px-2" type="number" placeholder="Points" value={newHabit.points} onChange={e => setNewHabit({ ...newHabit, points: e.target.value })} />
                              
                              <Select value={newHabit.frequency} onValueChange={v => setNewHabit({ ...newHabit, frequency: v })}>
                                <SelectTrigger className="border-primary bg-white rounded-none px-2">
                                  <SelectValue placeholder="Frequency" />
                                </SelectTrigger>
                                <SelectContent className="bg-secondary rounded-none">
                                  <SelectItem value="Daily">Daily</SelectItem>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                  <SelectItem value="Monthly">Monthly</SelectItem>
                                  <SelectItem value="Custom Date">Custom Date</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {newHabit.frequency === 'Custom Date' && (
                                <Input 
                                  type="date" 
                                  className="border-primary bg-white rounded-none px-2" 
                                  value={newHabit.customDate} 
                                  onChange={e => setNewHabit({ ...newHabit, customDate: e.target.value })} 
                                />
                              )}

                              <Select value={newHabit.goalId || 'none'} onValueChange={v => setNewHabit({ ...newHabit, goalId: v === 'none' ? null : v })}>
                                <SelectTrigger className="border-primary bg-white rounded-none px-2">
                                  <SelectValue placeholder="Select Goal" />
                                </SelectTrigger>
                                <SelectContent className="bg-secondary rounded-none">
                                  <SelectItem value="none">No Goal (Independent)</SelectItem>
                                  {goals.map(g => (
                                    <SelectItem key={g._id} value={g._id}>{g.goal_title || g.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button onClick={handleSaveHabit} className="w-full bg-primary text-white rounded-none font-epilogue uppercase tracking-widest">Save Entry</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                       <div className="">
                         {habits.filter(h => !h.goalId && (!h.frequency || h.frequency === 'Daily')).length > 0 && (
                          <GoalSection key="independent_daily" goal={{ _id: 'independent_daily', title: 'Daily Habits' }} habits={habits.filter(h => !h.goalId && (!h.frequency || h.frequency === 'Daily')).map(h => ({ ...h, goalId: 'independent_daily' }))} onLogHabit={handleLogHabit} />
                        )}
                        {habits.filter(h => !h.goalId && h.frequency === 'Weekly').length > 0 && (
                          <GoalSection key="independent_weekly" goal={{ _id: 'independent_weekly', title: 'Weekly Habits' }} habits={habits.filter(h => !h.goalId && h.frequency === 'Weekly').map(h => ({ ...h, goalId: 'independent_weekly' }))} onLogHabit={handleLogHabit} />
                        )}
                        {habits.filter(h => !h.goalId && h.frequency === 'Monthly').length > 0 && (
                          <GoalSection key="independent_monthly" goal={{ _id: 'independent_monthly', title: 'Monthly Habits' }} habits={habits.filter(h => !h.goalId && h.frequency === 'Monthly').map(h => ({ ...h, goalId: 'independent_monthly' }))} onLogHabit={handleLogHabit} />
                        )} 
                        {Array.from(new Set(habits.filter(h => !h.goalId && h.frequency === 'Custom Date').map(h => h.customDate || 'Unscheduled'))).map(date => (
                          <GoalSection 
                            key={`independent_custom_${date}`} 
                            goal={{ _id: `independent_custom_${date}`, title: date !== 'Unscheduled' && date.includes('-') ? `${date.split('-')[2]}-${date.split('-')[1]}` : date }} 
                            habits={habits.filter(h => !h.goalId && h.frequency === 'Custom Date' && (h.customDate || 'Unscheduled') === date).map(h => ({ ...h, goalId: `independent_custom_${date}` }))} 
                            onLogHabit={handleLogHabit} 
                          />
                        ))}
                       </div>
                        <div className="">
                          {goals.map(goal => (
                          <GoalSection key={goal._id} goal={goal} title='Goals' habits={habits} onLogHabit={handleLogHabit} />
                        ))}
                        </div>
                      </div>
                      {goals.length === 0 && habits.filter(h => !h.goalId).length === 0 && (

                        <div className="text-center p-12 bg-white/50 rounded-lg border border-dashed border-tertiary/30">
                          <h3 className="font-newsreader font-bold text-xl mb-2 text-primary">No goals or habits yet</h3>
                          <p className="text-tertiary font-newsreader italic mb-6">Create your first habit to start tracking.</p>
                        </div>

                      )}
                      <div className="bg-secondary p-8 border border-tertiary/20 rounded-lg shadow-[4px_4px_0px_rgba(112,112,112,0.1)] relative paper-texture mt-8">
                        <h3 className="font-epilogue font-bold text-2xl text-primary border-b-2 border-dashed border-tertiary/30 pb-2 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined">book</span> Daily Glimpse
                            {saveStatus && <span className="text-xs font-newsreader italic text-tertiary ml-2 opacity-70 transition-opacity duration-300">{saveStatus}</span>}
                          </span>
                          <div className="flex gap-4 items-center">
                            <span className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold">Mood:</span>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(m => {
                                const emojis = ['😡', '🙁', '😐', '🙂', '🤩'];
                                return (
                                  <button key={m} onClick={() => { setMood(m); saveDailyNote(dailyNote, m); }} className={`text-2xl hover:scale-110 transition-transform ${mood === m ? 'scale-125 border-b-2 border-primary pb-1' : 'opacity-50 grayscale hover:grayscale-0'}`}>
                                    {emojis[m - 1]}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </h3>
                        <textarea
                          value={dailyNote}
                          onChange={handleNoteChange}
                          onBlur={() => saveDailyNote(dailyNote, mood)}
                          className="w-full bg-transparent border-none outline-none resize-none font-handwritten text-3xl text-primary placeholder-primary/30 h-32 leading-relaxed ruled-line"
                          placeholder="A brief note about today..."
                        ></textarea>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="fitness" className="animate-in fade-in duration-500">
                  <FitnessTab summary={summary} onSummaryUpdate={setSummary} fitnessProfile={fitnessProfile} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 rotate-12 opacity-40 z-10">
              <svg className="w-full h-full text-tertiary" viewBox="0 0 100 100">
                <path d="M20,50 Q40,10 60,50 T100,50" fill="none" stroke="currentColor" strokeWidth="2"></path>
                <circle cx="20" cy="50" fill="currentColor" r="3"></circle>
                <circle cx="60" cy="50" fill="currentColor" r="3"></circle>
                <path d="M30,30 L40,20 M70,30 L80,20" stroke="currentColor" strokeWidth="2"></path>
              </svg>
            </div>
          </div>


        </div>

        <div className="lg:col-span-4 space-y-6 relative z-10">



          <div className="bg-secondary border border-tertiary/20 p-6 rounded-lg shadow-[4px_4px_0px_rgba(112,112,112,0.1)] paper-texture flex flex-col gap-6">
            <h3 className="font-newsreader uppercase tracking-widest font-bold text-xs text-tertiary border-b border-primary/10 pb-2">Habit Analytics</h3>
            <div className="flex items-center justify-between">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" className="text-primary/10" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-primary transition-all duration-1000 ease-in-out"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-epilogue font-bold text-xl text-primary">{progressPercentage}%</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <span className="block font-newsreader uppercase tracking-widest text-[10px] text-tertiary font-bold">Completed Tasks</span>
                  <span className="font-handwritten text-3xl text-primary font-bold">{completedHabits} <span className="text-3xl text-primary font-bold">/ {totalHabits}</span></span>
                </div>
                <div className="text-right">
                  <span className="block font-newsreader uppercase tracking-widest text-[10px] text-tertiary font-bold">Total Points</span>
                  <span className="font-epilogue font-bold text-xl text-primary">+{totalPoints}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            {summary ? (
              <div className="bg-secondary border border-tertiary/20 p-6 rounded-lg shadow-[4px_4px_0px_rgba(112,112,112,0.1)] paper-texture flex flex-col gap-6 min-h-[500px]  ">
                <h3 className="font-newsreader uppercase tracking-widest font-bold text-xs text-tertiary border-b border-primary/10 pb-2">Fitness Summary</h3>

                <div className="">
                  <p className="text-on-surface-variant font-epilogue font-bold  text-sm mb-1">Est. Calories Intake - <span className='font-handwritten text-xl font-extrabold text-primary hand-underline '>{summary.caloriesEstimate}</span></p>
                  <p className="text-on-surface-variant font-epilogue font-bold  text-sm mb-1">Est. Calories Burned - <span className='font-handwritten text-xl font-extrabold text-primary hand-underline'>{summary.caloriesBurned}</span></p>
                  <p className="text-on-surface-variant font-epilogue font-bold  text-sm mb-1">Est. Protein Intake - <span className='font-handwritten text-xl font-extrabold text-primary hand-underline'>{summary.proteinEstimate}</span></p>
                  <h3 className="flex gap-4 mt-4 mb-4 font-newsreader uppercase tracking-widest font-bold text-xs text-tertiary border-b border-primary/10 pb-2">

                    Coach's Note
                  </h3>
                  <div className=" bg-white h-full p-4 -rotate-3 relative ruled-line marker-stroke animate-in slide-in-from-bottom-10  duration-500 ">
                    <p className="font-handwritten text-2xl text-on-surface mt-5 line-height-[2rem]">{summary.summary}</p>
                    {/* tape */}
                    <div className="bg-zinc-300 h-8 w-1/4 -rotate-1 absolute -top-3 left-30 opacity-60"></div>
                  </div>
                </div>








              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-on-surface-variant/50 border-2 border-dashed border-outline-variant/30 rounded-3xl min-h-[300px]">
                <Sparkles size={48} className="mb-4 text-outline-variant/30" />
                <p className="font-newsreader max-w-sm">Submit your daily intake and workout to get personalized AI insights and nutritional estimates.</p>
              </div>
            )}
          </div>


        </div>
      </div>
    </main>
  );
};

export default Tracker;
