import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, User, BarChart2, MessageSquare, LogIn, Menu, X, SquareCheckBig } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { name: 'Tracker', path: '/tracker', icon: Home },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'AI Coach', path: '/ai-chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b-2 border-primary h-16 flex items-center justify-between px-6 lg:px-12 paper-texture">
      <div className="flex items-center gap-2">
        <Link to="/" className="font-epilogue font-bold text-xl text-primary flex items-center gap-2">
          {/* <img src="/icon.png" alt="logo" className="h-18 w-18 object-contain" /> */}
          <SquareCheckBig/>
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
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 border-2 border-primary hover:bg-primary/10 transition-colors"
        >
           <Menu size={24} />
        </button>
      </div>
    </nav>

    {/* Mobile Sidebar */}
    <div className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeMobileMenu}>
        <div 
          className={`absolute top-0 right-0 w-64 h-full bg-white paper-texture border-l-2 border-primary shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between p-4 border-b-2 border-dashed border-primary/20">
                <span className="font-epilogue font-bold text-primary tracking-widest uppercase">Menu</span>
                <button onClick={closeMobileMenu} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <div className="flex flex-col flex-1 p-4 gap-4 overflow-y-auto font-newsreader text-sm font-bold uppercase tracking-widest">
                {user ? (
                    <>
                        <div className="flex items-center gap-4 mb-4 p-2 border border-primary/20 bg-primary/5">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center grayscale sepia-[.2] overflow-hidden shrink-0">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-handwritten text-xl text-primary">{user.username ? user.username[0].toUpperCase() : 'U'}</span>
                                )}
                            </div>
                            <span className="text-primary truncate">{user.username}</span>
                        </div>
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={closeMobileMenu}
                                    className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 border-l-4 ${
                                        isActive 
                                        ? 'border-primary text-primary bg-primary/5' 
                                        : 'border-transparent text-tertiary hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                                    }`}
                                >
                                    <Icon size={20} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </>
                ) : (
                    <>
                        <Link to="/about" onClick={closeMobileMenu} className="px-4 py-3 text-tertiary hover:text-primary hover:bg-primary/5 transition-colors border-l-4 border-transparent">
                            About
                        </Link>
                        <Link to="/signup" onClick={closeMobileMenu} className="flex items-center gap-2 bg-primary text-white px-4 py-3 hover:bg-white hover:text-primary border-2 border-primary transition-all ink-bleed mt-4 justify-center">
                            <LogIn size={16} />
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </div>
    </div>
    </>
  )
}

export default NavBar
