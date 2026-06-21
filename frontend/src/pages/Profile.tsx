import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Calendar, Clock, RotateCcw, Download, CheckCircle2, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Profile() {
  const [activeTab, setActiveTab] = useState("library")

  const uploadedPapers = [
    { id: 1, title: "AFCAT 2025 Paper", questions: 30, score: "24/30", date: "Oct 12, 2026", time: "45m" },
    { id: 2, title: "MBA Entrance Paper", questions: 50, score: "42/50", date: "Sep 28, 2026", time: "60m" },
    { id: 3, title: "SSC CGL Paper", questions: 100, score: "88/100", date: "Sep 15, 2026", time: "120m" },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 border border-border/50">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1">
          <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
             <User className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold mb-2">John Doe</h1>
          <p className="text-muted-foreground mb-4">john.doe@example.com - Joined Aug 2026</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="px-4 py-2 bg-secondary/10 text-secondary rounded-xl font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 12 Tests Completed
            </div>
            <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 85% Avg Accuracy
            </div>
          </div>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/50">
        {["library", "scheduled", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-medium capitalize relative transition-colors ${
              activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "library" ? "Test Library" : tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="profile-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "library" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Uploaded Papers</h2>
                <Button variant="outline" size="sm">Sort by Recent</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedPapers.map((paper) => (
                  <motion.div 
                    key={paper.id}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 rounded-2xl border border-border/50 group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <File className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {paper.date}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {paper.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4"/> {paper.questions} Qs</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {paper.time}</span>
                    </div>

                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last Score: </span>
                        <span className="font-semibold text-foreground">{paper.score}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" title="Download Results">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="gap-2" title="Retake Test">
                          <RotateCcw className="w-4 h-4" /> Retake
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "scheduled" && (
            <div className="text-center py-20 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No scheduled tests found.</p>
            </div>
          )}

          {activeTab === "history" && (
            <div className="text-center py-20 text-muted-foreground">
               <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Take a test to see your history.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function File(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
