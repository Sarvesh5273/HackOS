"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { 
  Loader2, ArrowRight, CheckCircle2, AlertTriangle, Hammer, 
  BrainCircuit, Send, XCircle, Github, Globe, Lock, Flame, Sparkles, DollarSign,
  Video, Snowflake, Trash2, Inbox, Tag
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // ✅ Added Tooltip
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthModalContext"

// --- INTERFACES ---
interface Hackathon {
  id: string
  name: string
  description: string | null
  prize_amount: number
  status: 'DISCOVERED' | 'IDEA' | 'BUILD' | 'PITCH' | 'SUBMITTED' | 'RESULT'
  result: 'PENDING' | 'WON' | 'LOST'
  win_score: number
  ev_score?: number
  flag_label?: string
  platform: string
  repo_link: string | null
  demo_link: string | null
  hackathon_url: string | null
  
  // Senior Dev Fields
  deadline?: string 
  tags?: string[]
  breakdown?: string[] // ✅ Added breakdown field
  mvp_frozen?: boolean
  mvp_features?: string
  failure_reason?: 'SCOPE_CREEP' | 'PITCH_FAILURE' | 'TECH_DEBT' | 'BURNOUT' | 'KNOWLEDGE_GAP' | null
}

const STAGES = {
  DISCOVERED: { label: "Inbox", icon: Inbox, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  IDEA: { label: "Ideation", icon: BrainCircuit, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  BUILD: { label: "Construction", icon: Hammer, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  PITCH: { label: "Pitching", icon: Video, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  SUBMITTED: { label: "Submitted", icon: Send, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  RESULT: { label: "Outcome", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" }
}

const FAILURE_REASONS = [
  { id: 'SCOPE_CREEP', label: '⚠️ Scope Creep (Tried to build too much)' },
  { id: 'PITCH_FAILURE', label: '🎤 Pitch Failed (Code good, video bad)' },
  { id: 'TECH_DEBT', label: '🐛 Technical Debt (Too many bugs)' },
  { id: 'BURNOUT', label: '💤 Endurance (Burned out/Slept)' },
  { id: 'KNOWLEDGE_GAP', label: '🧠 Knowledge Gap (Skill issue)' },
]

export function PipelineBoard() {
  const [items, setItems] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- MODAL STATES ---
  const [submissionItem, setSubmissionItem] = useState<Hackathon | null>(null)
  const [repoLink, setRepoLink] = useState("")
  const [demoLink, setDemoLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Guardrail 1: Scope Freeze
  const [scopeItem, setScopeItem] = useState<Hackathon | null>(null)
  const [mvpFeatures, setMvpFeatures] = useState("")

  // Guardrail 2: Code Freeze
  const [codeFreezeItem, setCodeFreezeItem] = useState<Hackathon | null>(null)

  // Guardrail 3: Retro
  const [retroItem, setRetroItem] = useState<Hackathon | null>(null)
  const [failureReason, setFailureReason] = useState<string>("")
  const [isSavingRetro, setIsSavingRetro] = useState(false)

  // Guardrail 4: Deletion
  const [deleteItem, setDeleteItem] = useState<Hackathon | null>(null)

  const { toast } = useToast()
  const { openLoginModal, user } = useAuth()

  useEffect(() => {
    fetchPipeline()
    const channel = supabase.channel('pipeline_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hackathons' }, () => fetchPipeline())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchPipeline() {
    const { data } = await supabase
      .from('hackathons')
      .select('*')
      .order('ev_score', { ascending: false })
      .order('win_score', { ascending: false })
    
    if (data) setItems(data as Hackathon[])
    setLoading(false)
  }

  // --- STYLING LOGIC ---
  const getPriorityStyles = (label?: string) => {
    switch (label) {
      case "🔥 MUST APPLY": 
        return "border-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.15)] bg-gradient-to-b from-orange-500/5 to-transparent"
      case "✅ GOOD MATCH": 
        return "border-emerald-500/50 bg-emerald-500/5"
      case "💤 BACKLOG": 
        return "opacity-60 border-border/30 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
      default: 
        return "border-border/50 hover:border-primary/30"
    }
  }

  const getSmartFlags = (item: Hackathon) => {
    const flags = []
    
    if (item.deadline) {
      const daysLeft = Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 2 && daysLeft >= 0) flags.push({ icon: Flame, color: "text-red-500", bg: "bg-red-500/10", label: "Closing Soon" })
    }

    if (item.prize_amount > 10000) flags.push({ icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10", label: "High Stakes" })
    
    const trendKeywords = ['ai', 'agent', 'solana', 'web3', 'llm', 'rag', 'deepseek']
    if (item.description && trendKeywords.some(k => item.description?.toLowerCase().includes(k))) {
      flags.push({ icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", label: "Trending" })
    }
    return flags
  }

  // --- WORKFLOW LOGIC ---
  const handleAdvanceClick = (item: Hackathon) => {
    if (!user) { openLoginModal(); return }

    if (item.status === 'DISCOVERED') {
      advanceStage(item)
      return
    }

    if (item.status === 'IDEA') {
      if (!item.mvp_frozen) {
        setScopeItem(item)
        return
      }
    }

    if (item.status === 'BUILD') {
        setCodeFreezeItem(item)
        return
    }

    if (item.status === 'PITCH') {
        setRepoLink(item.repo_link || "")
        setDemoLink(item.demo_link || "")
        setSubmissionItem(item)
    } else {
        advanceStage(item)
    }
  }

  // --- DELETION LOGIC ---
  const confirmDelete = async () => {
    if (!deleteItem || !user) return

    setItems(prev => prev.filter(i => i.id !== deleteItem.id))
    setDeleteItem(null)

    const { error } = await supabase
        .from('hackathons')
        .delete()
        .eq('id', deleteItem.id)

    if (error) {
        toast({ title: "Error", description: "Could not delete from database.", variant: "destructive" })
        fetchPipeline() 
    } else {
        toast({ title: "Trashed", description: "Hackathon removed from database." })
    }
  }

  // ... (Keep confirmCodeFreeze, freezeScopeAndAdvance, confirmSubmission, markOutcome, confirmLoss exactly as they were) ...
  const confirmCodeFreeze = async () => { /* ... existing logic ... */ 
    if (!codeFreezeItem || !user) return
    const updatedItem = { ...codeFreezeItem, status: 'PITCH' as const }
    setItems(prev => prev.map(i => i.id === codeFreezeItem.id ? updatedItem : i))
    setCodeFreezeItem(null)
    const { error } = await supabase.from('hackathons').update({ status: 'PITCH' }).eq('id', codeFreezeItem.id)
    if (error) { toast({ title: "Error", description: "Failed to update status.", variant: "destructive" }); fetchPipeline() } 
    else { toast({ title: "Code Frozen ❄️", description: "Stop coding! Focus on the video and pitch." }) }
  }

  const freezeScopeAndAdvance = async () => { /* ... existing logic ... */ 
    if (!scopeItem || !user) return
    const updatedItem = { ...scopeItem, status: 'BUILD' as const, mvp_frozen: true, mvp_features: mvpFeatures }
    setItems(prev => prev.map(i => i.id === scopeItem.id ? updatedItem : i))
    setScopeItem(null)
    const { error } = await supabase.from('hackathons').update({ status: 'BUILD', mvp_frozen: true, mvp_features: mvpFeatures }).eq('id', scopeItem.id)
    if (error) { toast({ title: "Error", description: "Failed to freeze scope.", variant: "destructive" }); fetchPipeline() }
  }

  const advanceStage = async (item: Hackathon) => { /* ... existing logic ... */ 
    let nextStatus: Hackathon['status'] | null = null
    if (item.status === 'DISCOVERED') nextStatus = 'IDEA'
    else if (item.status === 'IDEA') nextStatus = 'BUILD'
    else if (item.status === 'BUILD') nextStatus = 'PITCH'
    else if (item.status === 'PITCH') nextStatus = 'SUBMITTED'
    else if (item.status === 'SUBMITTED') nextStatus = 'RESULT'
    if (nextStatus) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: nextStatus! } : i))
      await supabase.from('hackathons').update({ status: nextStatus }).eq('id', item.id)
    }
  }

  const confirmSubmission = async () => { /* ... existing logic ... */ 
    if (!submissionItem || !user) return
    setIsSubmitting(true)
    try {
        const { error } = await supabase.from('hackathons').update({ repo_link: repoLink, demo_link: demoLink, status: 'SUBMITTED' }).eq('id', submissionItem.id)
        if (error) throw error
        setItems(prev => prev.map(i => i.id === submissionItem.id ? { ...i, status: 'SUBMITTED', repo_link: repoLink, demo_link: demoLink } : i))
        toast({ title: "Deployed", description: "Project submitted! Good luck." })
        setSubmissionItem(null)
    } catch (error) { toast({ title: "Error", description: "Failed to submit.", variant: "destructive" }) } 
    finally { setIsSubmitting(false) }
  }

  const markOutcome = async (item: Hackathon, result: 'WON' | 'LOST') => { /* ... existing logic ... */ 
    if (!user) { openLoginModal(); return }
    if (result === 'WON') {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, result } : i))
      await supabase.from('hackathons').update({ result }).eq('id', item.id)
      toast({ title: "Victory Logged!", description: "Great job." })
    } else { setRetroItem(item); setFailureReason("") }
  }

  const confirmLoss = async () => { /* ... existing logic ... */ 
    if (!retroItem || !failureReason) return
    setIsSavingRetro(true)
    const { error } = await supabase.from('hackathons').update({ result: 'LOST', status: 'RESULT', failure_reason: failureReason }).eq('id', retroItem.id)
    if (!error) {
      setItems(prev => prev.map(i => i.id === retroItem.id ? { ...i, result: 'LOST', status: 'RESULT' } : i))
      toast({ title: "Outcome Logged", description: "Failure data saved." }); setRetroItem(null)
    }
    setIsSavingRetro(false)
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

  if (items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/30 rounded-xl bg-secondary/5">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Pipeline Empty</h3>
            <p className="text-muted-foreground text-sm">Move a target from "Discovered" to "Idea" to begin.</p>
        </div>
    )
  }

  const columns = {
    DISCOVERED: items.filter(i => i.status === 'DISCOVERED' || !i.status),
    IDEA: items.filter(i => i.status === 'IDEA'),
    BUILD: items.filter(i => i.status === 'BUILD'),
    PITCH: items.filter(i => i.status === 'PITCH'),
    SUBMITTED: items.filter(i => i.status === 'SUBMITTED'),
    RESULT: items.filter(i => i.status === 'RESULT'),
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 h-[65vh]">
        {(Object.keys(STAGES) as Array<keyof typeof STAGES>).map((stageKey) => {
          const config = STAGES[stageKey]
          const columnItems = columns[stageKey]

          return (
            <div key={stageKey} className="flex flex-col h-full bg-secondary/5 rounded-xl border border-border/30 overflow-hidden shadow-inner">
              <div className={`p-3 border-b border-border/30 flex items-center justify-between ${config.bg} backdrop-blur-sm`}>
                <div className="flex items-center gap-2">
                  <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                  <span className={`font-mono text-xs font-semibold tracking-wider ${config.color}`}>{config.label}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">
                  {columnItems.length}
                </span>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {columnItems.map((item) => {
                    const flags = getSmartFlags(item);
                    return (
                      <motion.div
                        key={item.id}
                        layoutId={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`group bg-card border p-3 rounded-lg shadow-sm transition-all hover:shadow-md relative ${getPriorityStyles(item.flag_label)}`}
                      >
                        {item.flag_label === "🔥 MUST APPLY" && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-lg z-10 animate-pulse border border-orange-400">
                            MUST APPLY
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1 py-0.5 rounded border border-border/50 truncate max-w-[80px]">
                                {item.platform || "Custom"}
                            </span>
                            
                            {/* 🛠️ AI SCORE TOOLTIP: Hover to see WHY the score is high/low */}
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger>
                                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 cursor-help hover:underline decoration-dashed decoration-primary/50">
                                      {(item.ev_score ?? item.win_score ?? 0).toFixed(1)} <span className="text-[8px] text-muted-foreground font-normal">EV</span>
                                  </span>
                                </TooltipTrigger>
                                {item.breakdown && item.breakdown.length > 0 && (
                                  <TooltipContent className="bg-popover border-border text-popover-foreground text-xs p-3 max-w-[200px] shadow-xl">
                                    <p className="font-semibold mb-1 border-b border-border/50 pb-1">Analysis Breakdown</p>
                                    <ul className="list-disc pl-3 space-y-0.5">
                                      {item.breakdown.map((point, idx) => (
                                        <li key={idx} className="opacity-90">{point}</li>
                                      ))}
                                    </ul>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                        </div>
                        
                        <h4 className="font-medium text-sm text-foreground mb-1 leading-tight">{item.name}</h4>
                        
                        {/* 🧠 AI TAGS DISPLAY */}
                        {item.tags && item.tags.length > 0 && (
                           <div className="flex flex-wrap gap-1 mb-2">
                              {item.tags.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                                  <Tag size={8} /> {tag}
                                </span>
                              ))}
                           </div>
                        )}

                        {flags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {flags.map((flag, i) => (
                              <span key={i} className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border ${flag.color} ${flag.bg} border-transparent`}>
                                <flag.icon size={10} /> {flag.label}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/30 mt-2">
                            <span className="text-[9px] font-mono text-muted-foreground">
                                ${(item.prize_amount/1000).toFixed(0)}k
                            </span>
                            
                            {stageKey === 'DISCOVERED' ? (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => setDeleteItem(item)}
                                        className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded transition-colors"
                                        title="Not Interested (Delete)"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button 
                                        onClick={() => handleAdvanceClick(item)}
                                        className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20"
                                    >
                                        Accept <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                stageKey !== 'RESULT' && (
                                    <button 
                                        onClick={() => handleAdvanceClick(item)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20"
                                    >
                                        {stageKey === 'IDEA' && !item.mvp_frozen && <Lock className="w-3 h-3" />}
                                        {stageKey === 'BUILD' ? "Finish Code" : stageKey === 'PITCH' ? "Submit" : "Next"} <ArrowRight className="w-3 h-3" />
                                    </button>
                                )
                            )}

                            {stageKey === 'RESULT' && item.result === 'PENDING' && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => markOutcome(item, 'WON')} className="p-1 hover:text-green-500 transition-colors"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => markOutcome(item, 'LOST')} className="p-1 hover:text-red-500 transition-colors"><XCircle className="w-3.5 h-3.5" /></button>
                                </div>
                            )}
                            
                            {stageKey === 'RESULT' && item.result !== 'PENDING' && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                    item.result === 'WON' 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                    {item.result}
                                </span>
                            )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>

      {/* --- NEW: DELETE CONFIRMATION DIALOG --- */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="max-w-xs bg-card border-red-500/20">
            <DialogHeader>
                <DialogTitle className="text-red-500 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Hackathon?
                </DialogTitle>
                <DialogDescription>
                    This will remove <strong>{deleteItem?.name}</strong> from your database permanently.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <button onClick={() => setDeleteItem(null)} className="px-3 py-2 text-xs hover:underline">Cancel</button>
                <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-bold">
                    Yes, Delete
                </button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ... (Kept existing modals: Scope, CodeFreeze, Submission, Retro - no changes needed there) ... */}
      <Dialog open={!!scopeItem} onOpenChange={(open) => !open && setScopeItem(null)}>
        <DialogContent className="max-w-md bg-card border-amber-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-amber-500">
                <Lock className="w-5 h-5" />
                Scope Freeze Protocol
            </DialogTitle>
            <DialogDescription>
                Stop! You cannot build yet. List your absolute "Must Haves" for MVP.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea 
              className="w-full h-24 p-3 bg-background border border-border rounded-md text-sm font-mono focus:ring-1 focus:ring-amber-500 outline-none"
              placeholder="- User can login&#10;- User can upload file"
              value={mvpFeatures}
              onChange={(e) => setMvpFeatures(e.target.value)}
            />
          </div>
          <DialogFooter>
            <button onClick={() => setScopeItem(null)} className="px-4 py-2 rounded-lg hover:bg-secondary text-sm">Cancel</button>
            <button 
                onClick={freezeScopeAndAdvance}
                disabled={!mvpFeatures.length}
                className="px-6 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-sm font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
                Freeze & Build
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!codeFreezeItem} onOpenChange={(open) => !open && setCodeFreezeItem(null)}>
        <DialogContent className="max-w-md bg-card border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-blue-500">
                <Snowflake className="w-5 h-5" />
                Code Freeze Protocol
            </DialogTitle>
            <DialogDescription>
                <strong>Warning:</strong> Moving to Pitching means you stop coding completely.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
             <p className="mb-2">Ensure the following:</p>
             <ul className="list-disc pl-5 space-y-1">
               <li>The repository is committed and pushed.</li>
               <li>The app is deployed and live.</li>
               <li>You are ready to start Video Editing & README writing.</li>
             </ul>
          </div>
          <DialogFooter>
            <button onClick={() => setCodeFreezeItem(null)} className="px-4 py-2 rounded-lg hover:bg-secondary text-sm">Wait</button>
            <button 
                onClick={confirmCodeFreeze}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold shadow-lg shadow-blue-500/20"
            >
                I Commit to Stop Coding
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!retroItem} onOpenChange={(open) => !open && setRetroItem(null)}>
        <DialogContent className="max-w-md bg-card border-red-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Mission Failed
            </DialogTitle>
            <DialogDescription>
                Why did we fail? Be honest—this feeds the AI.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-mono text-muted-foreground uppercase">Root Cause</label>
            <div className="grid gap-2">
              {FAILURE_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setFailureReason(reason.id)}
                  className={`w-full text-left px-3 py-3 rounded-md text-sm transition-all border ${
                    failureReason === reason.id 
                    ? "bg-red-500/10 border-red-500 text-red-500 font-medium" 
                    : "bg-secondary/50 border-border hover:bg-secondary"
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setRetroItem(null)} className="px-4 py-2 rounded-lg hover:bg-secondary text-sm">Cancel</button>
            <button 
                onClick={confirmLoss}
                disabled={!failureReason || isSavingRetro}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-bold shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
                Log Outcome
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!submissionItem} onOpenChange={(open) => !open && setSubmissionItem(null)}>
        <DialogContent className="max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
                <Send className="w-5 h-5 text-primary" />
                Submission Protocol
            </DialogTitle>
            <DialogDescription>
                Final check before shipping.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-2">
                    <Github className="w-3 h-3" /> Source Code
                </label>
                <input 
                    type="text" 
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-sm focus:ring-1 focus:ring-primary font-mono"
                    value={repoLink}
                    onChange={(e) => setRepoLink(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-2">
                    <Globe className="w-3 h-3" /> Live Demo / Video
                </label>
                <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-sm focus:ring-1 focus:ring-primary font-mono"
                    value={demoLink}
                    onChange={(e) => setDemoLink(e.target.value)}
                />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setSubmissionItem(null)} className="px-4 py-2 rounded-lg hover:bg-secondary text-sm">Cancel</button>
            <button 
                onClick={confirmSubmission}
                disabled={!repoLink || isSubmitting}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
            >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Deployment"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}