import React from 'react';

const HabitCard = ({ habit, onLog }) => {
  const isCompleted = habit.completedToday;

  return (
    <div 
      className="flex items-center gap-4 group cursor-pointer "
      onClick={() => onLog(habit._id)}
    >
      <div className={`w-6 h-6 border-2 border-primary  relative flex items-center justify-center transition-all group-hover:bg-primary/10 ${isCompleted ? 'bg-primary/5' : ''}`}>
        {isCompleted && (
          <span className="material-symbols-outlined text-sm text-primary font-extralight" style={{ fontVariationSettings: "'FILL' 1", scale:2.2 , position:'absolute', left:2, bottom:2, rotate:'-5deg'}}>
            check
          </span>
        )}
      </div>
      <div className="flex flex-col bg-ambqer-300">
        <span className={`font-handwritten text-2xl md:text-3xl  ${isCompleted ? 'strikethrough opacity-60 text-tertiary' : 'text-black'}`}>
          {habit.habit_title || habit.name}
        </span>
        <span className="text-xs text-tertiary font-newsreader italic">
          Target: {habit.target_value || habit.target} {habit.frequency ? (habit.frequency === 'Custom Date' ? `| Date: ${habit.customDate && habit.customDate.includes('-') ? `${habit.customDate.split('-')[2]}-${habit.customDate.split('-')[1]}` : habit.customDate}` : `| ${habit.frequency}`) : ''}
        </span>
      </div>
    </div>
  );
};

export default HabitCard;
