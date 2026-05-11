import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, Plus, Trash2, Edit2, LogOut, Wand2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Profile = () => {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || '',
    height: user?.height || '',
    weight: user?.weight || ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || '',
        age: user.age || '',
        gender: user.gender || '',
        height: user.height || '',
        weight: user.weight || ''
      });
    }
  }, [user]);

  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [goalDialog, setGoalDialog] = useState(false);
  const [habitDialog, setHabitDialog] = useState(false);

  const [currentGoal, setCurrentGoal] = useState({ title: '', description: '', targetDate: '' });
  const [currentHabit, setCurrentHabit] = useState({ habit_title: '', target_value: '', frequency: 'Daily', points: 10, customDate: '', goalId: '' });

  const formatDietText = (text) => {
    if (!text) return { __html: '' };
    let formatted = text
        .replace(/^### (.*$)/gim, '<h3 class="font-epilogue font-bold text-lg text-primary mt-6 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="font-epilogue font-bold text-xl text-primary mt-5 mb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="font-epilogue font-bold text-2xl text-primary mt-4 mb-2">$1</h1>')
        .replace(/^\s*[\*-]\s+(.*$)/gim, '<li class="ml-4 mb-1 list-disc marker:text-primary">$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="block mt-5 mb-1 text-primary text-base">$1</strong>')
        .replace(/(?<!<[^>]*>)\*(.*?)\*(?![^<]*>)/g, '<em>$1</em>')
        .replace(/[*#]/g, '') // Remove stray asterisks/hashes
        .replace(/\n\s*\n/g, '<br />')
        .replace(/\n/g, '<br />')
        .replace(/(<\/h[1-3]>|<\/li>|<\/strong>)<br \/>/g, '$1')
        .replace(/<br \/>(<h[1-3]>|<li|<strong)/g, '$1');
    return { __html: formatted };
  };

  const [fitnessProfile, setFitnessProfile] = useState({
    weight: '', height: '', fitnessGoal: '', activityLevel: '',
    sleepHours: '', dietPreferences: '', dietPlan: '', targetCalories: '', targetProtein: '', targetBurn: ''
  });
  const [generatingDiet, setGeneratingDiet] = useState(false);
  const [savingFitness, setSavingFitness] = useState(false);
  const [fitnessModalOpen, setFitnessModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, habitsRes, userRes, fitnessRes] = await Promise.all([
        api.get('/api/goals/get_goals').catch(() => ({ data: { goals: [] } })),
        api.get('/api/habits/get_habits').catch(() => ({ data: { habits: [] } })),
        api.get('/api/users/me').catch(() => ({ data: { user: null } })),
        api.get('/api/fitness/profile').catch(() => ({ data: { profile: null } }))
      ]);
      setGoals(goalsRes.data.goals || []);
      setHabits(habitsRes.data.habits || []);

      if (userRes.data.user) {
        setProfile({
          username: userRes.data.user.username || '',
          email: userRes.data.user.email || '',
          age: userRes.data.user.age || '',
          gender: userRes.data.user.gender || '',
          height: userRes.data.user.height || '',
          weight: userRes.data.user.weight || ''
        });

        // Sync weight and height to fitnessProfile if they are missing there but exist in user
        setFitnessProfile(prev => ({
          ...prev,
          weight: prev.weight || userRes.data.user.weight || '',
          height: prev.height || userRes.data.user.height || ''
        }));
      }

      if (fitnessRes.data.profile) {
        setFitnessProfile(prev => ({
          ...prev,
          ...fitnessRes.data.profile
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.put('/api/users/update', profile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    try {
      if (currentGoal._id) {
        await api.put(`/api/goals/${currentGoal._id}`, {
          goal_title: currentGoal.title,
          goal_description: currentGoal.description,
          targetDate: currentGoal.targetDate
        });
      } else {
        await api.post('/api/goals/create_goal', {
          goal_title: currentGoal.title,
          goal_description: currentGoal.description,
          targetDate: currentGoal.targetDate
        });
      }
      setGoalDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await api.delete(`/api/goals/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveHabit = async () => {
    try {
      if (currentHabit.frequency === 'Custom Date' && !currentHabit.customDate) {
        alert("Please select a date for your custom habit.");
        return;
      }
      if (currentHabit._id) {
        await api.put(`/api/habits/${currentHabit._id}`, currentHabit);
      } else {
        await api.post('/api/habits/create_habit', currentHabit);
      }
      setHabitDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm("Delete this habit?")) return;
    try {
      await api.delete(`/api/habits/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openNewGoal = () => {
    setCurrentGoal({ title: '', description: '', targetDate: '' });
    setGoalDialog(true);
  };
  const openEditGoal = (g) => {
    setCurrentGoal({ _id: g._id, title: g.goal_title || g.title, description: g.goal_description || g.description, targetDate: g.targetDate ? g.targetDate.split('T')[0] : '' });
    setGoalDialog(true);
  };

  const openNewHabit = (goalId = null) => {
    setCurrentHabit({ habit_title: '', target_value: '', frequency: 'Daily', points: 10, customDate: '', goalId: goalId || '' });
    setHabitDialog(true);
  };
  const openEditHabit = (h) => {
    setCurrentHabit({ _id: h._id, habit_title: h.habit_title || h.name, target_value: h.target_value || h.target, frequency: h.frequency || 'Daily', customDate: h.customDate || '', points: h.points || 10, goalId: h.goalId || '' });
    setHabitDialog(true);
  };

  const handleGenerateDiet = async () => {
    if (!fitnessProfile.weight || !fitnessProfile.height || !fitnessProfile.fitnessGoal) {
      alert("Please fill in weight, height, and fitness goal to generate a diet plan.");
      return;
    }
    setGeneratingDiet(true);
    try {
      const res = await api.post('/api/ai/generate_diet', fitnessProfile);
      if (res.data && res.data.plan) {
        setFitnessProfile({
          ...fitnessProfile,
          dietPlan: res.data.plan.dietPlan,
          targetCalories: res.data.plan.targetCalories,
          targetProtein: res.data.plan.targetProtein,
          targetBurn: res.data.plan.targetBurn
        });
      } else if (res.data.success && res.data.data) {
        // Fallback for Onboard.jsx style response
        setFitnessProfile({
          ...fitnessProfile,
          dietPlan: res.data.data.dietPlan,
          targetCalories: res.data.data.targetCalories,
          targetProtein: res.data.data.targetProtein,
          targetBurn: res.data.data.targetBurn
        });
      }
    } catch (error) {
      console.error("Failed to generate diet", error);
      alert("Failed to generate diet plan. Please try again.");
    } finally {
      setGeneratingDiet(false);
    }
  };

  const handleSaveFitnessProfile = async (e) => {
    e.preventDefault();
    setSavingFitness(true);
    setMessage('');
    try {
      await api.post('/api/fitness/profile', fitnessProfile);
      // Sync weight/height to user model too so Profile tab is updated
      if (fitnessProfile.weight || fitnessProfile.height) {
        await api.put('/api/users/update', {
          weight: Number(fitnessProfile.weight),
          height: Number(fitnessProfile.height)
        });
      }
      fetchData();
      setMessage('Fitness Profile saved successfully!');
      setFitnessModalOpen(false);
    } catch (error) {
      console.error("Failed to save fitness profile", error);
      setMessage('Failed to save fitness profile.');
    } finally {
      setSavingFitness(false);
    }
  };

  return (
    <main className="pt-8 pb-24 px-4 lg:px-8 max-w-5xl mx-auto relative overflow-hidden bg-secondary min-h-screen text-black">

      <div className="flex justify-between items-end mb-12 border-b-2 border-primary/20 pb-4">
        <div>
          <h1 className="font-handwritten text-6xl text-primary mb-2">Settings & Profile</h1>
          <p className="text-tertiary font-newsreader italic">Manage your personal details, goals, and habits.</p>
        </div>
        <Button onClick={logout} variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white transition-all font-epilogue uppercase tracking-widest rounded-none">
          <LogOut size={16} className="mr-2" /> Logout
        </Button>
      </div>

      <section className="flex flex-col md:flex-row gap-12 items-start mb-16">


        <div className="flex-1 space-y-6">
          <div>
            <h1 className="font-epilogue text-4xl font-bold text-primary mb-1">{profile.username || 'User'}</h1>
            <p className="font-newsreader text-lg text-tertiary italic">"A life unexamined is not worth living."</p>
          </div>
        </div>
      </section>

      <Tabs defaultValue="profile" className="w-full  flex-col items-center justify-center">
        <TabsList className="grid w-full grid-cols-4 justify-center max-w-[800px] mb-8 bg-tertiary/10 rounded-none border border-tertiary/20 p-1">
          <TabsTrigger value="profile" className="font-newsreader uppercase text-sm tracking-widest font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer rounded-none">Profile</TabsTrigger>
          <TabsTrigger value="goals" className="font-newsreader uppercase text-sm tracking-widest font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer rounded-none">Goals</TabsTrigger>
          <TabsTrigger value="habits" className="font-newsreader uppercase text-sm tracking-widest font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer rounded-none">Habits</TabsTrigger>
          <TabsTrigger value="fitness" className="font-newsreader uppercase text-sm tracking-widest font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer rounded-none">Fitness</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in fade-in duration-500 w-full">
          <div className="bg-secondary p-8 border border-tertiary/20 rounded-lg shadow-[4px_4px_0px_rgba(112,112,112,0.1)] relative paper-texture">
            <h2 className="font-epilogue font-bold text-2xl text-primary border-b-2 border-dashed border-tertiary/30 pb-2 flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined">person</span>
              Personal Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="ruled-line pb-2 border-b border-primary/10">
                  <label className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold block mb-1">Username</label>
                  <input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} className="font-handwritten text-4xl text-primary border-none shadow-none bg-transparent p-0 focus-visible:ring-0" />
                </div>
                <div className="ruled-line pb-2 border-b border-primary/10">
                  <label className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold block mb-1">Age</label>
                  <input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} className="font-handwritten text-4xl text-primary border-none shadow-none bg-transparent p-0 focus-visible:ring-0" />
                </div>
                <div className="ruled-line pb-2 border-b border-primary/10">
                  <label className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold block mb-1">Gender</label>
                  <Select onValueChange={(v) => setProfile({ ...profile, gender: v })} value={profile.gender}>
                    <SelectTrigger className="font-handwritten text-4xl text-primary border-none shadow-none bg-transparent p-0 focus-visible:ring-0 h-auto">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="ruled-line pb-2 border-b border-primary/10">
                  <label className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold block mb-1">Height (cm)</label>
                  <input type="number" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} className="font-handwritten text-4xl text-primary border-none shadow-none bg-transparent p-0 focus-visible:ring-0" />
                </div>
                <div className="ruled-line pb-2 border-b border-primary/10">
                  <label className="font-newsreader text-xs uppercase tracking-widest text-tertiary font-bold block mb-1">Weight (kg)</label>
                  <input type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} className="font-handwritten text-4xl text-primary border-none shadow-none bg-transparent p-0 focus-visible:ring-0" />
                </div>
              </div>
              {message && <p className="text-sm text-primary font-bold">{message}</p>}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="bg-primary text-white rounded-none font-epilogue uppercase tracking-widest px-8 ink-bleed hover:bg-primary/90">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <span className="material-symbols-outlined mr-2">save</span>} Save
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="animate-in fade-in duration-500 w-full">
          <div className="bg-secondary p-8 border border-tertiary/20 rounded-lg shadow-[4px_4px_0px_rgba(112,112,112,0.1)] relative paper-texture">
            <div className="flex justify-between items-center mb-8 border-b-2 border-dashed border-tertiary/30 pb-2">
              <h2 className="font-epilogue font-bold text-2xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">flag</span>
                Manage Goals
              </h2>
              <Button onClick={openNewGoal} className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-none font-epilogue uppercase tracking-widest">
                <Plus size={16} className="mr-2" /> New Goal
              </Button>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-6">
                {goals.map(goal => {
                  const goalHabits = habits.filter(h => h.goalId === goal._id);
                  return (
                    <div key={goal._id} className="border border-primary/20 bg-white p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-primary/10 pb-4 mb-4 gap-4">
                        <div>
                          <h4 className="font-bold text-xl text-primary font-epilogue">{goal.goal_title || goal.title}</h4>
                          <p className="text-sm text-tertiary font-newsreader italic">{goal.goal_description || goal.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => openEditGoal(goal)} variant="outline" size="icon" className="h-9 w-9 rounded-none border-primary bg-white text-primary hover:bg-primary/10"><Edit2 size={16} /></Button>
                          <Button onClick={() => handleDeleteGoal(goal._id)} variant="outline" size="icon" className="h-9 w-9 rounded-none border-primary bg-white text-primary hover:bg-red-50 hover:text-red-600 border-primary"><Trash2 size={16} /></Button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-newsreader uppercase tracking-widest text-xs font-bold text-tertiary">Linked Habits</h5>
                          <Button onClick={() => openNewHabit(goal._id)} variant="outline" size="sm" className="rounded-none border-primary bg-white text-primary hover:bg-primary hover:text-white font-epilogue uppercase tracking-widest text-[10px] h-7 px-2 flex items-center gap-1"><Plus size={12} /> Add Habit</Button>
                        </div>
                        {goalHabits.length > 0 ? (
                          <ul className="space-y-2">
                            {goalHabits.map(habit => (
                              <li key={habit._id} className="flex justify-between items-center p-2 bg-secondary/30 border border-primary/10">
                                <div>
                                  <p className="font-newsreader text-primary">{habit.habit_title || habit.name}</p>
                                  <p className="text-xs text-tertiary italic">{habit.target_value || habit.target} • {habit.frequency === 'Custom Date' ? `Date: ${habit.customDate}` : habit.frequency} • {habit.points} pts</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={() => openEditHabit(habit)} variant="outline" size="icon" className="h-6 w-6 rounded-none border-primary bg-white text-primary hover:bg-primary/10"><Edit2 size={12} /></Button>
                                  <Button onClick={() => handleDeleteHabit(habit._id)} variant="outline" size="icon" className="h-6 w-6 rounded-none border-primary bg-white text-primary hover:bg-primary/10"><Trash2 size={12} /></Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-tertiary italic">No habits linked to this goal yet.</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-tertiary font-newsreader italic">No goals found. Create one to get started.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="habits" className="animate-in fade-in duration-500 w-full">
          <div className="bg-secondary p-8 border border-tertiary/20 rounded-lg shadow-[4px_4px_0px_rgba(112,112,112,0.1)] relative paper-texture">
            <div className="flex justify-between items-center mb-8 border-b-2 border-dashed border-tertiary/30 pb-2">
              <h2 className="font-epilogue font-bold text-2xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">repeat</span>
                Manage Habits
              </h2>
              <Button onClick={() => openNewHabit(null)} className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-none font-epilogue uppercase tracking-widest">
                <Plus size={16} className="mr-2" /> New Habit
              </Button>
            </div>

            {habits.filter(h => !h.goalId).length > 0 ? (
              <ul className="ruled-line">
                {habits.filter(h => !h.goalId).map(habit => (
                  <li key={habit._id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-primary/10 py-4 gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-primary font-newsreader">{habit.habit_title || habit.name}</h4>
                      <p className="text-sm text-tertiary font-newsreader italic">Target: {habit.target_value || habit.target} | Freq: {habit.frequency === 'Custom Date' ? `Date: ${habit.customDate}` : habit.frequency} | Points: {habit.points || 10}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => openEditHabit(habit)} variant="outline" size="icon" className="rounded-none border-primary bg-white text-primary hover:bg-primary/10"><Edit2 size={16} /></Button>
                      <Button onClick={() => handleDeleteHabit(habit._id)} variant="outline" size="icon" className="rounded-none border-primary bg-white text-primary hover:bg-primary/10"><Trash2 size={16} /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-8 text-tertiary font-newsreader italic">No habits found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fitness" className="animate-in fade-in duration-500 w-full">
          <div className="bg-secondary p-8 border border-tertiary/20 rounded-lg shadow-[4px_4px_0px_rgba(112,112,112,0.1)] relative paper-texture">
            <div className="flex justify-between items-center mb-8 border-b-2 border-dashed border-tertiary/30 pb-2">
              <h2 className="font-epilogue font-bold text-2xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">fitness_center</span>
                Fitness Tracker Setup
              </h2>
              {fitnessProfile.dietPlan && (
                <Button onClick={() => setFitnessModalOpen(true)} className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-none font-epilogue uppercase tracking-widest">
                  <Plus size={16} className="mr-2" /> Create New Plan
                </Button>
              )}
            </div>

            {!fitnessProfile.dietPlan ? (
              <form onSubmit={handleSaveFitnessProfile} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1">Weight (kg)</label>
                    <input type="number" className="outline-none bg-white px-2 border-b-2 border-primary/30 focus:border-primary marker-stroke w-full py-1 mt-1 font-epilogue text-lg" value={fitnessProfile.weight} onChange={e => setFitnessProfile({ ...fitnessProfile, weight: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1">Height (cm)</label>
                    <input type="number" className="outline-none bg-white px-2 border-b-2 border-primary/30 focus:border-primary marker-stroke w-full py-1 mt-1 font-epilogue text-lg" value={fitnessProfile.height} onChange={e => setFitnessProfile({ ...fitnessProfile, height: e.target.value })} />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="font-newsreader mb-2 uppercase text-xs tracking-widest text-tertiary font-bold block">Fitness Goal</label>
                    <Select value={fitnessProfile.fitnessGoal} onValueChange={v => setFitnessProfile({ ...fitnessProfile, fitnessGoal: v })}>
                      <SelectTrigger className="w-full px-2 py-4 bg-white outline-none border-0 border-b-2 border-primary/30 focus:border-primary rounded-none font-epilogue text-lg"><SelectValue placeholder="Select Goal" /></SelectTrigger>
                      <SelectContent className="bg-secondary rounded-none">
                        <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                        <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                        <SelectItem value="Body Recomposition">Body Recomposition</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="font-newsreader mb-2 uppercase text-xs tracking-widest text-tertiary font-bold block">Activity Level</label>
                    <Select value={fitnessProfile.activityLevel} onValueChange={v => setFitnessProfile({ ...fitnessProfile, activityLevel: v })}>
                      <SelectTrigger className="w-full px-2 py-4 bg-white outline-none border-0 border-b-2 border-primary/30 focus:border-primary rounded-none font-epilogue text-lg"><SelectValue placeholder="Select Level" /></SelectTrigger>
                      <SelectContent className="bg-secondary rounded-none">
                        <SelectItem value="Sedentary">Sedentary</SelectItem>
                        <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                        <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                        <SelectItem value="Very Active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1">Sleep (Hours)</label>
                    <input type="number" className="outline-none bg-white px-2 border-b-2 border-primary/30 focus:border-primary marker-stroke w-full py-1 mt-1 font-epilogue text-lg" value={fitnessProfile.sleepHours} onChange={e => setFitnessProfile({ ...fitnessProfile, sleepHours: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <label className="font-newsreader mb-2 uppercase text-xs tracking-widest text-tertiary font-bold block">Diet Preferences</label>
                    <Select value={fitnessProfile.dietPreferences} onValueChange={v => setFitnessProfile({ ...fitnessProfile, dietPreferences: v })}>
                      <SelectTrigger className="w-full px-2 py-4 bg-white outline-none border-0 border-b-2 border-primary/30 focus:border-primary rounded-none font-epilogue text-lg"><SelectValue placeholder="Select Diet" /></SelectTrigger>
                      <SelectContent className="bg-secondary rounded-none">
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                        <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateDiet}
                  disabled={generatingDiet}
                  className="w-full py-3 mt-4 flex items-center justify-center bg-primary text-white font-epilogue uppercase tracking-widest font-bold hover:bg-white hover:text-primary border-2 border-primary transition-all disabled:opacity-50"
                >
                  {generatingDiet ? <Loader2 className="animate-spin mr-2" size={18} /> : <Wand2 className="mr-2" size={18} />}
                  {generatingDiet ? "Generating Diet..." : "Generate AI Diet Plan"}
                </button>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-4 mt-4">
                  <div className="bg-white p-2 text-center border border-primary/10">
                    <p className="text-xs uppercase font-bold text-tertiary">Daily Calories</p>
                    <p className="font-epilogue font-bold text-primary">{fitnessProfile.targetCalories} kcal</p>
                  </div>
                  <div className="bg-white p-2 text-center border border-primary/10">
                    <p className="text-xs uppercase font-bold text-tertiary">Daily Protein</p>
                    <p className="font-epilogue font-bold text-primary">{fitnessProfile.targetProtein} g</p>
                  </div>
                  <div className="bg-white p-2 text-center border border-primary/10">
                    <p className="text-xs uppercase font-bold text-tertiary">Workout Burn</p>
                    <p className="font-epilogue font-bold text-primary">{fitnessProfile.targetBurn} kcal</p>
                  </div>
                </div>
                <div className="bg-white p-6 border border-primary/10">
                  <p className="font-epilogue font-bold text-lg text-primary border-b border-primary/10 pb-2 mb-4">Your AI-Generated Plan</p>
                  <div
                    className="font-newsreader text-sm text-tertiary leading-relaxed"
                    dangerouslySetInnerHTML={formatDietText(fitnessProfile.dietPlan)}
                  />
                </div>

                {/* Past Plans (Inactive) */}
                {fitnessProfile.pastPlans && fitnessProfile.pastPlans.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-epilogue font-bold text-xl text-primary border-b border-primary/10 pb-2 mb-4">Previous Plans</h3>
                    <div className="space-y-4">
                      {fitnessProfile.pastPlans.map((plan, idx) => (
                        <div key={idx} className="bg-white/50 p-4 border border-tertiary/20 opacity-80">
                          <p className="text-xs font-bold uppercase tracking-widest text-tertiary mb-2">Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center">
                              <p className="text-[10px] uppercase font-bold text-tertiary">Calories</p>
                              <p className="font-epilogue text-sm text-primary">{plan.targetCalories}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] uppercase font-bold text-tertiary">Protein</p>
                              <p className="font-epilogue text-sm text-primary">{plan.targetProtein}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] uppercase font-bold text-tertiary">Burn</p>
                              <p className="font-epilogue text-sm text-primary">{plan.targetBurn}</p>
                            </div>
                          </div>
                          <div
                            className="font-newsreader text-xs text-tertiary leading-relaxed line-clamp-3"
                            dangerouslySetInnerHTML={formatDietText(plan.dietPlan)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Fitness Setup Modal */}
      <Dialog open={fitnessModalOpen} onOpenChange={setFitnessModalOpen}>
        <DialogContent className="bg-secondary paper-texture rounded-none border-2 border-primary ink-bleed max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-epilogue font-bold text-primary">New Fitness Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFitnessProfile} className="space-y-4 pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1">Weight (kg)</label>
                <input type="number" className="outline-none bg-white px-2 border-b-2 border-primary/30 focus:border-primary marker-stroke w-full py-1 font-epilogue" value={fitnessProfile.weight} onChange={e => setFitnessProfile({ ...fitnessProfile, weight: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1">Height (cm)</label>
                <input type="number" className="outline-none bg-white px-2 border-b-2 border-primary/30 focus:border-primary marker-stroke w-full py-1 font-epilogue" value={fitnessProfile.height} onChange={e => setFitnessProfile({ ...fitnessProfile, height: e.target.value })} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="font-newsreader mb-1 uppercase text-xs tracking-widest text-tertiary font-bold block">Fitness Goal</label>
                <Select value={fitnessProfile.fitnessGoal} onValueChange={v => setFitnessProfile({ ...fitnessProfile, fitnessGoal: v })}>
                  <SelectTrigger className="w-full bg-white rounded-none border-primary/30"><SelectValue placeholder="Select Goal" /></SelectTrigger>
                  <SelectContent className="bg-secondary rounded-none">
                    <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                    <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                    <SelectItem value="Body Recomposition">Body Recomposition</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="font-newsreader mb-1 uppercase text-xs tracking-widest text-tertiary font-bold block">Activity Level</label>
                <Select value={fitnessProfile.activityLevel} onValueChange={v => setFitnessProfile({ ...fitnessProfile, activityLevel: v })}>
                  <SelectTrigger className="w-full bg-white rounded-none border-primary/30"><SelectValue placeholder="Select Level" /></SelectTrigger>
                  <SelectContent className="bg-secondary rounded-none">
                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                    <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                    <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                    <SelectItem value="Very Active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1">Sleep (Hours)</label>
                <input type="number" className="outline-none bg-white px-2 border-b-2 border-primary/30 focus:border-primary marker-stroke w-full py-1 font-epilogue" value={fitnessProfile.sleepHours} onChange={e => setFitnessProfile({ ...fitnessProfile, sleepHours: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="font-newsreader mb-1 uppercase text-xs tracking-widest text-tertiary font-bold block">Diet Preferences</label>
                <Select value={fitnessProfile.dietPreferences} onValueChange={v => setFitnessProfile({ ...fitnessProfile, dietPreferences: v })}>
                  <SelectTrigger className="w-full bg-white rounded-none border-primary/30"><SelectValue placeholder="Select Diet" /></SelectTrigger>
                  <SelectContent className="bg-secondary rounded-none">
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                    <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button type="button" onClick={handleGenerateDiet} disabled={generatingDiet} className="w-full py-2 flex items-center justify-center bg-primary text-white font-epilogue uppercase tracking-widest font-bold hover:bg-white hover:text-primary border-2 border-primary transition-all disabled:opacity-50">
              {generatingDiet ? <Loader2 className="animate-spin mr-2" size={16} /> : <Wand2 className="mr-2" size={16} />}
              {generatingDiet ? "Generating Diet..." : "Generate AI Diet Plan"}
            </button>

            <Button type="submit" disabled={savingFitness} className="w-full bg-white border-2 border-primary text-primary rounded-none font-epilogue uppercase tracking-widest hover:bg-primary/10">
              {savingFitness ? <Loader2 className="animate-spin mr-2" /> : <span className="material-symbols-outlined mr-2">save</span>} Save & Apply Plan
            </Button>
          </form>
        </DialogContent>
      </Dialog>



      {/* Modals placed outside of Tabs to prevent unmounting issues */}
      <Dialog open={goalDialog} onOpenChange={setGoalDialog}>
        <DialogContent className="bg-secondary paper-texture rounded-none border-2 border-primary ink-bleed">
          <DialogHeader>
            <DialogTitle className="font-epilogue font-bold text-primary">{currentGoal._id ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input className="border-primary bg-white rounded-none" placeholder="Title" value={currentGoal.title} onChange={e => setCurrentGoal({ ...currentGoal, title: e.target.value })} />
            <Input className="border-primary bg-white rounded-none" placeholder="Description" value={currentGoal.description} onChange={e => setCurrentGoal({ ...currentGoal, description: e.target.value })} />
            <Button onClick={handleSaveGoal} className="w-full bg-primary text-white rounded-none font-epilogue uppercase tracking-widest">Save Goal</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={habitDialog} onOpenChange={setHabitDialog}>
        <DialogContent className="bg-secondary paper-texture rounded-none border-2 border-primary ink-bleed">
          <DialogHeader>
            <DialogTitle className="font-epilogue font-bold text-primary">{currentHabit._id ? 'Edit Habit' : 'Create Habit'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input className="border-primary bg-white rounded-none" placeholder="Habit Title" value={currentHabit.habit_title} onChange={e => setCurrentHabit({ ...currentHabit, habit_title: e.target.value })} />
            <Input className="border-primary bg-white rounded-none" placeholder="Target (e.g., 20 mins)" value={currentHabit.target_value} onChange={e => setCurrentHabit({ ...currentHabit, target_value: e.target.value })} />
            <Input className="border-primary bg-white rounded-none" type="number" placeholder="Points" value={currentHabit.points} onChange={e => setCurrentHabit({ ...currentHabit, points: e.target.value })} />
            <Select value={currentHabit.frequency} onValueChange={v => setCurrentHabit({ ...currentHabit, frequency: v })}>
              <SelectTrigger className="border-primary bg-white rounded-none">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent className="bg-secondary rounded-none">
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Custom Date">Custom Date</SelectItem>
              </SelectContent>
            </Select>
            {currentHabit.frequency === 'Custom Date' && (
              <Input
                className="border-primary bg-white rounded-none"
                type="date"
                value={currentHabit.customDate}
                onChange={e => setCurrentHabit({ ...currentHabit, customDate: e.target.value })}
              />
            )}
            <Select value={currentHabit.goalId || 'none'} onValueChange={v => setCurrentHabit({ ...currentHabit, goalId: v === 'none' ? null : v })}>
              <SelectTrigger className="border-primary bg-white rounded-none">
                <SelectValue placeholder="Select Goal" />
              </SelectTrigger>
              <SelectContent className="bg-secondary rounded-none">
                <SelectItem value="none">No Goal (Independent)</SelectItem>
                {goals.map(g => (
                  <SelectItem key={g._id} value={g._id}>{g.goal_title || g.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSaveHabit} className="w-full bg-primary text-white rounded-none font-epilogue uppercase tracking-widest">Save Habit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main >
  );
};

export default Profile;
