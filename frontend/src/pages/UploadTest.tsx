import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { UploadCloud, File, Settings, CheckCircle2, Play, Calendar, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UploadTest() {
  const [file, setFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStep, setProcessStep] = useState(0)
  const [testReady, setTestReady] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const keyInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const simulateProcessing = () => {
    setIsProcessing(true)
    const steps = 5
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      setProcessStep(currentStep)
      if (currentStep >= steps) {
        clearInterval(interval)
        setIsProcessing(false)
        setTestReady(true)
      }
    }, 1500)
  }

  const processingSteps = [
    "Reading File...",
    "Extracting Questions...",
    "Detecting Options...",
    "Generating Explanations...",
    "Creating Test Environment...",
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Test</h1>
        <p className="text-muted-foreground">
          Convert previous year question papers into interactive mock tests using AI.
        </p>
      </div>

      {!isProcessing && !testReady && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="glass-card border-2 border-dashed border-primary/50 hover:border-primary transition-colors rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer min-h-[300px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {file ? file.name : "Drop your question paper here"}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {file ? "Click to change file" : "Supported formats: PDF, DOCX, PNG, JPG"}
              </p>
              <Button variant={file ? "secondary" : "default"}>
                {file ? "Change File" : "Choose File"}
              </Button>
            </div>

            {/* Answer Key Upload */}
            <div className="glass-card rounded-2xl p-6 flex items-center justify-between border border-border/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium">Answer Key Upload (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    {keyFile ? keyFile.name : "Upload answer key for accurate scoring"}
                  </p>
                </div>
              </div>
              <input 
                type="file" 
                ref={keyInputRef} 
                className="hidden" 
                onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
              />
              <Button variant="outline" onClick={() => keyInputRef.current?.click()}>
                {keyFile ? "Change" : "Browse"}
              </Button>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-4 text-foreground">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">AI Settings</h3>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-primary rounded border-border" />
                  <span className="text-sm font-medium">Extract Questions Only</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-primary rounded border-border" />
                  <span className="text-sm font-medium">Create Interactive Test</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-primary rounded border-border" />
                  <span className="text-sm font-medium">Auto Generate Explanations</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="form-checkbox h-5 w-5 text-primary rounded border-border" />
                  <span className="text-sm font-medium">Save Test for Retakes</span>
                </label>
              </div>

              <div className="mt-8">
                <Button 
                  className="w-full h-12 text-lg" 
                  disabled={!file}
                  onClick={simulateProcessing}
                >
                  Process Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div 
            className="w-24 h-24 relative mb-8"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-8">AI Analysis in Progress</h2>
          
          <div className="space-y-4 w-full max-w-sm">
            {processingSteps.map((step, index) => (
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: processStep >= index ? 1 : 0.3, x: 0 }}
                className="flex items-center gap-3"
              >
                {processStep > index ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : processStep === index ? (
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted" />
                )}
                <span className={processStep >= index ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Test Ready State */}
      {testReady && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 max-w-2xl mx-auto border border-border/50 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-2">Test Generated Successfully!</h2>
            <p className="text-muted-foreground">
              {keyFile ? "Answers synced with provided key." : "Answers generated by AI and may require verification."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left bg-background/50 p-6 rounded-2xl">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Test Title</div>
              <div className="font-semibold">{file?.name.split('.')[0] || "Mock Test"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Questions</div>
              <div className="font-semibold">30 Questions</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Estimated Duration</div>
              <div className="font-semibold">45 Minutes</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Subject</div>
              <div className="font-semibold">General AI Extraction</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Button className="h-12 w-full gap-2" variant="default">
              <Play className="w-4 h-4" /> Start Now
            </Button>
            <Button className="h-12 w-full gap-2" variant="secondary">
              <Calendar className="w-4 h-4" /> Schedule
            </Button>
            <Button className="h-12 w-full gap-2" variant="outline">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
