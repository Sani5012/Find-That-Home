import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Home, Search, Bell, User, TrendingUp, HelpCircle, Menu, X, MapPin, Building2, LogOut, MessageCircle, Shield } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import logoImage from 'figma:asset/fec5fc6ba55a6b0262eb857fb3a3dbd65968552b.png';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/nearby', label: 'Nearby', icon: MapPin },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/market-intelligence', label: 'Market', icon: TrendingUp },
  ];

  // Admin users get their own navigation
  if (user?.role === 'admin') {
    const adminNavItems = [
      { path: '/admin-dashboard', label: 'Admin Dashboard', icon: Shield },
    ];
    
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/admin-dashboard" className="flex items-center gap-2">
              <img src={logoImage} alt="Find that Home" className="h-20 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Admin User Menu */}
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p>{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-blue-600 capitalize mt-1 flex items-center gap-1">
                        <Shield className="size-3" />
                        Administrator
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin-profile')}>
                    <User className="size-4 mr-2" />
                    Admin Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                    <Shield className="size-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }}>
                    <LogOut className="size-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>Admin Menu</SheetTitle>
                  <SheetDescription>
                    Administrator controls
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive(item.path) ? 'default' : 'ghost'}
                          className="w-full justify-start gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Link to="/admin-profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="h-4 w-4" />
                        Admin Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => { 
                        logout(); 
                        setMobileMenuOpen(false);
                        navigate('/login');
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    );
  }

  // Filter out Home for agent users
  const filteredNavItems = user?.role === 'agent' 
    ? navItems.filter(item => item.path !== '/')
    : navItems;

  // Add My Properties for landlords
  if (user?.role === 'landlord') {
    filteredNavItems.push({ path: '/landlord-dashboard', label: 'My Properties', icon: Building2 });
  }

  // Add Agent Dashboard for agents
  if (user?.role === 'agent') {
    filteredNavItems.push({ path: '/agent-dashboard', label: 'Dashboard', icon: Building2 });
  }

  const extraItems = [
    { path: '/contact', label: 'Support', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={user?.role === 'agent' ? '/agent-dashboard' : '/'} 
            className="flex items-center gap-2"
          >
            <img src={logoImage} alt="Find that Home" className="h-20 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* About & Login/User Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/about">
              <Button variant="ghost">About</Button>
            </Link>
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p>{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-blue-600 capitalize mt-1">{user.role} Account</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="size-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/alerts')}>
                    <Bell className="size-4 mr-2" />
                    My Alerts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/messages')}>
                    <MessageCircle className="size-4 mr-2" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
                    <LogOut className="size-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Access all sections of Find that Home
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-4">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive(item.path) ? 'default' : 'ghost'}
                        className="w-full justify-start gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      About
                    </Button>
                  </Link>
                  {isAuthenticated && user ? (
                    <>
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <User className="h-4 w-4" />
                          My Profile
                        </Button>
                      </Link>
                      <Link to="/messages" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Messages
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2"
                        onClick={() => { 
                          logout(); 
                          setMobileMenuOpen(false);
                          navigate('/');
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}