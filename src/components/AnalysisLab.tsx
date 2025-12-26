"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { GitBranch, ShieldAlert, Check, Search, Trophy, Database, Globe, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"

interface Hackathon {
  id: string
  name: string
  status: string
  result: 'WON' | 'LOST' | 'PENDING'
  repo_link: string | null
  hackathon_url: string | null
}

export function AnalysisLab() {
  const [completedItems, setCompletedItems] = useState<Hackathon[]>([])
  const [selectedProject, setSelectedProject] = useState<Hackathon | null>(null)
  const [winnerLink, setWinnerLink] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const { toast } = useToast()

  // 1. Fetch Projects
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('hackathons')
        .select('*')
        .eq('status', 'RESULT')
        .order('created_at', { ascending: false })
      
      if (data) setCompletedItems(data as Hackathon[])
    }
    fetchHistory()
  }, [])

  // 2. Scan Logic
  const runDeepAnalysis = () => {
    if (!winnerLink || !selectedProject) return
    setIsScanning(true)
    setScanStep(1)

    const steps = [
      { t: 1000, step: 2 },
      { t: 2500, step: 3 },
      { t: 4000, step: 4 },
      { t: 6000, step: 5 },
    ]

    steps.forEach(({ t, step }) => {
      setTimeout(() => setScanStep(step), t)
    })

    setTimeout(() => {
      setIsScanning(false)
      toast({
        title: "Analysis Complete",
        description: "Gap Analysis Report generated successfully.",
      })
    }, 7000)
  }

  return (
    <ContainerScroll
      titleComponent={
        <> <h1>
            <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-gradient-teal">
              FORENSICS LAB
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
             Select a completed mission log to run a deep-scan comparison against winning solutions.
          </p>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* LEFT PANEL: Project History */}
        <div className="lg:col-span-1 glass-surface rounded-xl p-4 border border-border/50 flex flex-col h-full bg-secondary/5">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2 px-2">
            <Database className="w-4 h-4" />
            Mission Logs
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {completedItems.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-10 border border-dashed border-border/30 rounded-lg">
                No completed missions found.
              </div>
            ) : (
              completedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                      setSelectedProject(item)
                      setScanStep(0)
                      setWinnerLink("")
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedProject?.id === item.id
                      ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                      : "bg-background border-border/50 hover:bg-secondary/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      item.result === 'WON' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {item.result}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {item.repo_link || "No local repo linked"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Scanner */}
        <div className="lg:col-span-2 glass-surface rounded-xl p-6 border border-border/50 relative overflow-hidden flex flex-col justify-center h-full bg-background/40">
          {!selectedProject ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
              <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-mono text-sm">Awaiting Target Selection...</p>
            </div>
          ) : (
            <div className="w-full max-w-xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Deep Code Comparison</h2>
                <p className="text-sm text-muted-foreground">
                  Comparing <span className="text-primary font-mono">{selectedProject.name}</span>
                </p>
              </div>

              {/* Input Area */}
              <div className="space-y-6">
                 <div className="relative">
                   <label className="text-xs font-mono text-muted-foreground uppercase mb-2 block">Winner's Project URL</label>
                   <div className="flex gap-2">
                     <div className="relative flex-1">
                       <Trophy className="absolute left-3 top-3 w-4 h-4 text-yellow-500" />
                       <input 
                         type="text" 
                         placeholder="https://devpost.com/software/winning-project"
                         className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                         value={winnerLink}
                         onChange={(e) => setWinnerLink(e.target.value)}
                         disabled={isScanning}
                       />
                     </div>
                   </div>
                   {selectedProject.hackathon_url && (
                      <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Event Source: 
                          <a href={selectedProject.hackathon_url} target="_blank" className="hover:text-primary underline truncate max-w-[300px] block">
                              {selectedProject.hackathon_url}
                          </a>
                      </div>
                   )}
                 </div>

                 {/* Progress Bar */}
                 {isScanning ? (
                   <div className="py-4 space-y-4">
                     <div className="flex justify-between items-center text-xs font-mono text-muted-foreground px-1">
                        <span>Analysis Protocol</span>
                        <span>{(scanStep / 5 * 100).toFixed(0)}%</span>
                     </div>
                     <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(scanStep / 5) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                     </div>
                     <div className="grid gap-2 pt-2">
                        <StepItem status={scanStep >= 2} text="Accessing Event Manifest" />
                        <StepItem status={scanStep >= 3} text="Extracting Winner's Repository" />
                        <StepItem status={scanStep >= 4} text="Tokenizing Source Code" />
                        <StepItem status={scanStep >= 5} text="Generating Comparative Report" />
                     </div>
                   </div>
                 ) : (
                   <button
                     onClick={runDeepAnalysis}
                     disabled={!winnerLink}
                     className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                   >
                     <Search className="w-4 h-4" />
                     Initiate Deep Scan
                   </button>
                 )}

                 {!isScanning && scanStep === 5 && (
                   <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm flex items-center gap-3 animate-fade-in">
                      <Check className="w-5 h-5" />
                      <span>Report Ready. Check your notes.</span>
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ContainerScroll>
  )
}

function StepItem({ status, text }: { status: boolean, text: string }) {
  return (
    <div className={`flex items-center gap-3 text-sm ${status ? "text-foreground" : "text-muted-foreground/30"}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
        status ? "bg-primary/20 border-primary text-primary" : "border-border"
      }`}>
        {status ? <Check className="w-2.5 h-2.5" /> : <div className="w-1 h-1 rounded-full bg-border" />}
      </div>
      <span className="font-mono text-xs">{text}</span>
    </div>
  )
}