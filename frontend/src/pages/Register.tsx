import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Mail, Lock, User as UserIcon, Check } from "lucide-react"

export default function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")

  // Simple password strength calculation
  const strength = Math.min(
    100,
    (password.length > 7 ? 25 : 0) +
      (/[A-Z]/.test(password) ? 25 : 0) +
      (/[0-9]/.test(password) ? 25 : 0) +
      (/[^A-Za-z0-9]/.test(password) ? 25 : 0)
  )

  const strengthColor =
    strength < 50 ? "bg-destructive" : strength < 100 ? "bg-secondary" : "bg-green-500"

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      {/* Right Column - Premium Graphic (Swapped for Register) */}
      <div className="hidden lg:flex flex-1 relative bg-card items-center justify-center overflow-hidden border-r border-border/50">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] opacity-70 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-70" style={{ animationDelay: "2s", animationDuration: "5s" }} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-md text-center space-y-6"
        >
          <div className="glass-card p-8 rounded-3xl space-y-6 relative overflow-hidden text-left">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
            <h2 className="text-2xl font-bold">Start your learning journey today.</h2>
            <ul className="space-y-4 text-sm text-muted-foreground pt-4">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <Check className="w-4 h-4" />
                </div>
                Unlimited AI-generated mock tests
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <Check className="w-4 h-4" />
                </div>
                Real-time doubt clearance chat
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <Check className="w-4 h-4" />
                </div>
                Advanced performance analytics
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Left Column - Form */}
      <div className="flex-1 flex items-center justify-center p-8 z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create an account</h1>
            <p className="text-muted-foreground">
              Sign up to get started with NERI.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    className="pl-10 h-11 bg-card/50" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    className="pl-10 h-11 bg-card/50" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-11 bg-card/50" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {/* Password Strength Indicator */}
                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2"
                    >
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                        <motion.div 
                          className={`h-full ${strengthColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${strength}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {strength < 50 ? "Weak" : strength < 100 ? "Good" : "Strong"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </motion.div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign Up <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
