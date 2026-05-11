import React from 'react';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="bg-secondary min-h-screen relative overflow-hidden flex flex-col text-black">
      <NavBar />
      
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-96 h-96 border-[24px] border-tertiary/5 rounded-full coffee-stain pointer-events-none mix-blend-multiply"></div>
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] border-[12px] border-tertiary/5 rounded-full coffee-stain pointer-events-none mix-blend-multiply"></div>
      
      {/* Additional SVGs and blobs */}
      <div className="absolute top-40 left-10 opacity-20 pointer-events-none animate-pulse">
        <svg width="120" height="120" viewBox="0 0 100 100" className="text-tertiary fill-current">
          <path d="M48.5,9.5 C68.5,1.5 86.5,16.5 93.5,36.5 C100.5,56.5 85.5,80.5 65.5,89.5 C45.5,98.5 19.5,89.5 8.5,69.5 C-2.5,49.5 5.5,23.5 25.5,13.5 C33.5,9.5 41.5,12.5 48.5,9.5 Z" />
        </svg>
      </div>
      <div className="absolute bottom-40 right-20 opacity-10 pointer-events-none rotate-45">
        <svg width="150" height="150" viewBox="0 0 100 100" className="text-primary fill-none stroke-current stroke-[3]">
          <path d="M10,50 Q30,10 50,50 T90,50" />
          <path d="M10,70 Q30,30 50,70 T90,70" />
          <path d="M10,30 Q30,-10 50,30 T90,30" />
        </svg>
      </div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 border-[6px] border-primary/10 rounded-full coffee-stain pointer-events-none mix-blend-multiply"></div>
      <div className="absolute top-1/3 right-1/4 w-48 h-48 border-[8px] border-tertiary/10 rounded-full coffee-stain pointer-events-none rotate-12 mix-blend-multiply"></div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 py-24">
        <div className="max-w-4xl w-full mx-auto text-center space-y-8">
          <div className="inline-block border-2 border-primary bg-white px-6 py-2 paper-stack mb-4 rotate-[-2deg]">
            <span className="font-newsreader uppercase tracking-[0.2em] text-xs font-bold text-primary">The Art of Discipline</span>
          </div>

          <h1 className="font-handwritten text-7xl md:text-9xl text-primary leading-tight ink-bleed">
            Track It<br />Conquer It!!
          </h1>

          <p className="font-newsreader text-xl md:text-2xl text-tertiary italic max-w-2xl mx-auto leading-relaxed">
            "Your habits are the ink with which you write your future. Build discipline through mindful tracking."
          </p>

          <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/signup" 
              className="bg-primary text-white border-2 border-primary font-epilogue uppercase tracking-widest font-bold py-4 px-12 hover:bg-white hover:text-primary transition-all ink-bleed w-full sm:w-auto"
            >
              Start Journaling
            </Link>
            <Link 
              to="/login" 
              className="bg-transparent text-primary border-2 border-primary font-epilogue uppercase tracking-widest font-bold py-4 px-12 hover:bg-primary/5 transition-all w-full sm:w-auto"
            >
              Open Journal
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="w-full text-center py-8 border-t border-dashed border-primary/20">
         <p className="font-newsreader italic text-tertiary text-sm">© {new Date().getFullYear()} TrackIt. Crafted for Discipline.</p>
      </footer>
    </div>
  );
};

export default Landing;
