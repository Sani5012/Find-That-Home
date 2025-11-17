import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Home, Mail, Lock, Eye, EyeOff, Building2, ShoppingCart, UserCircle2, Briefcase, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useUser, UserRole } from '../contexts/UserContext';
import logoImage from 'figma:asset/fec5fc6ba55a6b0262eb857fb3a3dbd65968552b.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showUserNotFound, setShowUserNotFound] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const loggedInUser = await login(email, password, selectedRole);

      if (loggedInUser.role === 'admin') {
        toast.success('Welcome back, admin! Redirecting you to the control center.');
        navigate('/admin-dashboard', { replace: true });
        return;
      }

      toast.success(`Welcome back! Logged in as ${loggedInUser.role}`);

      switch (loggedInUser.role) {
        case 'tenant':
        case 'buyer':
          navigate('/profile');
          break;
        case 'landlord':
          navigate('/landlord-dashboard');
          break;
        case 'agent':
          navigate('/agent-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      // Check the error message and show appropriate dialog
      let errorMessage = error.message || 'Login failed';
      
      if (errorMessage.includes('User not found')) {
        setShowUserNotFound(true);
      } else if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Invalid login credentials')) {
        setShowPasswordError(true);
      } else if (errorMessage.includes('registered as a')) {
        // Keep role mismatch message as-is
        toast.error(error.message);
      } else if (errorMessage.includes('Email not confirmed')) {
        toast.error('Please verify your email address before logging in.');
      } else {
        // Only log unexpected errors to console
        console.error('Login error:', error);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info('Google login would be integrated here');
  };

  const handleFacebookLogin = () => {
    toast.info('Facebook login would be integrated here');
  };

  const roleOptions = [
    {
      value: 'tenant' as UserRole,
      label: 'Tenant',
      icon: Home,
      description: 'Find and rent properties',
    },
    {
      value: 'landlord' as UserRole,
      label: 'Landlord',
      icon: Building2,
      description: 'List and manage properties',
    },
    {
      value: 'buyer' as UserRole,
      label: 'Buyer',
      icon: ShoppingCart,
      description: 'Purchase properties',
    },
    {
      value: 'agent' as UserRole,
      label: 'Agent',
      icon: Briefcase,
      description: 'Professional property agent',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logoImage} alt="Find that Home" className="h-72 w-auto" />
          </div>
          <h1>Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to find your perfect home</p>
        </div>

        {/* Login Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your account type and sign in</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="space-y-3 mb-6">
              <Label>I am a:</Label>
              <div className="grid grid-cols-4 gap-2">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedRole === role.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`size-6 mx-auto mb-1 ${
                        selectedRole === role.value ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <p className="text-xs">{role.label}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {roleOptions.find(r => r.value === selectedRole)?.description}
              </p>
            </div>

            <Separator className="my-6" />

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => toast.info('Password reset would be sent to your email')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : `Sign In as ${roleOptions.find(r => r.value === selectedRole)?.label}`}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFacebookLogin}
                >
                  <svg className="h-4 w-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our{' '}
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="text-blue-600 hover:underline"
            >
              Terms of Use
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>

      {/* Password Error Dialog */}
      <AlertDialog open={showPasswordError} onOpenChange={setShowPasswordError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl">Incorrect Password</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Sorry, the password you entered is incorrect. Please try again or reset your password if you've forgotten it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel onClick={() => setShowPasswordError(false)}>
              Try Again
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowPasswordError(false);
              toast.info('Password reset link would be sent to your email');
            }}>
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Not Found Dialog */}
      <AlertDialog open={showUserNotFound} onOpenChange={setShowUserNotFound}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-orange-100 p-3">
                <UserCircle2 className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl">Account Not Found</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              We couldn't find an account with that email address. Please sign up to create a new account and start finding your perfect home.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel onClick={() => setShowUserNotFound(false)}>
              Try Again
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowUserNotFound(false);
              navigate('/signup');
            }}>
              Sign Up Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}