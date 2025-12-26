import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Optional if using magic link
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Using Email/Password for simplicity. 
    // Ensure you enabled "Email Provider" in Supabase Auth Settings.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Access Denied",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Identity Verified",
        description: "Welcome back, Commander.",
      });
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm glass-surface p-8 rounded-2xl border border-border/50 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">System Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Authenticate to establish uplink.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="admin@hackos.dev"
              className="w-full px-4 py-2 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-4 py-2 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;