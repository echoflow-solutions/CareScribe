'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, Keyboard, ArrowLeft, Volume2, Loader2, Sparkles,
  MessageSquare, Zap, Shield, Clock
} from 'lucide-react'
import { useStore } from '@/lib/store'

export default function QuickReportPage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const [isOpen, setIsOpen] = useState(true)
  const [reportMode, setReportMode] = useState<'choice' | 'voice' | 'type'>('choice')
  const [description, setDescription] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    router.back()
  }

  const handleStartVoiceReport = () => {
    setReportMode('voice')
    // In a real app, we'd request microphone permission and start recording
    // For demo, we'll simulate with a pre-defined scenario
    setIsRecording(true)
    setTimeout(() => {
      setDescription("James just pushed over the bookshelf in the living room")
      setIsRecording(false)
      // Navigate to conversational flow
      router.push('/report/conversational?text=' + encodeURIComponent("James just pushed over the bookshelf in the living room"))
    }, 2000)
  }

  const handleStartTyping = () => {
    setReportMode('type')
  }

  const handleSubmitText = () => {
    if (description.trim()) {
      router.push('/report/conversational?text=' + encodeURIComponent(description))
    }
  }

  if (!currentUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-0">
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
          {/* Header with gradient and branding */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quick Incident Report
              </h2>
            </motion.div>
            <p className="text-gray-600">
              Fast, accurate incident documentation powered by AI
            </p>
          </div>

          <AnimatePresence mode="wait">
            {reportMode === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Feature badges */}
                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    3 min average
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    NDIS Compliant
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    AI-Powered
                  </Badge>
                </div>

                {/* Enhanced choice cards */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card 
                      className="relative overflow-hidden cursor-pointer group bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl"
                      onClick={handleStartVoiceReport}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                      <div className="p-8 text-center relative z-10">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Mic className="h-16 w-16 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="font-bold text-xl mb-2">Voice Report</h3>
                        <p className="text-sm opacity-90">Speak naturally, we'll handle the rest</p>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card 
                      className="relative overflow-hidden cursor-pointer group bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl"
                      onClick={handleStartTyping}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                      <div className="p-8 text-center relative z-10">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <MessageSquare className="h-16 w-16 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="font-bold text-xl mb-2">Type Report</h3>
                        <p className="text-sm opacity-90">Write at your own pace</p>
                      </div>
                    </Card>
                  </motion.div>
                </div>

                {/* Quick start section */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-500">
                      or start typing immediately
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Textarea
                    placeholder="Example: James just pushed over the bookshelf in the living room..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] text-lg border-2 focus:border-primary transition-colors"
                  />
                  <Button 
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                    onClick={handleSubmitText}
                    disabled={!description.trim()}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Start AI-Powered Report
                  </Button>
                </div>
              </motion.div>
            )}

            {reportMode === 'voice' && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-12 text-center space-y-6"
              >
                {isRecording ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative inline-flex"
                    >
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
                      <div className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-8 shadow-2xl">
                        <Mic className="h-16 w-16" />
                      </div>
                    </motion.div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold">Recording in Progress</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Speak naturally about the incident. Our AI will understand context, identify participants, and structure your report.
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-6">
                        <Volume2 className="h-5 w-5 text-gray-400" />
                        <div className="flex gap-1.5">
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                              animate={{
                                height: [8, Math.random() * 40 + 10, 8],
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.05,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
                      <Sparkles className="h-6 w-6 absolute top-0 right-1/3 text-yellow-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold">AI Processing Your Report</h3>
                    <p className="text-gray-600">Analyzing speech patterns and extracting incident details...</p>
                  </div>
                )}
              </motion.div>
            )}

            {reportMode === 'type' && (
              <motion.div
                key="type"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Describe the Incident</h3>
                  <p className="text-gray-600">Write naturally - our AI will structure and enhance your report</p>
                </div>
                
                <Textarea
                  placeholder="Start typing what happened... For example: 'James became upset during lunch and threw his plate on the floor. Staff intervened calmly and...'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[250px] text-lg p-4 border-2 focus:border-primary transition-all"
                  autoFocus
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{description.length} characters</span>
                  <span>AI will enhance your report</span>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setReportMode('choice')}
                    className="h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                    onClick={handleSubmitText}
                    disabled={!description.trim()}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Continue with AI Enhancement
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}