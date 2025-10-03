'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/hooks/use-toast'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { ArrowLeft, LogIn, Sparkles, User } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setCurrentUser, setOrganization } = useStore()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const demoAccounts = [
    { role: "Support Worker", email: "bernard.adjei@maxlifecare.com.au", description: "Frontline staff view" },
    { role: "Team Leader", email: "tom.anderson@maxlifecare.com.au", description: "Supervisory dashboard" },
    { role: "Clinical Manager", email: "dr.kim@maxlifecare.com.au", description: "Clinical insights" },
    { role: "Area Manager", email: "lisa.park@maxlifecare.com.au", description: "Regional oversight" }
  ]

  const handleLogin = async (loginEmail?: string) => {
    const emailToUse = loginEmail || email
    if (!emailToUse) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const user = await DataService.authenticateUser(emailToUse)
      if (user) {
        setCurrentUser(user)
        const org = await DataService.getOrganization()
        if (org) setOrganization(org)
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${user.name}`,
        })

        // Route based on role
        if (user.role.level === 4) {
          router.push('/shift-start')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast({
          title: "Login failed",
          description: "Please use one of the demo accounts",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        <div className="mb-8 text-center">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Welcome to CareScribe</h1>
          <p className="text-gray-600 mt-2">Choose an account to experience the demo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Login Options */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6">Quick Demo Access</h2>
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <motion.div
                  key={account.email}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handleLogin(account.email)}
                    disabled={isLoading}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <User className="h-5 w-5 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold">{account.role}</div>
                        <div className="text-xs text-muted-foreground">{account.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">{account.email}</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Demo Mode Active</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                No password required. Click any account to login instantly.
              </p>
            </div>
          </Card>

          {/* Manual Login Form */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6">Manual Login</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter demo email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-500">
                  Password (not required for demo)
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Leave empty for demo"
                  disabled
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login to Demo
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Demo Features</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Badge variant="secondary" className="justify-center py-2">
                  <span className="text-xs">Voice Reporting</span>
                </Badge>
                <Badge variant="secondary" className="justify-center py-2">
                  <span className="text-xs">AI Analysis</span>
                </Badge>
                <Badge variant="secondary" className="justify-center py-2">
                  <span className="text-xs">Live Dashboard</span>
                </Badge>
                <Badge variant="secondary" className="justify-center py-2">
                  <span className="text-xs">Pattern Recognition</span>
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a demonstration version. All data is simulated for testing purposes.</p>
        </div>
      </motion.div>
    </div>
  )
}