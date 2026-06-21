import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Mail, Lock } from "lucide-react"
import { apiRequest } from "@/lib/api"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      const response = await apiRequest<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      })
      localStorage.setItem("neri_token", response.token)
      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      {/* Left Column - Form */}
      <div className="flex-1 flex items-center justify-center p-8 z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight">NERI</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your personalized learning path.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="Email address"
                    className="pl-10 h-11 bg-card/50" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    className="pl-10 h-11 bg-card/50" 
                    required 
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </motion.div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one now
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Premium Graphic */}
      <div className="hidden lg:flex flex-1 relative bg-card items-center justify-center overflow-hidden">
        {/* Floating gradient orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-70 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] opacity-70" style={{ animationDelay: "1s", animationDuration: "4s" }} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-md text-center space-y-6"
        >
          <div className="glass-card p-8 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
            <h2 className="text-2xl font-bold">Your Ultimate Prep Companion</h2>
            <p className="text-muted-foreground leading-relaxed">
              Experience the next generation of AI-driven mock tests. NERI analyzes your weak points and crafts the perfect questions to help you succeed.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm">
                <div className="text-primary font-bold text-xl">10x</div>
                <div className="text-xs text-muted-foreground mt-1">Faster Learning</div>
              </div>
              <div className="p-4 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm">
                <div className="text-accent font-bold text-xl">AI</div>
                <div className="text-xs text-muted-foreground mt-1">Powered Tests</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
