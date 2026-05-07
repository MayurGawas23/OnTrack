import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import api from '../lib/axios';
import { Activity, Utensils, Sparkles } from 'lucide-react';

const FitnessTab = ({ summary, onSummaryUpdate, fitnessProfile }) => {
  const [meals, setMeals] = useState('');
  const [workout, setWorkout] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meals && !workout) return;
    
    setLoading(true);
    try {
      // Step 1: Request AI to analyze the meals and workout
      const targetText = fitnessProfile 
        ? `User Targets - Calories: ${fitnessProfile.targetCalories}, Protein: ${fitnessProfile.targetProtein}g, Workout Burn: ${fitnessProfile.targetBurn}kcal.`
        : '';
        
      const aiResponse = await api.post('/api/ai/chat', {
        prompt: `Analyze this fitness data against the targets. 
        Targets: ${targetText}
        Meals: ${meals}. 
        Workout: ${workout}. 
        Provide a brief JSON response with {"caloriesEstimate": "...", "caloriesBurned":"...", "proteinEstimate": "...", "summary": "Coach's note comparing actual vs target and motivation"} without markdown formatting.`
      });
      
      let aiData;
      try {
        const text = aiResponse.data.response.replace(/```json/g, '').replace(/```/g, '').trim();
        aiData = JSON.parse(text);
        console.log(aiData)
      } catch (err) {
        console.error("Failed to parse AI response", err);
        // Fallback dummy data if parse fails
        aiData = { caloriesEstimate: "N/A", caloriesBurned:"N/A", proteinEstimate: "N/A", summary: aiResponse.data.response };
      }

      onSummaryUpdate(aiData);

      // Step 2: Log it to fitness API
      const today = new Date().toISOString().split('T')[0];
      await api.post('/api/fitness/log', {
        date: today,
        meals,
        workout,
        caloriesEstimate: aiData.caloriesEstimate,
        caloriesBurned: aiData.caloriesBurned,
        proteinEstimate: aiData.proteinEstimate,
        summary: aiData.summary
      });

    } catch (error) {
      console.error('Error logging fitness:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1  gap-8 mt-6"> 
          <div className="">
            <h3 className="font-newsreader uppercase tracking-widest font-bold text-xs text-primary border-b border-primary/10 pb-2">Daily Activity Log</h3>
          <p className="font-newsreader text-tertiary">Log your meals and workouts for AI analysis.</p>
          </div>

        {fitnessProfile && (
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-2 text-center border border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-tertiary">Target Intake</p>
                    <p className="font-epilogue font-bold text-primary">{fitnessProfile.targetCalories || '-'} kcal</p>
                </div>
                <div className="bg-white p-2 text-center border border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-tertiary">Target Protein</p>
                    <p className="font-epilogue font-bold text-primary">{fitnessProfile.targetProtein || '-'} g</p>
                </div>
                <div className="bg-white p-2 text-center border border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-tertiary">Target Burn</p>
                    <p className="font-epilogue font-bold text-primary">{fitnessProfile.targetBurn || '-'} kcal</p>
                </div>
            </div>
        )}

        <div>
          {summary ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-on-surface-variant/50 min-h-[300px]">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">done_all</span>
              </div>
              <h3 className="font-epilogue font-bold text-xl text-on-surface mb-2">Great Job Today!</h3>
              <p className="font-newsreader max-w-sm">You have successfully logged your meals and workouts. Come back tomorrow for a new entry!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="flex gap-4 font-newsreader uppercase tracking-widest font-bold text-xs text-primary border-b border-primary/10 pb-2">
                  <Utensils size={18} className="text-primary" />
                  Meals & Food Intake
                </label>
                <Textarea 
                  placeholder="E.g., 2 eggs, 1 toast for breakfast. Chicken salad for lunch..."
                  value={meals}
                  onChange={(e) => setMeals(e.target.value)}
                  className=" w-full bg-white rotate-1 border-none outline-none resize-none font-handwritten text-3xl text-primary placeholder-primary/30 h-32 leading-relaxed ruled-line"
                />
                {/* tape  */}
                <div className="bg-zinc-300 h-8 w-1/8 rotate-18 absolute top-8 -right-6 opacity-60"></div>
              </div>
              
              <div className="space-y-2 relative">
                <label className="flex gap-4 font-newsreader uppercase tracking-widest font-bold text-xs text-primary border-b border-primary/10 pb-2">
                  <Activity size={18} className="text-primary" />
                  Workout & Activities
                </label>
            
                <Textarea 
                  placeholder="E.g., 45 mins weightlifting (chest/triceps), 15 mins treadmill... "
            
                  value={workout}
                  onChange={(e) => setWorkout(e.target.value)}
                  className=" w-full bg-white -rotate-1 border-none outline-none resize-none font-handwritten text-3xl text-primary placeholder-primary/30 h-32 leading-relaxed ruled-line"
                />
                  {/* tape  */}
                <div className="bg-zinc-300 h-8 w-1/8 -rotate-18 absolute top-2 right-0 opacity-60"></div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || (!meals && !workout)}
                className="w-full cursor-pointer bg-transparent border-2 border-primary text-primary font-epilogue font-bold uppercase py-2 flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all active:scale-95 ink-bleed mb-6"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><Sparkles className="animate-spin" size={20}/> Analyzing...</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles size={20}/> Generate Summary</span>
                )}
              </Button>
            </form>
          )}
        </div>


    </div>
  );
};

export default FitnessTab;
