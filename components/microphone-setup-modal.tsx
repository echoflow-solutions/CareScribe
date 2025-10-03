'use client'

import { useState } from 'react'
import { AlertCircle, Laptop, Shield, Wifi, Copy, CheckCircle, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MicrophoneSetupModalProps {
  isOpen: boolean
  onClose: () => void
  currentUrl: string
}

export function MicrophoneSetupModal({ isOpen, onClose, currentUrl }: MicrophoneSetupModalProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  
  const localhostUrl = `http://localhost:${location.port || '3000'}${location.pathname}${location.search}`
  const httpsUrl = `https://${location.hostname}:3443${location.pathname}${location.search}`
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(type)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const isLocalNetwork = location.hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-orange-500" />
            Microphone Access Requires Secure Connection
          </DialogTitle>
          <DialogDescription>
            Your browser requires HTTPS when accessing microphone from network IP addresses
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Current URL:</strong> {currentUrl}
            <br />
            This URL cannot access your microphone due to browser security policies.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick">Quick Fix</TabsTrigger>
            <TabsTrigger value="network">Network Access</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Laptop className="h-5 w-5" />
                Option 1: Use Localhost (Easiest)
              </h3>
              <p className="text-sm text-gray-600">
                Access the app via localhost instead of IP address. Microphone will work immediately.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm">{localhostUrl}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(localhostUrl, 'localhost')}
                >
                  {copiedUrl === 'localhost' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = localhostUrl}
                >
                  Go Now
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Option 2: Try Firefox</h3>
              <p className="text-sm text-gray-600">
                Firefox may allow microphone access on local network IPs without HTTPS.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Enable HTTPS for Network Access
              </h3>
              <p className="text-sm text-gray-600">
                To access from other devices on your network with microphone support:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open terminal in the project directory</li>
                  <li>Run: <code className="bg-gray-200 px-1 rounded">npm run setup:https</code></li>
                  <li>Restart with: <code className="bg-gray-200 px-1 rounded">npm run dev:https</code></li>
                  <li>Access via HTTPS on port 3443</li>
                </ol>
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm">{httpsUrl}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(httpsUrl, 'https')}
                >
                  {copiedUrl === 'https' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Note:</strong> HTTPS setup requires mkcert to be installed on your system.
                The setup script will guide you through the process.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="help" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Why is this happening?</h3>
                <p className="text-sm text-gray-600">
                  Modern browsers enforce strict security policies for accessing sensitive features like
                  microphones. When accessing a website from a local network IP address (like {location.hostname}),
                  browsers require HTTPS to ensure the connection is secure.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Exceptions</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>localhost and 127.0.0.1 are exempt from this requirement</li>
                  <li>Some browsers (like Firefox) may be more permissive</li>
                  <li>HTTPS is always required for public websites</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Alternative Solutions</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Use a tunneling service like ngrok for temporary HTTPS access</li>
                  <li>Deploy to a hosting service with automatic HTTPS</li>
                  <li>Use the browser's override flags (not recommended)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            I'll Set Up Later
          </Button>
          <Button onClick={() => window.location.href = localhostUrl}>
            Use Localhost Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}