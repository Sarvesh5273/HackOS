"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Lock, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  openLoginModal: () => void
  user: any
}

const AuthContext = createContext<AuthContextType>({
  openLoginModal: () => {},
  user: null,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Monitor Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setIsOpen(false) // Close modal on success
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Access Denied",
        description: "Invalid credentials.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Identity Verified",
        description: "System unlocked.",
      })
    }
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ openLoginModal: () => setIsOpen(true), user }}>
      {children}
      
      {/* THE GLOBAL LOGIN POPUP */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm bg-card/90 backdrop-blur-xl border-border/50">
          <DialogHeader>
             <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                    <Lock className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                    <DialogTitle className="text-xl font-bold">System Locked</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Authorization required to modify pipeline data.
                    </p>
                </div>
             </div>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="admin@hackos.dev"
                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Authenticate
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  )
}