import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import logo from '@/assets/bDesh2bKash-logo.png'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, loading, error, clearError } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (!email || !password) {
      return
    }

    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 shadow-2xl border-0 ring-1 ring-white/20">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <img 
                src={logo} 
                alt="bDesh2bKash Logo" 
                className="h-16 w-16 rounded-full shadow-lg ring-4 ring-white/50"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            bDesh2bKash
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Transaction Management System
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

