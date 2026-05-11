import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Shuffle, Users, Trash2, Trophy, Sparkles, Settings2, RefreshCw, Sun, Moon } from 'lucide-react';

type Mode = 'single' | 'teams';

interface DrawResults {
  type: Mode;
  winners?: string[];
  teams?: string[][];
}

// Fisher-Yates array shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [rawNames, setRawNames] = useState('');
  const [mode, setMode] = useState<Mode>('single');
  const [singleCount, setSingleCount] = useState<number>(1);
  const [teamCount, setTeamCount] = useState<number>(2);
  const [removeDrawn, setRemoveDrawn] = useState<boolean>(true);
  
  const [isShuffling, setIsShuffling] = useState(false);
  const [shufflePreview, setShufflePreview] = useState<string[]>([]);
  const [results, setResults] = useState<DrawResults | null>(null);

  const getValidNames = (): string[] => {
    return rawNames.split('\n').map(n => n.trim()).filter(n => n !== '');
  };

  const handleDraw = () => {
    const names = getValidNames();
    if (names.length === 0) return;

    if (mode === 'single' && singleCount > names.length) {
      alert('A quantidade de vencedores não pode ser maior do que a lista de nomes.');
      return;
    }

    if (mode === 'teams' && teamCount > names.length) {
      alert('A quantidade de equipes não pode ser maior do que a lista de nomes.');
      return;
    }

    setIsShuffling(true);
    setResults(null);

    // Suspense Animation
    const previewInterval = setInterval(() => {
      setShufflePreview(shuffleArray(names).slice(0, Math.max(singleCount, 3))); // display up to singleCount or 3
    }, 100);

    setTimeout(() => {
      clearInterval(previewInterval);
      setIsShuffling(false);
      
      const shuffled = shuffleArray(names);
      
      if (mode === 'single') {
        const winners = shuffled.slice(0, singleCount);
        setResults({ type: 'single', winners });
        
        // Shoot confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4ade80', '#3b82f6', '#f43f5e', '#a855f7', '#fbbf24']
        });
        
        if (removeDrawn) {
          const remaining = names.filter(n => !winners.includes(n));
          setRawNames(remaining.join('\n'));
        }
      } else {
        // Teams logic: distribute evenly
        const teams: string[][] = Array.from({ length: teamCount }, () => []);
        shuffled.forEach((name: string, i: number) => {
          teams[i % teamCount].push(name);
        });
        setResults({ type: 'teams', teams });
        
        // Confetti for teams
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.5 },
          zIndex: 100
        });

        if (removeDrawn) {
          // All names are distributed, so the remaining is empty
          setRawNames('');
        }
      }
    }, 2000);
  };

  const currentNamesCount = getValidNames().length;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white font-sans selection:bg-rose-500 transition-colors duration-300">
      {/* Background Orbs for aesthetic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Header / Config Column (Left) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-8">
          <div className="glass rounded-3xl p-6 flex flex-col gap-6 h-full">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 vibrant-gradient rounded-xl flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(244,63,94,0.3)]">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sortear<span className="text-rose-500">.io</span></h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Aleatório & Vibrante</p>
                </div>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shadow-sm"
                title="Alternar Tema"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl flex relative w-full overflow-hidden">
               {/* Tab Background */}
               <motion.div 
                 layoutId="activeTab"
                 className="absolute top-1 bottom-1 left-1 bg-black/[0.05] dark:bg-white/[0.08] border border-black/5 dark:border-white/10 shadow-sm rounded-xl"
                 initial={false}
                 animate={{ 
                   width: 'calc(50% - 4px)',
                   x: mode === 'single' ? 0 : '100%',
                 }}
                 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
               />

            <button
              onClick={() => setMode('single')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${mode === 'single' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <Trophy className="w-4 h-4" />
              Sorteio Único
            </button>
            <button
              onClick={() => setMode('teams')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${mode === 'teams' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <Users className="w-4 h-4" />
              Gerar Equipes
            </button>
          </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label htmlFor="names" className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                  Lista de Participantes
                  <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                    {currentNamesCount}
                  </span>
                </label>
                <button 
                  onClick={() => setRawNames('')}
                  className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors"
                  title="Limpar lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <textarea
                id="names"
                value={rawNames}
                onChange={(e) => setRawNames(e.target.value)}
                placeholder="Cole os nomes aqui...&#10;Um nome por linha&#10;Ex:&#10;Ana&#10;Bruno&#10;Carlos"
                className="bg-white/60 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 min-h-[240px] text-slate-700 dark:text-slate-300 font-mono text-sm focus:outline-none focus:border-rose-500 transition-colors resize-y"
              />
            </div>

            {/* Configuration Settings */}
            <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
              <h3 className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Configurações do Sorteio
              </h3>

              <AnimatePresence mode="popLayout">
                {mode === 'single' ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between"
                  >
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantidade de Vencedores</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        max={Math.max(1, currentNamesCount)}
                        value={singleCount}
                        onChange={(e) => setSingleCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg w-16 px-2 py-1.5 text-center focus:outline-none focus:border-rose-500 transition-colors tabular-nums font-mono text-sm text-slate-900 dark:text-slate-200"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="flex items-center justify-between"
                  >
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número de Equipes</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="2" 
                        max={Math.max(2, currentNamesCount)}
                        value={teamCount}
                        onChange={(e) => setTeamCount(Math.max(2, parseInt(e.target.value) || 2))}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg w-16 px-2 py-1.5 text-center focus:outline-none focus:border-rose-500 transition-colors tabular-nums font-mono text-sm text-slate-900 dark:text-slate-200"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Sem Repetição</span>
                  <span className="text-xs text-slate-500 mt-1">Remove da lista ao sortear</span>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={removeDrawn}
                    onChange={(e) => setRemoveDrawn(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-400 after:border-slate-300 dark:after:border-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 after:peer-checked:bg-white after:peer-checked:border-white"></div>
                </div>
              </label>
            </div>

            <button
              onClick={handleDraw}
              disabled={isShuffling || currentNamesCount === 0}
              className={`w-full py-4 mt-2 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-transform duration-300 uppercase tracking-tight
                ${currentNamesCount === 0 
                  ? 'bg-white/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none border border-slate-200 dark:border-slate-800' 
                  : isShuffling
                    ? 'vibrant-gradient text-white cursor-wait opacity-80'
                    : 'vibrant-gradient hover:scale-[1.02] active:scale-95 text-white shadow-[0_10px_30px_-10px_rgba(35,38,245,0.3)]'
                }
              `}
            >
            {isShuffling ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Sorteando...
              </>
            ) : (
              <>
                {mode === 'single' ? <Trophy className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                {mode === 'single' ? 'Sortear Agora' : 'Formar Equipes'}
              </>
            )}
          </button>
          </div>
        </div>

        {/* Results / Status Column (Right) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[400px] w-full rounded-3xl relative">
          
          <AnimatePresence mode="wait">
            {!isShuffling && !results ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center p-8 max-w-sm"
              >
                <div className="w-20 h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200/50 dark:border-slate-700/50 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                  <Shuffle className="w-10 h-10 text-slate-400 dark:text-slate-500 -rotate-12" />
                </div>
                <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2 tracking-tight">Pronto para a mágica</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Adicione nomes na lista e inicie o sorteio para ver os resultados aqui.</p>
              </motion.div>
            ) : isShuffling ? (
              <motion.div
                key="shuffling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center justify-center h-full gap-8"
              >
                <h3 className="text-sm font-black tracking-[0.4em] uppercase text-rose-500 animate-pulse">
                  Gerando Entropia...
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {shufflePreview.map((name, i) => (
                    <motion.div
                      key={i + name}
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: -20 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                      className="px-6 py-3 glass rounded-2xl text-xl font-black tracking-tight text-slate-900 dark:text-white shadow-2xl"
                    >
                      {name}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : results?.type === 'single' ? (
              <motion.div
                key="results-single"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full h-full flex flex-col gap-6"
              >
                <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Resultado Gerado</h2>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs font-bold border border-rose-500/30 uppercase tracking-wider">Aleatório</div>
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30 uppercase tracking-wider">Fisher-Yates</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                  {results.winners?.map((winner, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                      className={`glass rounded-3xl p-6 flex flex-col gap-4 text-center justify-center 
                        ${index === 0 && results.winners?.length > 1 ? 'card-neon-pink' : 'card-neon-cyan'}
                      `}
                    >
                       <span className="font-black text-slate-500 uppercase text-xs tracking-widest">
                          {index === 0 && results.winners?.length > 1 ? '1º Sorteado' : `Sorteado ${index + 1}`}
                        </span>
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                          {winner}
                        </span>
                    </motion.div>
                  ))}
                </div>

                <div className="glass rounded-2xl p-4 flex justify-between items-center mt-auto">
                  <p className="text-slate-600 dark:text-slate-400 text-sm italic">"Sorteio realizado com 100% de entropia local."</p>
                  <button onClick={handleDraw} className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Sortear Novamente</button>
                </div>
              </motion.div>
            ) : results?.type === 'teams' ? (
              <motion.div
                key="results-teams"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full flex flex-col gap-6"
              >
                <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Equipes Geradas</h2>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs font-bold border border-rose-500/30 uppercase tracking-wider">Aleatório</div>
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30 uppercase tracking-wider">Fisher-Yates</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 items-start">
                  {results.teams?.map((team, tIndex) => {
                    const cardClasses = [
                      'card-neon-pink text-rose-400',
                      'card-neon-cyan text-cyan-400',
                      'card-neon-lime text-lime-400',
                      'card-neon-amber text-amber-500',
                      'card-neon-purple text-purple-400',
                      'card-neon-rose text-rose-500'
                    ];
                    const cardClass = cardClasses[tIndex % cardClasses.length];

                    return (
                      <motion.div
                        key={tIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: tIndex * 0.1 }}
                        className={`glass rounded-3xl p-6 flex flex-col gap-4 ${cardClass.split(' ')[0]}`}
                      >
                       <div className="flex justify-between items-center">
                          <span className={`font-black uppercase text-xs tracking-widest ${cardClass.split(' ')[1]}`}>Equipe {tIndex + 1}</span>
                          <span className="text-slate-500 font-mono text-xs">{team.length} pax</span>
                        </div>
                        <ul className="space-y-3">
                          {team.map((member, mIndex) => (
                            <li key={mIndex} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 font-medium text-slate-800 dark:text-white shadow-sm flex items-center justify-between">
                              {member}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="glass rounded-2xl p-4 flex justify-between items-center mt-auto">
                  <p className="text-slate-600 dark:text-slate-400 text-sm italic">"Equipes divididas com 100% de entropia local."</p>
                  <button onClick={handleDraw} className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Nova Divisão</button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
