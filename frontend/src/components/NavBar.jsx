import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, User, BarChart2, MessageSquare, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navLinks = [
    { name: 'Tracker', path: '/tracker', icon: Home },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'AI Coach', path: '/ai-chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b-2 border-primary h-16 flex items-center justify-between px-6 lg:px-12 paper-texture">
      <div className="flex items-center gap-2">
        <Link to="/" className="font-epilogue font-bold text-xl text-primary flex items-center gap-2">
          <img src="/tape.png" alt="logo" className="h-8 w-8 object-contain" />
          <span className=" tracking-widest">TrackIt</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8 font-newsreader text-sm font-bold uppercase tracking-widest">
        {user ? (
            <>
                {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                    <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 transition-all duration-300 border-b-2 ${
                        isActive 
                        ? 'border-primary text-primary bg-primary/5' 
                        : 'border-transparent text-tertiary hover:border-primary/30 hover:text-primary'
                    }`}
                    >
                    <Icon size={18} />
                    {link.name}
                    </Link>
                );
                })}
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary flex items-center justify-center grayscale sepia-[.2] overflow-hidden">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-handwritten text-xl text-primary">{user.username ? user.username[0].toUpperCase() : 'U'}</span>
                    )}
                </div>
            </>
        ) : (
            <>
                <Link to="/about" className="text-tertiary hover:text-primary transition-colors">
                    About
                </Link>
                <Link to="/signup" className="flex items-center gap-2 bg-primary text-white px-4 py-2 hover:bg-white hover:text-primary border-2 border-primary transition-all ink-bleed">
                    <LogIn size={16} />
                    Get Started
                </Link>
            </>
        )}
      </div>

      {/* Mobile nav placeholder */}
      <div className="md:hidden flex items-center gap-4 text-primary">
        <button className="p-2 border-2 border-primary hover:bg-primary/10 transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>
    </nav>
  )
}

export default NavBar
