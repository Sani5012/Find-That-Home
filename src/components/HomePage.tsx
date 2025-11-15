import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Search, Star, MapPin, Building2, Home, ArrowRight, CheckCircle2, Sparkles, TrendingUp, Navigation as NavIcon } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { getApprovedProperties } from '../utils/localStorage';
import { ImageWithFallback } from './Fallback/ImageWithFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LocationSearchDropdown } from './LocationSearchDropdown';
import heroImage from 'figma:asset/7ecd3c6dbb5057d0a131fb3c93103e3cc94126fc.png';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('text-search');

  // Redirect agents to their dashboard
  useEffect(() => {
    if (user?.role === 'agent') {
      navigate('/agent-dashboard');
    }
  }, [user, navigate]);

  // Load featured properties
  useEffect(() => {
    const properties = getApprovedProperties();
    setFeaturedProperties(properties.slice(0, 4));
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams({
        q: searchQuery,
      });
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleExampleClick = (example: string) => {
    setSearchQuery(example);
  };

  const examples = [
    "Modern 2 bedroom loft in Manchester with exposed brick",
    "Family home with garden near good schools in Birmingham",
    "Cozy 1 bedroom apartment in Central London under £300k",
    "3 bedroom house with garage and parking in suburban area"
  ];

  const testimonials = [
    {
      rating: 5,
      text: "Happy to recommend Find That Home - fast and seamless service.",
      author: "David"
    },
    {
      rating: 5,
      text: "Superb and signed new tenants all sorted extremely swiftly online.",
      author: "Christopher"
    },
    {
      rating: 5,
      text: "Great to have a middle and superior alternative to other sites.",
      author: "Mark"
    },
    {
      rating: 5,
      text: "Had a response the same day! Now have great tenants!",
      author: "James"
    }
  ];

  const popularLocations = [
    'London', 'Manchester', 'Liverpool', 'Birmingham', 'Leeds', 'Glasgow', 'Bristol',
    'Coventry', 'Sheffield', 'Reading', 'Chester', 'Leeds', 'Southampton', 'Leicester',
    'Luton', 'Aberdeen', 'Harrow', 'Manchester', 'Nottingham', 'Edinburgh'
  ];

  const pressLogos = [
    { name: 'Rightmove', color: '#1a4d2e' },
    { name: 'Zoopla', color: '#7c3aed' },
    { name: 'PrimeLocation', color: '#2563eb' },
    { name: 'Find That Home', color: '#059669' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Clean Search */}
      <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Tabs */}
            <div className="mb-8">
              <div className="flex justify-center gap-3 mb-8">
                <button
                  onClick={() => setActiveTab('text-search')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all text-sm ${
                    activeTab === 'text-search'
                      ? 'bg-white shadow-md'
                      : 'bg-transparent text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>Text Search</span>
                </button>
                <button
                  onClick={() => setActiveTab('location-search')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all text-sm ${
                    activeTab === 'location-search'
                      ? 'bg-white shadow-md'
                      : 'bg-transparent text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <NavIcon className="h-4 w-4" />
                  <span>Location Search</span>
                </button>
              </div>
              
              {/* Text Search Tab */}
              {activeTab === 'text-search' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xl p-5 max-w-3xl mx-auto">
                    <textarea
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      placeholder="Describe your ideal home..."
                      className="w-full resize-none border-none outline-none text-gray-700 placeholder:text-gray-400 min-h-[60px] text-base"
                      rows={2}
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        onClick={handleSearch}
                        size="default"
                        className="rounded-full px-6 bg-gray-700 hover:bg-gray-800"
                        disabled={!searchQuery.trim()}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Try these examples</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                    {examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="group text-left p-3 rounded-xl bg-white hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-400"
                      >
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-0.5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                          <p className="text-sm text-gray-700 group-hover:text-blue-900">{example}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Location Search Tab */}
              {activeTab === 'location-search' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto">
                    <h2 className="text-xl mb-1">Search by Location</h2>
                    <p className="text-sm text-gray-600 mb-5">
                      Find properties near you or search by city, postcode, or area. Use the "Near Me" button to find properties based on your current GPS location.
                    </p>
                    <LocationSearchDropdown />
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 max-w-3xl mx-auto">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-3">
                        <NavIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base mb-1">GPS-Powered Property Discovery</h3>
                        <p className="text-sm text-gray-700">
                          Our intelligent location search sorts properties by distance from your location 
                          and shows you the most relevant options in real-time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Landlord & Tenant Sections */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* For Agents */}
            <div>
              <div className="text-blue-600 mb-2">For Agents</div>
              <h2 className="mb-4">List and Manage Properties</h2>
              <p className="text-gray-600 mb-6">
                Access powerful tools to manage your property listings, track market intelligence, and connect with potential buyers. Our GPS-powered platform helps you showcase properties to the right audience at the right time.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced Agent Dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">GPS Location Tracking & Alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Market Intelligence & Analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Property QR Code Generation</span>
                </li>
              </ul>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/signup?role=agent')} className="bg-blue-600 hover:bg-blue-700">
                  Join as Agent
                </Button>
                <Button onClick={() => navigate('/about')} variant="outline">
                  Learn more
                </Button>
              </div>
            </div>

            {/* For Agents Image */}
            <div className="order-first lg:order-last">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1745495707630-acb721c28061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kbG9yZCUyMHByb3BlcnR5JTIwb3duZXJ8ZW58MXx8fHwxNzYzMDgyOTUwfDA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Real estate agent at work" 
                className="rounded-lg shadow-xl w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* For Buyers Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* For Buyers Image */}
            <div>
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1758874385124-a56a148d7bcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBsYXB0b3AlMjBob21lfGVufDF8fHx8MTc2Mjk2MzY1OXww&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Person searching for home" 
                className="rounded-lg shadow-xl w-full h-80 object-cover"
              />
            </div>

            {/* For Buyers Content */}
            <div>
              <div className="text-green-600 mb-2">For Buyers</div>
              <h2 className="mb-4">Find Your Perfect Property</h2>
              <p className="text-gray-600 mb-6">
                Discover properties near you with our GPS-powered search. Get instant alerts when new listings match your preferences, explore detailed property information, and complete the entire buying or rental process online.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">GPS-Based Property Discovery</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">AI-Powered Property Recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Location Alerts & Notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Complete Digital Transactions</span>
                </li>
              </ul>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/search')} className="bg-green-600 hover:bg-green-700">
                  Search Properties
                </Button>
                <Button onClick={() => navigate('/about')} variant="outline">
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advertisement Partners */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 mb-6">We advertise on Rightmove, Zoopla, PrimeLocation and more</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {pressLogos.map((logo, index) => (
              <div key={index} className="text-2xl" style={{ color: logo.color }}>
                {logo.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-3">What people are saying</h2>
            <p className="text-gray-600">8.0 million <span className="text-green-600">Tenants and Landlords ♥ Find That Home</span></p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-3">{testimonial.text}</p>
                  <p className="text-sm text-gray-500">{testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="mb-3">Featured Properties</h2>
              <p className="text-gray-600">Some of our available and recently let properties</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <Card 
                  key={property.id} 
                  className="cursor-pointer hover:shadow-xl transition-all group overflow-hidden"
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  <div className="relative">
                    {property.images[0] && (
                      <ImageWithFallback 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                      {property.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <span className="text-2xl text-gray-900">
                        £{property.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {property.type === 'rent' ? ' /month' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {property.bedrooms} bed {property.location.city}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{property.location.address}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button onClick={() => navigate('/search')} variant="outline" size="lg">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Features */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-3">Platform Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Advanced tools to help you find and secure your perfect home
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/nearby')}>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="mb-2">GPS Nearby Search</h3>
                <p className="text-gray-600 text-sm">
                  Find properties near your current location with AI-powered recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/landlord-dashboard')}>
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="mb-2">Landlord Dashboard</h3>
                <p className="text-gray-600 text-sm">
                  Manage properties, tenants, applications, and contracts all in one place
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/alerts')}>
              <CardContent className="p-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="mb-2">Smart Alerts</h3>
                <p className="text-gray-600 text-sm">
                  Get notified about new listings matching your preferences and GPS location
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Popular Locations */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-center mb-6">Popular Locations</h3>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              {popularLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => navigate(`/search?city=${location}`)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-white">Ready to Find Your Perfect Home?</h2>
          <p className="text-lg mb-6 text-blue-50">
            Join thousands of happy tenants and landlords using Find that Home
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => navigate('/search')} 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Search className="mr-2 h-5 w-5" />
              Browse Properties
            </Button>
            {!isAuthenticated && (
              <Button 
                onClick={() => navigate('/signup')} 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Sign Up Free
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}