// ethara-frontend/src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Plus, 
  BrainCircuit, Activity, Clock, CheckCircle2, Loader2, Zap, Cpu, Shield, Globe, HardDrive, Eye, Star
} from 'lucide-react';
import { 
  loginUser, registerUser, getProjects, createProject, 
  getTasks, createTask, updateTaskStatus, getUsers 
} from './api';

const BootSequence = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Mounting Neural Kernel v4.0.2...",
    "Establishing Railway SQL Secure Link...",
    "Authenticating Ethara AGI Protocols...",
    "Loading RLHF Preference Rubrics...",
    "Syncing SFT Pipeline Metadata...",
    "Calibrating Dimension Weights...",
    "System Integrity: OPTIMAL"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent(prev => {
        if (percent >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => { clearInterval(timer); clearInterval(stepTimer); };
  }, [percent, onComplete, steps.length]);

  return (
    <motion.div 
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-6"
    >
      <div className="scanline"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20"></div>
      
      <motion.div 
        animate={{ 
          boxShadow: ["0 0 20px #4f46e5", "0 0 60px #4f46e5", "0 0 20px #4f46e5"],
          scale: [0.95, 1, 0.95]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mb-12 relative z-10"
      >
        <BrainCircuit size={50} className="text-white" />
      </motion.div>

      <div className="w-full max-w-md font-mono space-y-4">
        <div className="flex justify-between text-indigo-400 text-[10px] font-black uppercase tracking-widest">
          <span>Booting AGI Engine</span>
          <span>{percent}%</span>
        </div>
        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <motion.div style={{ width: `${percent}%` }} className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]"></motion.div>
        </div>
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentStep}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="text-emerald-500 text-[10px] uppercase font-bold text-center tracking-widest"
            >
              {steps[currentStep]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const InteractiveBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - 400);
      mouseY.set(e.clientY - 400);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#010413]">
      <motion.div style={{ x: smoothX, y: smoothY }} className="absolute w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] will-change-transform" />
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950"></div>
    </div>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl ${className}`}>
    {children}
  </motion.div>
);

const Button = ({ children, variant = 'primary', isLoading, className = '', ...props }) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_25px_rgba(79,70,229,0.3)] border border-white/10",
    secondary: "bg-white/5 backdrop-blur-md hover:bg-white/10 text-slate-200 border border-white/10",
    ghost: "hover:bg-indigo-500/10 text-indigo-400"
  };
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 text-[10px] disabled:opacity-50 ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : children}
    </motion.button>
  );
};

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [data, setData] = useState({ projects: [], tasks: [], team: [] });
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAll = async () => {
    setIsSyncing(true);
    try {
      const [p, t, u] = await Promise.all([getProjects(), getTasks(), getUsers()]);
      setData({ projects: p.data || [], tasks: t.data || [], team: u.data || [] });
    } catch (e) { console.error("Sync failed:", e); }
    setIsSyncing(false);
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative selection:bg-indigo-500/30">
      <AnimatePresence>{booting && <BootSequence onComplete={() => setBooting(false)} />}</AnimatePresence>
      
      {!booting && (
        <>
          <InteractiveBackground />
          <AnimatePresence mode="wait">
            {!user ? (
              <AuthView key="auth" onLogin={setUser} />
            ) : (
              <div key="app" className="flex w-full h-full relative z-10">
                {/* Sidebar */}
                <aside className="w-80 bg-slate-950/40 backdrop-blur-3xl border-r border-white/5 flex flex-col p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-16 px-2">
                    <motion.div animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <BrainCircuit size={28} className="text-white" />
                    </motion.div>
                    <span className="font-black text-2xl tracking-tighter text-white uppercase">Ethara<span className="text-indigo-500">.AI</span></span>
                  </div>
                  
                  <nav className="flex-1 space-y-3">
                    {[
                      { id: 'dashboard', icon: <LayoutDashboard size={18}/>, label: 'Command Hub' },
                      { id: 'projects', icon: <Globe size={18}/>, label: 'Datapipe' },
                      { id: 'tasks', icon: <Activity size={18}/>, label: 'Operations' },
                      { id: 'team', icon: <Users size={18}/>, label: 'Personnel' }
                    ].map(item => (
                      <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 font-black uppercase text-[10px] tracking-widest ${currentView === item.id ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                        {item.icon} <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center gap-4 mb-6 bg-white/5 p-5 rounded-[1.5rem] border border-white/5 shadow-inner">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-black text-white text-lg shadow-lg">{user.name[0]}</div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user.name}</p>
                        <p className="text-[9px] text-indigo-400 uppercase font-black tracking-widest opacity-80 mt-1">{user.role}</p>
                      </div>
                    </div>
                    <Button variant="secondary" className="w-full" onClick={() => setUser(null)}><LogOut size={14}/> Termination</Button>
                  </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-16 custom-scroll">
                  <AnimatePresence mode="wait">
                    {isSyncing && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-8 right-16 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                         <Loader2 size={12} className="animate-spin"/> Syncing Kernel
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence mode="wait">
                    <motion.div key={currentView} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto">
                      {currentView === 'dashboard' && <DashboardView user={user} {...data} />}
                      {currentView === 'projects' && <ProjectsView user={user} projects={data.projects} onRefresh={fetchAll} />}
                      {currentView === 'tasks' && <TasksView user={user} projects={data.projects} team={data.team} tasks={data.tasks} onRefresh={fetchAll} />}
                      {currentView === 'team' && <TeamView team={data.team} />}
                    </motion.div>
                  </AnimatePresence>
                </main>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

const AuthView = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = isLogin ? await loginUser(form) : await registerUser(form);
      onLogin(res.data);
    } catch (err) { alert("Access Denied: Terminal mismatch."); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 w-full">
      <GlassCard className="w-full max-w-lg p-12 relative overflow-hidden border-t-4 border-indigo-500 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col items-center mb-12">
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.5)] mb-8">
             <Cpu size={40} className="text-white" />
           </motion.div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">AGI Terminal</h1>
           <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] mt-3">Ethara Frontier Research</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {!isLogin && (
            <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-indigo-500 outline-none text-sm placeholder-slate-500" placeholder="Personnel Full Name" onChange={e => setForm({...form, name: e.target.value})} />
          )}
          
          <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-indigo-500 outline-none text-sm placeholder-slate-500" placeholder="Terminal Account ID (Email)" type="email" onChange={e => setForm({...form, email: e.target.value})} />
          
          <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-indigo-500 outline-none text-sm placeholder-slate-500" type="password" placeholder="Encrypted Passkey" onChange={e => setForm({...form, password: e.target.value})} />
          
          {!isLogin && (
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-slate-300 focus:border-indigo-500 outline-none text-sm cursor-pointer appearance-none" 
              onChange={e => setForm({...form, role: e.target.value})}
              value={form.role}
            >
              <option value="Member" className="bg-slate-900">AI Specialist (Member)</option>
              <option value="Admin" className="bg-slate-900">System Admin (Admin)</option>
            </select>
          )}

          <Button type="submit" className="w-full py-5 text-xs">{isLogin ? 'Initialize Secure Link' : 'Register Operative'}</Button>
        </form>
        
        <p className="text-center mt-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Uplink Status: {isLogin ? "Awaiting Packet" : "Ready for Ingestion"} • 
          <span className="text-indigo-400 ml-2 cursor-pointer hover:text-indigo-300 transition-colors" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Request CID' : 'Login'}</span>
        </p>
      </GlassCard>
    </div>
  );
};

const ProjectsView = ({ user, projects, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleCreate = async (e) => { 
    e.preventDefault(); 
    try {
      await createProject(form); 
      setIsOpen(false); 
      onRefresh(); 
    } catch(e) { alert("Initialization failed."); }
  };

  return (
    <div className="space-y-16">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-none">Datapipe</h2>
          <div className="flex items-center gap-4 mt-6">
             <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> Global RLHF Clusters</span>
             <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Cpu size={12}/> SFT Model Training</span>
          </div>
        </div>
        {user.role === 'Admin' && <Button onClick={() => setIsOpen(true)}><Plus size={18}/> New Pipeline</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {projects.length === 0 ? (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">Zero Data Ingestion Detected</p>
          </div>
        ) : projects.map(p => (
          <GlassCard key={p.id} className="p-10 group hover:border-indigo-500/30 transition-all flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
            <div className="flex justify-between items-start mb-10 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-2xl border border-emerald-500/20">Operational</span>
              <div className="text-slate-700 group-hover:text-indigo-400 transition-colors"><Zap size={24}/></div>
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter group-hover:text-indigo-300 transition-colors uppercase">{p.name}</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 line-clamp-3">{p.description}</p>
            <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Users size={14}/> Active Nodes: 12
              </div>
              <Eye size={16} className="text-slate-700 hover:text-white cursor-pointer transition-colors"/>
            </div>
          </GlassCard>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-md p-10">
              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Init Pipeline</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none text-sm placeholder-slate-500" placeholder="Designation Name" onChange={e => setForm({...form, name: e.target.value})} />
                <textarea required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none text-sm placeholder-slate-500 min-h-[120px]" placeholder="Mission Parameters" onChange={e => setForm({...form, description: e.target.value})} />
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Abort</Button>
                  <Button type="submit" className="flex-1">Execute</Button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TasksView = ({ user, tasks, projects, team, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '' });
  
  // DEFENSIVE LOGIC: Safely filter and handle possible nulls
  const myTasks = useMemo(() => {
    const list = user.role === 'Admin' ? tasks : tasks.filter(t => t.assigneeId === user.id);
    return Array.isArray(list) ? list : [];
  }, [tasks, user]);

  const handleCreate = async (e) => { 
    e.preventDefault(); 
    try {
      await createTask(form); 
      setIsOpen(false); 
      onRefresh(); 
    } catch(e) { alert("Deployment failed."); }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-none">Operations</h2>
          <p className="text-indigo-400 font-black uppercase tracking-widest text-[11px] mt-6 flex items-center gap-2">
            <Activity size={14}/> Direct Data Handlers & Rubric Evaluators
          </p>
        </div>
        {user.role === 'Admin' && <Button onClick={() => setIsOpen(true)}><Plus size={18}/> Deploy Protocol</Button>}
      </div>

      <GlassCard className="overflow-hidden border border-white/5">
        <div className="grid grid-cols-12 gap-6 p-8 border-b border-white/5 text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-black/20">
          <div className="col-span-4">Operational Directive</div>
          <div className="col-span-3">Assigned Pipeline</div>
          <div className="col-span-2">Operator</div>
          <div className="col-span-3 text-right">Status Matrix</div>
        </div>
        <div className="p-4 space-y-2">
          {myTasks.length === 0 ? (
             <div className="py-20 text-center italic text-slate-600 font-black uppercase text-xs tracking-widest">Awaiting task assignment from Project Lead...</div>
          ) : myTasks.map(t => (
             <motion.div whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }} key={t.id} className="grid grid-cols-12 gap-6 p-6 rounded-3xl items-center transition-all">
               <div className="col-span-4">
                 <p className="font-black text-white text-lg tracking-tight uppercase">{t.title}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'NO DEADLINE'}</p>
               </div>
               <div className="col-span-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{t.projectName || 'SYSTEM_LOAD'}</span>
               </div>
               <div className="col-span-2 text-xs text-indigo-300 font-black uppercase tracking-widest">{t.assigneeName || 'UNASSIGNED'}</div>
               <div className="col-span-3 text-right">
                 <select 
                   value={t.status} 
                   onChange={(e) => { updateTaskStatus(t.id, e.target.value); onRefresh(); }} 
                   className="bg-slate-900 border border-slate-700 text-[10px] font-black uppercase text-white rounded-xl px-4 py-2 outline-none cursor-pointer hover:border-indigo-500 transition-colors"
                 >
                   <option>Pending</option><option>In Progress</option><option>Completed</option><option>Overdue</option>
                 </select>
               </div>
             </motion.div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-md p-10">
              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">DeployProtocol</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none text-sm placeholder-slate-500" placeholder="Operation Objective" onChange={e => setForm({...form, title: e.target.value})} />
                
                <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-300 outline-none text-sm cursor-pointer appearance-none" onChange={e => setForm({...form, projectId: e.target.value})}>
                  <option value="" className="bg-slate-900">Select Pipeline...</option>
                  {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
                </select>
                
                <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-300 outline-none text-sm cursor-pointer appearance-none" onChange={e => setForm({...form, assigneeId: e.target.value})}>
                  <option value="" className="bg-slate-900">Assign Operator...</option>
                  {team.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name} ({u.role})</option>)}
                </select>
                
                <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none text-sm" onChange={e => setForm({...form, dueDate: e.target.value})} />
                
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Abort</Button>
                  <Button type="submit" className="flex-1">Deploy</Button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeamView = ({ team }) => {
  const etharaLeads = [
    { name: "Suryansh Rana", role: "Co-Founder & CEO", email: "ceo@ethara.ai", status: "online" },
    { name: "Mahanaaryaman Rao Scindia", role: "Co-Founder & CGO", email: "mrs@ethara.ai", status: "online" },
    { name: "Shubham Garg", role: "Co-Founder & CFO", email: "shubham@ethara.ai", status: "busy" },
    { name: "Subham Gorai", role: "Sr. Manager, Growth", email: "subham.gorai@ethara.ai", status: "online" },
    { name: "Vanshika Juneja", role: "Project Lead", email: "vanshika@ethara.ai", status: "online" },
    // 👇 Your custom card added here!
    { name: "Faizan Alam", role: "Full Stack Developer", email: "faizan.alam@ethara.ai", status: "online" }
  ];

  // If the database has real users, it will show them. Otherwise, it shows the leadership team.
  const fullTeam = team.length > 6 ? team : etharaLeads;

  return (
    <div className="space-y-16">
      <div className="flex flex-col">
        <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-none">Personnel</h2>
        <p className="text-indigo-400 font-black uppercase tracking-widest text-[11px] mt-6 flex items-center gap-2">
          <Shield size={14}/> Authorized Intelligence Specialist Operatives
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fullTeam.map((m, i) => (
          <GlassCard key={i} className="p-10 flex flex-col items-center text-center group hover:bg-white/5 transition-all">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center font-black text-indigo-400 text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                {m.name[0]}
              </div>
              <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-slate-950 shadow-xl ${m.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            </div>
            <h3 className="font-black text-2xl text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{m.name}</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 mb-6">{m.email}</p>
            <div className="flex gap-3">
               <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase text-indigo-300 tracking-tighter">{m.role}</span>
               <span className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-slate-500 hover:text-white transition-colors cursor-pointer"><Star size={14}/></span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

const DashboardView = ({ user, projects, tasks }) => {
  const filtered = Array.isArray(tasks) ? (user.role === 'Admin' ? tasks : tasks.filter(t => t.assigneeId === user.id)) : [];
  const stats = [
    { label: 'Active Pipes', val: projects.length, icon: <HardDrive size={24}/>, color: 'text-indigo-400' },
    { label: 'Neural Load', val: filtered.length, icon: <Activity size={24}/>, color: 'text-amber-400' },
    { label: 'Secure Nodes', val: '08', icon: <Shield size={24}/>, color: 'text-blue-400' },
    { label: 'Latency', val: '14ms', icon: <Zap size={24}/>, color: 'text-emerald-400' }
  ];

  return (
    <div className="space-y-16 pb-32">
      <div className="flex flex-col">
        <h2 className="text-8xl font-black text-white tracking-tighter uppercase leading-none">Command</h2>
        <p className="text-slate-500 text-2xl font-bold mt-6 tracking-tight">Accessing Ethara Frontier Lab. System Integrity: <span className="text-emerald-500">100%</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <GlassCard key={i} className="p-12 group relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className={`${s.color} mb-10 opacity-40 group-hover:scale-125 group-hover:opacity-100 transition-all duration-700`}>{s.icon}</div>
            <h3 className="text-6xl font-black text-white mb-2 tracking-tighter leading-none">{s.val}</h3>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-12 overflow-hidden relative border border-white/10">
        <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-6 uppercase tracking-tighter">
          <span className="w-3 h-3 bg-indigo-500 rounded-full animate-ping shadow-[0_0_20px_#6366f1]"></span> Operation Queue
        </h3>
        <div className="space-y-6">
          {filtered.length === 0 ? <p className="text-slate-600 font-black uppercase text-sm tracking-[0.2em] py-20 text-center italic">Neural buffer empty. Initializing data stream...</p> : filtered.slice(0, 5).map(t => (
            <div key={t.id} className="flex justify-between items-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-8">
                 <div className="w-1.5 h-16 bg-indigo-600/30 rounded-full group-hover:bg-indigo-500 group-hover:shadow-[0_0_15px_#6366f1] transition-all"></div>
                 <div>
                    <h4 className="font-black text-2xl text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{t.title}</h4>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-3 opacity-70">Designation: {t.projectName || 'UNSPECIFIED'} <span className="mx-4 text-slate-800">|</span> 0.4s Process Time</p>
                 </div>
              </div>
              <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-800/20 shadow-lg shadow-emerald-500/10' : 'bg-amber-500/10 text-amber-400 border-amber-800/20 shadow-lg shadow-amber-500/10'}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};