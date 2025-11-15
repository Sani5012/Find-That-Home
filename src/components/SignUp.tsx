import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Home, Mail, Lock, Eye, EyeOff, User, Building2, ShoppingCart, Phone, Briefcase, DollarSign, Calculator } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useUser, UserRole } from '../contexts/UserContext';
import logoImage from 'figma:asset/fec5fc6ba55a6b0262eb857fb3a3dbd65968552b.png';

export function SignUp() {
  const navigate = useNavigate();
  const { signup } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    income: '',
    incomeType: 'monthly' as 'monthly' | 'yearly',
    preferredPropertyType: 'rent' as 'rent' | 'buy',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      await signup(formData.email, formData.password, fullName, formData.phone, selectedRole);
      
      // If income information was provided for buyer/tenant, update the profile
      if ((selectedRole === 'buyer' || selectedRole === 'tenant') && formData.income && parseFloat(formData.income) > 0) {
        // The income will be saved via the signup function
        const income = parseFloat(formData.income);
        const incomeType = formData.incomeType;
        const preferredPropertyType = formData.preferredPropertyType;
        
        // Store this in localStorage temporarily so it can be picked up by UserContext
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUser = {
          ...currentUser,
          income,
          incomeType,
          preferredPropertyType
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Also update in users array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === formData.email);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], income, incomeType, preferredPropertyType };
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
      
      toast.success(`Account created successfully! Welcome to Find that Home.`);
      
      // Navigate based on role
      switch (selectedRole) {
        case 'tenant':
          navigate('/profile');
          break;
        case 'landlord':
          navigate('/landlord-dashboard');
          break;
        case 'buyer':
          navigate('/profile');
          break;
        case 'agent':
          navigate('/agent-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed';
      
      // Check if the error is due to existing email
      if (errorMessage.includes('already been registered') || errorMessage.includes('already exists')) {
        toast.error('This email is already registered. Please sign in instead.', {
          duration: 5000,
          action: {
            label: 'Sign In',
            onClick: () => navigate('/login'),
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    toast.info('Google sign up would be integrated here');
  };

  const handleFacebookSignUp = () => {
    toast.info('Facebook sign up would be integrated here');
  };

  const roleOptions = [
    {
      value: 'tenant' as UserRole,
      label: 'Tenant',
      icon: Home,
      description: 'I want to rent a property',
      features: ['Search rentals', 'Apply for leases', 'Track applications', 'Sign contracts digitally'],
    },
    {
      value: 'landlord' as UserRole,
      label: 'Landlord',
      icon: Building2,
      description: 'I want to list properties',
      features: ['List properties', 'Manage tenants', 'Accept applications', 'Handle contracts'],
    },
    {
      value: 'buyer' as UserRole,
      label: 'Buyer',
      icon: ShoppingCart,
      description: 'I want to purchase a property',
      features: ['Search properties', 'Make offers', 'Complete remotely', 'Track purchase'],
    },
    {
      value: 'agent' as UserRole,
      label: 'Agent',
      icon: Briefcase,
      description: 'I want to manage properties',
      features: ['List properties', 'Manage tenants', 'Accept applications', 'Handle contracts'],
    },
  ];

  const selectedRoleData = roleOptions.find(r => r.value === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logoImage} alt="Find that Home" className="h-72 w-auto" />
          </div>
          <h1>Join Find that Home</h1>
          <p className="text-gray-600 mt-2">Create an account to start your home journey</p>
        </div>

        {/* SignUp Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Choose your account type and get started</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="space-y-4 mb-6">
              <Label>I want to:</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedRole === role.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`size-6 mb-2 ${
                        selectedRole === role.value ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <p className="mb-1">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </button>
                  );
                })}
              </div>
              
              {selectedRoleData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm mb-2">
                    <strong>As a {selectedRoleData.label}, you can:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedRoleData.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Income Information - Only for Buyers and Tenants */}
              {(selectedRole === 'buyer' || selectedRole === 'tenant') && (
                <>
                  <Separator className="my-4" />
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      <h3 className="text-sm">Income Information (Optional)</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Help us find properties within your budget with our AI-powered affordability calculator
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="income">Your Income</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="income"
                            type="number"
                            placeholder="e.g., 45000"
                            value={formData.income}
                            onChange={(e) => handleInputChange('income', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="incomeType">Income Type</Label>
                          <Select 
                            value={formData.incomeType} 
                            onValueChange={(value) => handleInputChange('incomeType', value)}
                          >
                            <SelectTrigger id="incomeType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="preferredPropertyType">Looking For</Label>
                          <Select 
                            value={formData.preferredPropertyType} 
                            onValueChange={(value) => handleInputChange('preferredPropertyType', value)}
                          >
                            <SelectTrigger id="preferredPropertyType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rent">Rent</SelectItem>
                              <SelectItem value="buy">Buy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {formData.income && parseFloat(formData.income) > 0 && (
                        <div className="bg-white p-3 rounded border border-green-200">
                          <p className="text-xs text-green-700">
                            ✓ You can update your full affordability profile after signing up
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">* Password must be at least 8 characters</p>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/about')}
                    className="text-blue-600 hover:underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/about')}
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : `Create ${selectedRoleData?.label} Account`}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
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
                  onClick={handleFacebookSignUp}
                >
                  <svg className="h-4 w-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}