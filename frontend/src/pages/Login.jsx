import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const LogIn = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    setIsValid(isEmailValid && isPasswordValid);
  }, [email, password]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const data = { email, password };
      const response = await api.post('/api/users/login', data);
      
      login(response.data.user);
      
      setEmail("");
      setPassword("");
      navigate(response.data.user.onboarded ? "/tracker" : "/onboard");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary min-h-screen relative overflow-hidden flex flex-col justify-center items-center text-black py-12 px-4">
        {/* Background Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-20 ruled-line z-0"></div>
        
        <div className="w-full max-w-md bg-white border-2 border-primary paper-stack p-10 relative z-10 ink-bleed">
            {/* Decorative Seal */}
            <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full flex items-center justify-center text-white border-2 border-white/20 z-10 shadow-lg" style={{ background: 'linear-gradient(145deg, #1B2B44, #101928)' }}>
                <span className="font-handwritten text-2xl">TL</span>
            </div>

            <div className="text-center mb-8">
                <h1 className="font-handwritten text-6xl text-primary mb-2">Get Tracked</h1>
                <h3 className="font-newsreader uppercase font-bold text-xs tracking-widest text-tertiary">Resume your Narrative</h3>
            </div>
            
            <form onSubmit={submitHandler} className="flex flex-col font-newsreader w-full">
                {error && (
                    <p className="text-primary font-bold text-sm text-center mb-4 border border-primary/20 bg-primary/5 p-2">{typeof error === "string" ? error : JSON.stringify(error)}</p>
                )}
                
                <div className="mb-4">
                    <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1" htmlFor="email">Email</label>
                    <input
                        id="email"
                        className={`outline-none bg-transparent border-b-2 w-full py-2 font-epilogue text-lg ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-red-800 marker-stroke' : 'border-primary/30 focus:border-primary marker-stroke'}`}
                        placeholder="arthur@ledger.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <p className="text-red-800 text-xs mt-1 italic font-newsreader">Invalid email format</p>}
                </div>

                <div className="mb-8">
                    <label className="font-newsreader uppercase text-xs tracking-widest text-tertiary font-bold block mb-1" htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        className={`outline-none bg-transparent border-b-2 w-full py-2 font-epilogue text-lg tracking-widest ${password && password.length < 6 ? 'border-red-800 marker-stroke' : 'border-primary/30 focus:border-primary marker-stroke'}`}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {password && password.length < 6 && <p className="text-red-800 text-xs mt-1 italic font-newsreader">Min 6 characters required</p>}
                </div>

                <button 
                    disabled={!isValid || loading} 
                    className={`py-4 w-full font-epilogue uppercase tracking-widest font-bold border-2 ${!isValid || loading ? 'bg-secondary text-tertiary/50 border-tertiary/20 cursor-not-allowed' : 'bg-primary text-white border-primary cursor-pointer hover:bg-white hover:text-primary transition-all ink-bleed'}`}
                >
                    {loading ? 'Opening...' : 'Open Ledger'}
                </button>
            </form>

            <div className="mt-8 text-center border-t border-dashed border-primary/20 pt-6">
                <Link to={'/signup'} className="font-newsreader text-tertiary italic hover:text-primary transition-colors">Don't have an account? Create one.</Link>
            </div>
        </div>
    </div>
  )
}

export default LogIn
