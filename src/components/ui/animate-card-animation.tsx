"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Loader2, Trophy, BarChart3, ArrowRight, Target, Globe, ExternalLink, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthModalContext" 

// 1. FIX: Update Interface to allow nulls (since raw data might be empty)
interface Hackathon {
  id: string
  name: string
  description: string | null
  image_url: string | null
  prize_amount: number
  // These might be null until you manually rate them or an AI agent runs
  judging_clarity: number | null
  demo_friendliness: number | null
  competition_level: number | null
  organizer_reputation: number | null
  time_flexibility: number | null
  prize_depth: number | null
  domain_fit: number | null
  win_score: number | null
  status: 'DISCOVERED' | 'IDEA' | 'BUILD' | 'SUBMITTED' | 'RESULT'
  hackathon_url: string | null
}

const positionStyles = [
  { scale: 1, y: 12 },
  { scale: 0.95, y: -16 },
  { scale: 0.9, y: -44 },
]

// 2. FIX: ScoreBar now safely handles nulls by defaulting to 0
function ScoreBar({ label, value, weight }: { label: string, value: number | null, weight: string }) {
    const safeValue = value || 0; // If null, show 0
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-foreground font-bold">
            {value ? value : "N/A"}/10 <span className="text-[10px] text-muted-foreground/60">({weight})</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${value ? 'bg-primary' : 'bg-primary/30'}`} 
            style={{ width: `${safeValue * 10}%` }}
          />
        </div>
      </div>
    )
}

function CardContent({ hackathon, onAnalyze }: { hackathon: Hackathon, onAnalyze: () => void }) {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="-outline-offset-1 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-xl outline outline-border/30 bg-black/50 relative group">
        <img
          src={hackathon.image_url || "/placeholder.svg"}
          alt={hackathon.name}
          className="h-full w-full select-none object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        />
        
        {/* Win Probability Badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <div className="px-2 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-primary/30 flex flex-col items-center min-w-[60px] shadow-xl">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Win Prob</span>
                <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-primary" />
                <span className="text-base font-bold text-primary font-mono">
                    {/* 3. FIX: Show N/A if score is 0 or null */}
                    {hackathon.win_score ? hackathon.win_score.toFixed(1) : "N/A"}
                </span>
                </div>
            </div>
        </div>

        <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/90">
          ${(hackathon.prize_amount / 1000).toFixed(0)}k Pool
        </div>
      </div>
      
      <div className="flex w-full items-center justify-between gap-2 px-3 pb-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium text-foreground text-lg">{hackathon.name}</span>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
            {/* 4. FIX: Handle nulls in mini-stats */}
            <span>Comp: {hackathon.competition_level ?? "?"}/10</span>
            <span>•</span>
            <span>Fit: {hackathon.domain_fit ?? "?"}/10</span>
          </div>
        </div>
        <button 
          onClick={onAnalyze}
          className="flex h-9 shrink-0 cursor-pointer select-none items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 text-xs font-medium text-primary transition-all hover:bg-primary/20 active:scale-[0.98]"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Analyze
        </button>
      </div>
    </div>
  )
}

function AnimatedCard({ hackathon, index, isAnimating, onAnalyze }: any) {
    const { scale, y } = positionStyles[index] ?? positionStyles[2]
    const zIndex = index === 0 && isAnimating ? 10 : 3 - index
    return (
        <motion.div
        key={hackathon.id}
        initial={index === 2 ? { y: -16, scale: 0.9 } : undefined}
        animate={{ y, scale }}
        exit={index === 0 ? { y: 340, scale: 1, zIndex: 10 } : undefined}
        transition={{ type: "spring", duration: 0.6, bounce: 0 }}
        style={{ zIndex, left: "50%", x: "-50%", bottom: 0 }}
        className="absolute flex h-[280px] w-[324px] items-center justify-center overflow-hidden rounded-t-xl border-x border-t border-border bg-card p-1 shadow-2xl will-change-transform sm:w-[512px]"
        >
        <CardContent hackathon={hackathon} onAnalyze={onAnalyze} />
        </motion.div>
    )
}

export default function AnimatedCardStack() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  
  const { toast } = useToast()
  const { openLoginModal, user } = useAuth() 

  const fetchHackathons = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .eq('status', 'DISCOVERED')
        .order('win_score', { ascending: false })
        .limit(10)
    
      if (error) throw error
      if (data) setHackathons(data as Hackathon[])
    } catch (error) {
      console.error('Error fetching targets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHackathons() }, [])

  const handleAnimate = () => {
    if (hackathons.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
        setHackathons((prev) => [...prev.slice(1), prev[0]])
        setIsAnimating(false)
    }, 200)
  }

  const handleAnalyze = (h: Hackathon) => {
    setSelectedHackathon(h)
    setIsDialogOpen(true)
  }

  const handleAddToPipeline = async () => {
    if (!selectedHackathon) return

    if (!user) {
        openLoginModal()
        return
    }

    setIsMoving(true)

    try {
      const { error } = await supabase
        .from('hackathons')
        .update({ status: 'IDEA' })
        .eq('id', selectedHackathon.id)

      if (error) throw error

      toast({
        title: "Target Acquired",
        description: `${selectedHackathon.name} locked in Pipeline.`,
      })

      setHackathons(prev => prev.filter(h => h.id !== selectedHackathon.id))
      setIsDialogOpen(false)
      
    } catch (error) {
      toast({ title: "Error", description: "Failed to update target.", variant: "destructive" })
    } finally {
      setIsMoving(false)
    }
  }

  if (loading) return <div className="h-[380px] flex items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (hackathons.length === 0) return <div className="h-[380px] flex items-center justify-center text-muted-foreground">No targets detected.</div>

  return (
    <div className="flex w-full flex-col items-center justify-center pt-2">
      <div className="relative h-[380px] w-full overflow-hidden sm:w-[644px]">
        <AnimatePresence initial={false} mode="sync">
          {hackathons.slice(0, 3).map((hackathon, index) => (
            <AnimatedCard 
                key={`${hackathon.id}-${index}`}
                hackathon={hackathon} 
                index={index} 
                isAnimating={isAnimating}
                onAnalyze={() => handleAnalyze(hackathon)}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 -mt-px flex w-full items-center justify-center border-t border-border py-4">
        <button onClick={handleAnimate} disabled={isAnimating || hackathons.length <= 1} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-6 font-mono text-sm font-medium hover:bg-secondary/80">
          <span>Cycle Targets</span>
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/50 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Target Analysis</span>
                    <DialogTitle className="text-xl font-bold">{selectedHackathon?.name}</DialogTitle>
                </div>
            </div>
          </DialogHeader>

          {selectedHackathon && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border border-border/50">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Win Probability</h4>
                    
                    {/* 5. FIX: Check if we have real data. If win_score is 0/null, show a warning instead of fake bars. */}
                    {!selectedHackathon.win_score ? (
                        <div className="p-3 rounded border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>AI Analysis pending. Data is raw.</span>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-2">
                            {/* Pass safe defaults (|| 5) so bars aren't empty */}
                            <ScoreBar label="Judging Clarity" value={selectedHackathon.judging_clarity} weight="2.5x" />
                            <ScoreBar label="Demo Friendliness" value={selectedHackathon.demo_friendliness} weight="2.0x" />
                            <ScoreBar label="Low Competition" value={selectedHackathon.competition_level ? 11 - selectedHackathon.competition_level : null} weight="2.0x" />
                            <ScoreBar label="Domain Fit" value={selectedHackathon.domain_fit} weight="1.5x" />
                        </div>
                    )}
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Mission Brief</h4>
                        <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                             <p className="text-sm text-muted-foreground">{selectedHackathon.description || "No description provided."}</p>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-background border border-border/50 space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Source Uplink
                        </label>
                        
                        {selectedHackathon.hackathon_url ? (
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-primary truncate flex-1 font-mono">
                                    {selectedHackathon.hackathon_url}
                                </span>
                                <a 
                                    href={selectedHackathon.hackathon_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                                >
                                    Register <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        ) : (
                            <div className="text-xs text-muted-foreground italic">
                                No uplink coordinates found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}

          <DialogFooter>
            <button onClick={() => setIsDialogOpen(false)} className="px-4 py-2 rounded-lg hover:bg-secondary text-sm">Cancel</button>
            <button onClick={handleAddToPipeline} disabled={isMoving} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold shadow-lg shadow-primary/20">
                {isMoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Initialize Operation
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}