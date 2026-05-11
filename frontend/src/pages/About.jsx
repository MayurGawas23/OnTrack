import NavBar from '@/components/NavBar'
import React from 'react'

const About = () => {
  return (
    <div className="bg-secondary min-h-screen relative overflow-hidden flex flex-col text-black ">
      <NavBar />

      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-96 h-96 border-[24px] border-tertiary/5 rounded-full coffee-stain pointer-events-none mix-blend-multiply"></div>
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] border-[12px] border-tertiary/5 rounded-full coffee-stain pointer-events-none mix-blend-multiply"></div>
      
      <div className="absolute top-40 left-10 opacity-20 pointer-events-none animate-pulse">
        <svg width="120" height="120" viewBox="0 0 100 100" className="text-tertiary fill-current">
          <path d="M48.5,9.5 C68.5,1.5 86.5,16.5 93.5,36.5 C100.5,56.5 85.5,80.5 65.5,89.5 C45.5,98.5 19.5,89.5 8.5,69.5 C-2.5,49.5 5.5,23.5 25.5,13.5 C33.5,9.5 41.5,12.5 48.5,9.5 Z" />
        </svg>
      </div>

      <main className="flex-1 flex flex-col px-4 md:px-12 relative z-10 pt-32 max-w-5xl mx-auto w-full space-y-24">
        
        {/* Header Section */}
        <section className="text-center space-y-6">
          <div className="inline-block border-2 border-primary bg-white px-6 py-2 paper-stack mb-4 rotate-[-1deg]">
            <span className="font-newsreader uppercase tracking-[0.2em] text-xs font-bold text-primary">About TrackIt</span>
          </div>
          <h1 className="font-handwritten text-6xl md:text-8xl text-primary leading-tight ink-bleed">
            The Journey of Discipline
          </h1>
          <p className="font-newsreader text-xl text-tertiary italic max-w-2xl mx-auto leading-relaxed">
            TrackIt is more than just a habit tracker. It is a philosophy, a tool to forge discipline, and your personal AI companion on the path to excellence.
          </p>
        </section>

        {/* Features Section */}
        <section className="bg-white paper-texture border-2 border-primary p-8 md:p-12 paper-stack">
          <h2 className="font-epilogue font-bold text-3xl text-primary border-b-2 border-dashed border-primary/20 pb-4 mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl">star</span>
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="font-epilogue font-bold text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">edit_calendar</span>
                Habit Tracking
              </h3>
              <p className="font-newsreader text-tertiary leading-relaxed">Monitor your daily, weekly, or monthly habits. Set custom dates and never miss a beat on your path to self-improvement.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-epilogue font-bold text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">fitness_center</span>
                AI Diet & Fitness
              </h3>
              <p className="font-newsreader text-tertiary leading-relaxed">Get tailored Indian budget diet plans and fitness activity recommendations directly from our AI coach based on your personal metrics.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-epilogue font-bold text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">analytics</span>
                Deep Analytics
              </h3>
              <p className="font-newsreader text-tertiary leading-relaxed">Visualize your progress with point-based completion graphs and weekly alignment to stay motivated and accountable.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-epilogue font-bold text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">chat</span>
                AI Companion
              </h3>
              <p className="font-newsreader text-tertiary leading-relaxed">Chat with an intelligent AI companion anytime to get advice, motivation, or guidance on your goals.</p>
            </div>
          </div>
        </section>

        {/* Walkthrough Section */}
        <section className="relative">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none -rotate-12">
            <svg width="200" height="200" viewBox="0 0 100 100" className="text-primary fill-none stroke-current stroke-[2]">
              <circle cx="50" cy="50" r="40" strokeDasharray="5,5" />
              <circle cx="50" cy="50" r="20" />
            </svg>
          </div>
          <h2 className="font-epilogue font-bold text-4xl text-primary mb-12 text-center">How It Works</h2>
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/30 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-secondary bg-primary text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">1</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 border border-primary/20 paper-texture shadow-[4px_4px_0px_rgba(112,112,112,0.1)]">
                <h3 className="font-epilogue font-bold text-xl text-primary mb-2">Set Your Intentions</h3>
                <p className="font-newsreader text-tertiary">Begin by completing the onboarding process. Define your goals, set up independent habits, and fill out your fitness profile.</p>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-secondary bg-primary text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">2</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 border border-primary/20 paper-texture shadow-[4px_4px_0px_rgba(112,112,112,0.1)]">
                <h3 className="font-epilogue font-bold text-xl text-primary mb-2">Track Daily Progress</h3>
                <p className="font-newsreader text-tertiary">Use the Tracker to log your habits, record your mood, and write daily notes. Everything is saved to your personal ledger.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-secondary bg-primary text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">3</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 border border-primary/20 paper-texture shadow-[4px_4px_0px_rgba(112,112,112,0.1)]">
                <h3 className="font-epilogue font-bold text-xl text-primary mb-2">Review & Adapt</h3>
                <p className="font-newsreader text-tertiary">Visit the Analytics dashboard to see your performance over time. Adjust your plans in your Profile as you grow and evolve.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Technologies Used */}
        <section className="flex flex-col justify-center items-center p-8 md:p-12   w-full ">
          <h2 className="font-epilogue font-bold text-3xl text-primary mb-8">Crafted With</h2>
          <div className="flex flex-col ruled-line pt-4 w-full  ">
            <p className="font-handwritten text-3xl px-4 py-2 font-bold text-primary mx-auto ">React.js</p>
            <p className="font-handwritten text-3xl px-4 py-2 font-bold text-primary mx-auto">Tailwind CSS</p>
            <p className="font-handwritten text-3xl px-4 py-2 font-bold text-primary mx-auto">Node.js</p>
            <p className="font-handwritten text-3xl px-4 py-2 font-bold text-primary mx-auto">Express</p>
            <p className="font-handwritten text-3xl px-4 py-2 font-bold text-primary mx-auto">MongoDB</p>
            <p className="font-handwritten text-3xl px-4 py-2 font-bold text-primary mx-auto">Google Gemini AI</p>
          </div>
        </section>

      </main>
          <footer className="w-full text-center py-4 border-t border-dashed border-primary/20 ">
         <p className="font-newsreader italic text-tertiary text-sm">© {new Date().getFullYear()} TrackIt. Crafted for Discipline.</p>
      </footer>
    </div>
  )
}

export default About