import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash, Edit2, Wand2, Loader2, Check, MoveRight } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { useAuth } from '../context/AuthContext'

const Onboard = () => {
    const navigate = useNavigate()
    const { user, login } = useAuth()

    const [demographics, setDemographics] = useState({ age: '', gender: '' })
    const [step, setStep] = useState(1)

    const [independentHabits, setIndependentHabits] = useState([])
    const [goals, setGoals] = useState([])

    const [generatingIndex, setGeneratingIndex] = useState(null)
    const [saving, setSaving] = useState(false)

    // Fitness Profile
    const [fitnessProfile, setFitnessProfile] = useState({
        weight: '',
        height: '',
        fitnessGoal: '',
        activityLevel: '',
        sleepHours: '',
        dietPreferences: ''
    })
    const [generatedDiet, setGeneratedDiet] = useState(null)
    const [generatingDiet, setGeneratingDiet] = useState(false)

    // Modal states
    const [habitDialogOpen, setHabitDialogOpen] = useState(false)
    const [goalDialogOpen, setGoalDialogOpen] = useState(false)

    // Current inputs
    const [newHabit, setNewHabit] = useState({ name: '', target: '', frequency: 'Daily', points: 10, customDate: '', targetGoalIndex: null, editIndex: null })
    const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' })

    const handleSaveGoal = () => {
        if (!newGoal.title) return;
        setGoals([...goals, { ...newGoal, habits: [] }]);
        setNewGoal({ title: '', description: '', targetDate: '' });
        setGoalDialogOpen(false);
    }

    const handleSaveHabit = () => {
        if (!newHabit.name) return;
        if (newHabit.frequency === 'Custom Date' && !newHabit.customDate) {
            alert("Please select a date for your custom habit.");
            return;
        }
        const habitToSave = {
            name: newHabit.name,
            target: newHabit.target,
            frequency: newHabit.frequency || 'Daily',
            customDate: newHabit.frequency === 'Custom Date' ? newHabit.customDate : '',
            points: newHabit.points || 10,
            approved: true
        };

        if (newHabit.targetGoalIndex !== null) {
            const updatedGoals = [...goals];
            if (newHabit.editIndex !== null) {
                updatedGoals[newHabit.targetGoalIndex].habits[newHabit.editIndex] = habitToSave;
            } else {
                updatedGoals[newHabit.targetGoalIndex].habits.push(habitToSave);
            }
            setGoals(updatedGoals);
        } else {
            if (newHabit.editIndex !== null) {
                const updatedIndep = [...independentHabits];
                updatedIndep[newHabit.editIndex] = habitToSave;
                setIndependentHabits(updatedIndep);
            } else {
                setIndependentHabits([...independentHabits, habitToSave]);
            }
        }

        setNewHabit({ name: '', target: '', frequency: 'Daily', points: 10, targetGoalIndex: null, editIndex: null });
        setHabitDialogOpen(false);
    }

    const openHabitDialog = (goalIndex = null, existingHabit = null, habitIndex = null) => {
        if (existingHabit) {
            setNewHabit({ ...existingHabit, targetGoalIndex: goalIndex, editIndex: habitIndex });
        } else {
            setNewHabit({ name: '', target: '', frequency: 'Daily', points: 10, customDate: '', targetGoalIndex: goalIndex, editIndex: null });
        }
        setHabitDialogOpen(true);
    }

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

    const handleGenerateAI = async (goalIndex) => {
        const goal = goals[goalIndex];
        if (!goal.title) return;
        setGeneratingIndex(goalIndex);
        try {
            const res = await api.post('/api/ai/generate_habits', { title: goal.title, description: goal.description });
            if (res.data.success && res.data.habits) {
                const newHabits = res.data.habits.map(h => ({
                    name: h.title,
                    target: h.description,
                    frequency: 'Daily',
                    points: 10,
                    approved: true
                }));
                const updatedGoals = [...goals];
                updatedGoals[goalIndex].habits = [...updatedGoals[goalIndex].habits, ...newHabits];
                setGoals(updatedGoals);
            }
        } catch (error) {
            console.error("AI Generation failed", error);
            alert("Failed to generate habits with AI.");
        } finally {
            setGeneratingIndex(null);
        }
    }

    const handleGenerateDiet = async () => {
        if (!fitnessProfile.weight || !fitnessProfile.height || !fitnessProfile.fitnessGoal) {
            alert("Please fill in weight, height, and fitness goal to generate a diet plan.");
            return;
        }
        setGeneratingDiet(true);
        try {
            const res = await api.post('/api/ai/generate_diet', fitnessProfile);
            if (res.data.success) {
                setGeneratedDiet(res.data.data);
            }
        } catch (error) {
            console.error("AI Diet Generation failed", error);
            alert("Failed to generate diet plan with AI.");
        } finally {
            setGeneratingDiet(false);
        }
    }

    const removeIndependentHabit = (index) => {
        setIndependentHabits(independentHabits.filter((_, i) => i !== index));
    }

    const removeGoalHabit = (goalIndex, habitIndex) => {
        const updatedGoals = [...goals];
        updatedGoals[goalIndex].habits = updatedGoals[goalIndex].habits.filter((_, i) => i !== habitIndex);
        setGoals(updatedGoals);
    }

    const removeGoal = (index) => {
        setGoals(goals.filter((_, i) => i !== index));
    }

    const submitHandler = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = { onboarded: true };
            if (demographics.age) payload.age = Number(demographics.age);
            if (demographics.gender) payload.gender = demographics.gender;
            if (fitnessProfile.weight) payload.weight = Number(fitnessProfile.weight);
            if (fitnessProfile.height) payload.height = Number(fitnessProfile.height);

            await api.put('/api/users/update', payload);

            // Save independent habits
            for (const h of independentHabits) {
                await api.post('/api/habits/create_habit', {
                    habit_title: h.name,
                    target_value: h.target,
                    frequency: h.frequency,
                    customDate: h.customDate,
                    points: h.points
                });
            }

            // Save goals and their habits
            for (const g of goals) {
                const goalRes = await api.post('/api/goals/create_goal', {
                    goal_title: g.title,
                    goal_description: g.description,
                    targetDate: g.targetDate || new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    goal_status: 'active'
                });
                const createdGoalId = goalRes.data.goal._id;

                const habitsToSave = g.habits.filter(h => h.approved !== false);
                for (const h of habitsToSave) {
                    await api.post('/api/habits/create_habit', {
                        habit_title: h.name,
                        target_value: h.target,
                        frequency: h.frequency,
                        customDate: h.customDate,
                        points: h.points,
                        goalId: createdGoalId
                    });
                }
            }

            // Save fitness profile
            await api.post('/api/fitness/profile', {
                ...fitnessProfile,
                dietPlan: generatedDiet ? generatedDiet.dietPlan : null,
                targetCalories: generatedDiet ? generatedDiet.targetCalories : null,
                targetProtein: generatedDiet ? generatedDiet.targetProtein : null,
                targetBurn: generatedDiet ? generatedDiet.targetBurn : null
            });

            login({ ...user, onboarded: true });
            navigate('/tracker')
        } catch (error) {
            console.error("Onboarding submission failed", error);
            alert("Failed to save onboarding data. Please try again.");
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-secondary min-h-screen relative overflow-hidden flex flex-col justify-center items-center text-black py-12 px-4">
            <div className="absolute inset-0 pointer-events-none opacity-20 ruled-line z-0"></div>

            <div className="w-full max-w-4xl bg-white paper-texture border-2 border-primary paper-stack p-6 md:p-10 relative z-10 ink-bleed">
                <div className="text-center mb-8 border-b-2 border-dashed border-primary/20 pb-6">
                    <h1 className="font-handwritten text-5xl md:text-6xl text-primary mb-2">Set Your Intentions</h1>
                    <h3 className="font-newsreader uppercase font-bold text-xs tracking-widest text-tertiary">Begin your Narrative</h3>
                </div>

                <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if(!demographics.age || !demographics.gender) { alert("Please enter age and gender"); return; } setStep(2); } : submitHandler} className="flex flex-col font-newsreader w-full space-y-8">

                    {step === 1 && (
                        <>

                    <div className="flex flex-col md:flex-row justify-around gap-6">
                        <div className="flex-1">
                            <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1">Age</label>
                            <input
                                type="number"
                                className="outline-none bg-white px-2 border-b-2 border-primary/30 focus:border-primary marker-stroke w-full py-1 mt-1 font-epilogue text-lg"
                                placeholder="Your Age"
                                value={demographics.age}
                                onChange={e => setDemographics({ ...demographics, age: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-newsreader mb-2 uppercase text-xs tracking-widest text-tertiary font-bold block ">Gender</label>
                            <Select value={demographics.gender} onValueChange={v => setDemographics({ ...demographics, gender: v })}>
                                <SelectTrigger className="w-full px-2 py-4  bg-white outline-none  border-0 border-b-2 border-primary/30 focus:border-primary focus:ring-0 marker-stroke rounded-none font-epilogue text-lg ">
                                    <SelectValue placeholder="Your Gender" className='px-2'/>
                                </SelectTrigger>
                                <SelectContent className="bg-secondary border-primary rounded-none">
                                    <SelectGroup>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Independent Habits Section */}
                    <div className="bg-secondary p-6 border border-primary/20 paper-texture">
                        <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                            <p className="font-epilogue font-bold text-xl text-primary">Daily Habits</p>
                            <button
                                type="button"
                                onClick={() => openHabitDialog(null)}
                                className="flex items-center justify-center bg-white border-2 border-primary text-primary py-1 px-2 font-epilogue uppercase tracking-widest font-bold w-full sm:w-auto hover:bg-primary hover:text-white transition-all cursor-pointer"
                            >
                                Add Habit <Plus size={14} className="ml-1" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {independentHabits.length > 0 ? (
                                independentHabits.map((habit, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border border-primary/20 bg-white">
                                        <div>
                                            <p className="font-newsreader text-lg text-primary">{habit.name}</p>
                                            <p className="text-sm text-tertiary italic">{habit.target} • {habit.frequency === 'Custom Date' ? `Date: ${habit.customDate}` : habit.frequency} • {habit.points} pts</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openHabitDialog(null, habit, index)}
                                                className="text-primary p-2 border border-primary hover:bg-primary hover:text-white transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeIndependentHabit(index)}
                                                className="text-red-800 p-2 border border-red-800 hover:bg-red-800 hover:text-white transition-colors"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-tertiary italic py-4">No independent habits added yet.</div>
                            )}
                        </div>
                    </div>
                    
                    {/* Goals Section */}
                    <div className="bg-secondary p-6 border border-primary/20 paper-texture">
                        <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                            <p className="font-epilogue font-bold text-xl text-primary">Your Goals</p>
                            <button
                                type="button"
                                onClick={() => setGoalDialogOpen(true)}
                                disabled={goals.length >= 2}
                                className="flex items-center justify-center bg-white border-2 border-primary text-primary py-1 px-2 font-epilogue uppercase tracking-widest font-bold w-full sm:w-auto hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-50"
                            >
                                Add Goal <Plus size={14} className="ml-1" />
                            </button>
                        </div>
                        <p className="font-newsreader italic text-tertiary text-sm mb-4">You can set up to 2 overarching goals.</p>

                        <div className="space-y-6">
                            {goals.length > 0 ? (
                                goals.map((goal, index) => (
                                    <div key={index} className="border border-primary/30 bg-white p-4">
                                        <div className="flex justify-between items-start mb-4 border-b border-primary/10 pb-2">
                                            <div>
                                                <h4 className="font-epilogue font-bold text-lg text-primary">{goal.title}</h4>
                                                <p className="text-sm text-tertiary font-newsreader">{goal.description}</p>
                                                {goal.targetDate && <p className="text-xs text-tertiary mt-1">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeGoal(index)}
                                                className="text-red-800 p-2 border border-red-800 hover:bg-red-800 hover:text-white transition-colors"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>

                                        <div className="flex gap-4 mb-4">
                                            <button
                                                type="button"
                                                onClick={() => openHabitDialog(index)}
                                                className="flex items-center justify-center bg-white border-2 border-primary text-primary py-1 px-3 font-epilogue text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Plus size={14} className="mr-1" /> Add Habit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateAI(index)}
                                                disabled={generatingIndex === index}
                                                className="flex items-center justify-center bg-primary text-white border-2 border-primary py-1 px-3 font-epilogue text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-primary transition-all disabled:opacity-50"
                                            >
                                                {generatingIndex === index ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Wand2 size={14} className="mr-1" />}
                                                AI Generate
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {goal.habits.length > 0 ? (
                                                goal.habits.map((habit, hIndex) => (
                                                    <div key={hIndex} className={`flex items-center justify-between p-2 border ${habit.approved === false ? 'border-red-800/50 bg-red-50 opacity-50' : 'border-primary/10'} bg-secondary/30`}>
                                                        <div>
                                                            <p className="font-newsreader text-primary">{habit.name}</p>
                                                            <p className="text-xs text-tertiary italic">{habit.target} • {habit.frequency === 'Custom Date' ? `Date: ${habit.customDate}` : habit.frequency} • {habit.points} pts</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {habit.approved === undefined && (
                                                                <button
                                                                    type="button"
                                                                    className="text-primary p-1 border border-primary hover:bg-primary hover:text-white transition-colors"
                                                                    onClick={() => {
                                                                        const updatedGoals = [...goals];
                                                                        updatedGoals[index].habits[hIndex].approved = true;
                                                                        setGoals(updatedGoals);
                                                                    }}
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="text-primary p-1 border border-primary hover:bg-primary hover:text-white transition-colors"
                                                                onClick={() => openHabitDialog(index, habit, hIndex)}
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-red-800 p-1 border border-red-800 hover:bg-red-800 hover:text-white transition-colors"
                                                                onClick={() => {
                                                                    if (habit.approved === undefined || habit.approved === true) {
                                                                        const updatedGoals = [...goals];
                                                                        updatedGoals[index].habits[hIndex].approved = false;
                                                                        setGoals(updatedGoals);
                                                                    } else {
                                                                        removeGoalHabit(index, hIndex);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-xs text-tertiary italic">No habits linked to this goal yet.</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-tertiary italic py-4">No goals added yet.</div>
                            )}
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        className="py-4 gap-2 w-full font-epilogue uppercase tracking-widest font-bold border-2 bg-primary text-white border-primary cursor-pointer hover:bg-white hover:text-primary transition-all ink-bleed flex justify-center items-center"
                    >
                        Next<MoveRight/>
                    </button>
                    </>
                    )}

                    {step === 2 && (
                        <>
                    <div className="bg-secondary p-6 border border-primary/20 paper-texture space-y-6">
                        <div className="border-b border-primary/10 pb-2 mb-4">
                            <p className="font-epilogue font-bold text-xl text-primary">Fitness Profile</p>
                            <p className="font-newsreader italic text-tertiary text-sm">Help AI craft an Indian budget diet for you.</p>
                        </div>

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

                        {generatedDiet && (
                            <div className="mt-6 p-4 border border-primary/20 bg-white">
                                <p className="font-epilogue font-bold text-lg text-primary border-b border-primary/10 pb-2 mb-2">Your AI-Generated Plan</p>
                                <div className="grid grid-cols-3 gap-4 mb-4 mt-4">
                                    <div className="bg-secondary/50 p-2 text-center border border-primary/10">
                                        <p className="text-xs uppercase font-bold text-tertiary">Daily Calories</p>
                                        <p className="font-epilogue font-bold text-primary">{generatedDiet.targetCalories} kcal</p>
                                    </div>
                                    <div className="bg-secondary/50 p-2 text-center border border-primary/10">
                                        <p className="text-xs uppercase font-bold text-tertiary">Daily Protein</p>
                                        <p className="font-epilogue font-bold text-primary">{generatedDiet.targetProtein} g</p>
                                    </div>
                                    <div className="bg-secondary/50 p-2 text-center border border-primary/10">
                                        <p className="text-xs uppercase font-bold text-tertiary">Workout Burn</p>
                                        <p className="font-epilogue font-bold text-primary">{generatedDiet.targetBurn} kcal</p>
                                    </div>
                                </div>
                                <div 
                                    className="font-newsreader text-sm text-tertiary leading-relaxed"
                                    dangerouslySetInnerHTML={formatDietText(generatedDiet.dietPlan)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="py-4 w-1/3 font-epilogue uppercase tracking-widest font-bold border-2 bg-white text-primary border-primary cursor-pointer hover:bg-primary hover:text-white transition-all ink-bleed flex justify-center items-center"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="py-4 w-2/3 font-epilogue uppercase tracking-widest font-bold border-2 bg-primary text-white border-primary cursor-pointer hover:bg-white hover:text-primary transition-all ink-bleed disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                            {saving ? 'Saving...' : 'Complete Onboarding'}
                        </button>
                    </div>
                    </>
                    )}
                </form>

                {/* Habit Dialog */}
                <Dialog open={habitDialogOpen} onOpenChange={setHabitDialogOpen}>
                    <DialogContent className="bg-secondary paper-texture rounded-none border-2 border-primary ink-bleed">
                        <DialogHeader>
                            <DialogTitle className="font-epilogue font-bold text-primary">Create New Habit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <Input className="border-primary bg-white rounded-none px-1 " placeholder="Habit Title" value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })} />
                            <Input className="border-primary bg-white rounded-none px-1 " placeholder="Target (e.g., 20 mins)" value={newHabit.target} onChange={e => setNewHabit({ ...newHabit, target: e.target.value })} />
                            <Input className="border-primary bg-white rounded-none px-1 " type="number" placeholder="Points" value={newHabit.points} onChange={e => setNewHabit({ ...newHabit, points: Number(e.target.value) })} />
                            <Select value={newHabit.frequency} onValueChange={v => setNewHabit({ ...newHabit, frequency: v })} className="px-1">
                                <SelectTrigger className="border-primary bg-white rounded-none px-2">
                                    <SelectValue placeholder="Frequency" />
                                </SelectTrigger>
                                <SelectContent className="bg-secondary rounded-none  ">
                                    <SelectItem value="Daily" className="px-1">Daily</SelectItem>
                                    <SelectItem value="Weekly" className="px-1">Weekly</SelectItem>
                                    <SelectItem value="Monthly" className="px-1">Monthly</SelectItem>
                                    <SelectItem value="Custom Date" className="px-1">Custom Date</SelectItem>
                                </SelectContent>
                            </Select>
                            {newHabit.frequency === 'Custom Date' && (
                                <Input 
                                    type="date" 
                                    className="border-primary bg-white rounded-none px-1" 
                                    value={newHabit.customDate} 
                                    onChange={e => setNewHabit({ ...newHabit, customDate: e.target.value })} 
                                />
                            )}
                            <Button onClick={handleSaveHabit} className="w-full bg-primary text-white rounded-none font-epilogue uppercase tracking-widest">Save Habit</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Goal Dialog */}
                <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                    <DialogContent className="bg-secondary paper-texture rounded-none border-2 border-primary ink-bleed">
                        <DialogHeader>
                            <DialogTitle className="font-epilogue font-bold text-primary">Create New Goal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <Input className="border-primary bg-white rounded-none px-1" placeholder="Goal Title (e.g., Run a Marathon)" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} />
                            <Input className="border-primary bg-white rounded-none px-1" placeholder="Description ( Provide in detail for efficient AI response)" value={newGoal.description} onChange={e => setNewGoal({ ...newGoal, description: e.target.value })} />
                                                      <Button onClick={handleSaveGoal} className="w-full bg-primary text-white rounded-none font-epilogue uppercase tracking-widest">Save Goal</Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}

export default Onboard
