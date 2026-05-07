import React from 'react';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="bg-secondary min-h-screen relative overflow-hidden flex flex-col text-black">
      <NavBar />
      
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-96 h-96 border-[24px] border-tertiary/5 rounded-full coffee-stain pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] border-[12px] border-tertiary/5 rounded-full coffee-stain pointer-events-none"></div>

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
              Start Your Ledger
            </Link>
            <Link 
              to="/login" 
              className="bg-transparent text-primary border-2 border-primary font-epilogue uppercase tracking-widest font-bold py-4 px-12 hover:bg-primary/5 transition-all w-full sm:w-auto"
            >
              Open Ledger
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="w-full text-center py-8 border-t border-dashed border-primary/20">
         <p className="font-newsreader italic text-tertiary text-sm">© {new Date().getFullYear()} TrackIt AI. Crafted for mindfulness.</p>
      </footer>
    </div>
  );
};

export default Landing;
