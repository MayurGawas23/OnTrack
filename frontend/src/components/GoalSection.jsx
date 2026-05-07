import React from 'react';
import HabitCard from './HabitCard';

const GoalSection = ({ goal, title ,habits, onLogHabit }) => {
  const goalHabits = habits.filter(h => h.goalId === goal._id);

  if (goalHabits.length === 0) return null;

  return (
    <div className="mb-8 bg-ambewr-200">
      <h4 className="font-newsreader font-extrabold text-primary uppercase  tracking-widest text-sm">
        {title || goal.goal_title || goal.title}
      </h4>
      {(goal.goal_description || goal.description) && (
        <p className="text-tertiary font-newsreader   text-sm">Goal: <span className='font-bold'>{goal.goal_title }</span></p>
      )}
      
      <div className="grid grid-cols-1  ">
        {goalHabits.map(habit => (
          <HabitCard
            key={habit._id}
            habit={habit}
            onLog={onLogHabit}
          />
        ))}
      </div>
    </div>
  );
};

export default GoalSection;
