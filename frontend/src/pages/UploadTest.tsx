import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { UploadCloud, File, Settings, CheckCircle2, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"

export default function UploadTest() {
  const [file, setFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStep, setProcessStep] = useState(0)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const keyInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const saveTest = async () => {
    if (!file) return
    setError("")
    setMessage("")
    setIsProcessing(true)
    setProcessStep(1)
    const formData = new FormData()
    formData.append("question_paper", file)
    if (keyFile) formData.append("answer_key", keyFile)
    try {
      setProcessStep(2)
      const response = await apiRequest<{ test_id: number; title: string }>("/tests/upload", {
        method: "POST",
        body: formData,
        isFormData: true,
      })
      setProcessStep(5)
      setMessage(`Saved "${response.title}" successfully.`)
      window.setTimeout(() => navigate("/tests"), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save test")
      setIsProcessing(false)
    }
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

      {message && (
        <div className="fixed right-4 top-4 z-50 rounded-xl border border-green-500/30 bg-green-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {message}
        </div>
      )}

      {!isProcessing && (
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
                  onClick={saveTest}
                >
                  <Save className="mr-2 h-5 w-5" /> Save Test
                </Button>
                {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
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
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
    </div>
  )
}
