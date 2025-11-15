import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './Fallback/ImageWithFallback';
import { PropertyMap } from './PropertyMap';
import { PropertyQRCode } from './PropertyQRCode';
import { ChatWindow } from './ChatWindow';
import { mockProperties } from '../data/mockProperties';
import { useUser } from '../contexts/UserContext';
import { getPropertyById } from '../utils/localStorage';
import { Property } from '../types/property';
import { 
  Bed, Bath, Maximize, MapPin, Calendar, Home, DollarSign, Clock, School, Heart, Share2, 
  ChevronLeft, ChevronRight, Volume2, Navigation, Train, TrendingUp, Users, Send,
  Calculator, FileText, CheckCircle2, Building, MessageCircle, Loader2, UserCircle2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [monthlyDisposableIncome, setMonthlyDisposableIncome] = useState('');
  const [affordabilityResult, setAffordabilityResult] = useState<any>(null);
  
  // Rental offer states
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offerRent, setOfferRent] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('12');
  const [offerMessage, setOfferMessage] = useState('');
  
  // Chat states
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [landlordId, setLandlordId] = useState<string>('');

  // Helper functions to handle both property structures
  const getLocationString = (property: Property): string => {
    if (typeof property.location === 'string') {
      return property.location;
    } else if (property.location && typeof property.location === 'object') {
      return `${property.location.address}, ${property.location.city}`;
    }
    return 'Location not specified';
  };

  const getCoordinates = (property: Property): { lat: number; lng: number } | null => {
    // Check if coordinates exist at property level (old structure)
    if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
      return property.coordinates;
    }
    // Check if coordinates exist in location object (new structure)
    if (property.location && typeof property.location === 'object' && property.location.coordinates) {
      return property.location.coordinates;
    }
    // Return default coordinates if not available
    return null;
  };

  // Fetch property from localStorage
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Try to get property from localStorage
        const localProperty = getPropertyById(id);
        
        if (localProperty) {
          console.log(`✓ Found property ${id} in localStorage`);
          setProperty(localProperty);
          setLandlordId(localProperty.landlordId || '');
        } else {
          // Fallback to mock properties
          console.log(`Property ${id} not in localStorage, checking mock data`);
          const mockProperty = mockProperties.find(p => p.id === id);
          if (mockProperty) {
            setProperty(mockProperty);
            setLandlordId(mockProperty.landlordId || '');
          } else {
            setProperty(null);
          }
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg">Loading property details...</span>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2>Property not found</h2>
        <Button onClick={() => navigate('/search')} className="mt-4">
          Back to Search
        </Button>
      </div>
    );
  }

  const calculateAffordability = () => {
    const disposableIncome = parseFloat(monthlyDisposableIncome);
    
    if (!disposableIncome) {
      toast.error('Please enter your monthly disposable income');
      return;
    }

    const maxAffordablePayment = disposableIncome * 0.3; // 30% rule

    let result: any = {
      disposableIncome,
      maxAffordablePayment,
      isAffordable: false,
      details: {}
    };

    if (property.listingType === 'rent') {
      const utilities = property.utilities || 150;
      const insurance = property.insurance || 50;
      const totalMonthlyCost = property.price + utilities + insurance;
      result.totalMonthlyCost = totalMonthlyCost;
      result.percentageOfIncome = (totalMonthlyCost / disposableIncome) * 100;
      result.isAffordable = totalMonthlyCost <= maxAffordablePayment;
      result.details = {
        rent: property.price,
        utilities,
        insurance
      };
    } else {
      // Simplified mortgage calculation (5% interest, 25 year term)
      const annualRate = 0.05;
      const monthlyRate = annualRate / 12;
      const numberOfPayments = 25 * 12;
      const monthlyMortgage = (property.price * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      const monthlyPropertyTax = property.propertyTax / 12;
      const monthlyHOA = property.hoaFees || 0;
      const totalMonthlyCost = monthlyMortgage + monthlyPropertyTax + property.utilities + property.insurance + monthlyHOA;
      
      result.totalMonthlyCost = totalMonthlyCost;
      result.percentageOfIncome = (totalMonthlyCost / disposableIncome) * 100;
      result.isAffordable = totalMonthlyCost <= maxAffordablePayment;
      result.details = {
        mortgage: monthlyMortgage,
        propertyTax: monthlyPropertyTax,
        hoa: monthlyHOA,
        utilities: property.utilities,
        insurance: property.insurance
      };
    }

    setAffordabilityResult(result);
  };

  const submitRentalOffer = () => {
    if (!offerRent || !moveInDate || !leaseTerm) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate offer submission
    toast.success('Offer submitted! The landlord will review and respond within 48 hours.');
    setShowOfferDialog(false);
    
    // Reset form
    setOfferRent('');
    setMoveInDate('');
    setLeaseTerm('12');
    setOfferMessage('');
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to contact the property owner');
      navigate('/login');
      return;
    }

    setShowChatDialog(true);
  };

  const nextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  // Prepare price history chart data (only if available)
  const priceChartData = property.priceHistory?.map((item, index) => ({
    date: item.date,
    actual: item.price,
    predicted: property.priceForecasts?.[index]?.predictedPrice
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/search')} className="mb-4">
          ← Back to Results
        </Button>

        {/* Image Gallery */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative aspect-video bg-gray-200">
            {property.images && property.images.length > 0 ? (
              <>
                <ImageWithFallback
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <Home className="size-24 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <Badge className="bg-blue-600">
                {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  <Heart className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="secondary">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{property.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4" />
                      {getLocationString(property)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl">£{property.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {property.listingType === 'rent' ? 'per month' : ''}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-gray-600" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-gray-600" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="h-5 w-5 text-gray-600" />
                    <span>{property.sqft} sqft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span>Built {property.yearBuilt}</span>
                  </div>
                </div>
                
                <p className="text-gray-700">{property.description}</p>
              </CardContent>
            </Card>

            {/* Lifestyle & Location Scores */}
            {(property.lifestyleScores || property.neighborhoodVibe) && (
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle & Location Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Neighborhood Vibe */}
                {property.neighborhoodVibe && (
                  <div>
                    <h4 className="mb-2">Neighborhood Vibe</h4>
                    {property.neighborhoodVibe.description && (
                      <p className="text-sm text-gray-700 mb-2">{property.neighborhoodVibe.description}</p>
                    )}
                    {property.neighborhoodVibe.tags && property.neighborhoodVibe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {property.neighborhoodVibe.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    {property.neighborhoodVibe.rating && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">Rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < property.neighborhoodVibe!.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.neighborhoodVibe.noiseLevel && (
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Noise Level:</span>
                        <Badge variant={
                          property.neighborhoodVibe.noiseLevel === 'quiet' ? 'default' :
                          property.neighborhoodVibe.noiseLevel === 'moderate' ? 'secondary' : 'destructive'
                        }>
                          {property.neighborhoodVibe.noiseLevel.charAt(0).toUpperCase() + property.neighborhoodVibe.noiseLevel.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {property.lifestyleScores && (
                  <>
                    {property.neighborhoodVibe && <Separator className="my-4" />}
                    <div className="grid grid-cols-2 gap-4">
                      {property.lifestyleScores.walkScore !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <Navigation className="h-4 w-4" />
                              Walk Score
                            </Label>
                            <span>{property.lifestyleScores.walkScore}/100</span>
                          </div>
                          <Progress value={property.lifestyleScores.walkScore} className="h-2" />
                        </div>
                      )}

                      {property.lifestyleScores.transitScore !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <Train className="h-4 w-4" />
                              Transit Score
                            </Label>
                            <span>{property.lifestyleScores.transitScore}/100</span>
                          </div>
                          <Progress value={property.lifestyleScores.transitScore} className="h-2" />
                        </div>
                      )}

                      {property.lifestyleScores.bikeScore !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Bike Score</Label>
                            <span>{property.lifestyleScores.bikeScore}/100</span>
                          </div>
                          <Progress value={property.lifestyleScores.bikeScore} className="h-2" />
                        </div>
                      )}

                      {property.lifestyleScores.schoolRating !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <School className="h-4 w-4" />
                              Schools
                            </Label>
                            <span>{property.lifestyleScores.schoolRating}/100</span>
                          </div>
                          <Progress value={property.lifestyleScores.schoolRating} className="h-2" />
                        </div>
                      )}

                      {property.lifestyleScores.restaurantRating !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Restaurants</Label>
                            <span>{property.lifestyleScores.restaurantRating}/100</span>
                          </div>
                          <Progress value={property.lifestyleScores.restaurantRating} className="h-2" />
                        </div>
                      )}

                      {property.lifestyleScores.shoppingRating !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Shopping</Label>
                            <span>{property.lifestyleScores.shoppingRating}/100</span>
                          </div>
                          <Progress value={property.lifestyleScores.shoppingRating} className="h-2" />
                        </div>
                      )}

                      {property.lifestyleScores.nightlifeRating !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Nightlife</Label>
                            <span>{property.lifestyleScores.nightlifeRating}/100</span>
                          </div>
                          <Progress value={property.lifestyleScores.nightlifeRating} className="h-2" />
                        </div>
                      )}

                      {property.lifestyleScores.parksRating !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Parks & Recreation</Label>
                            <span>{property.lifestyleScores.parksRating}/100</span>
                          </div>
                          <Progress value={property.lifestyleScores.parksRating} className="h-2" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            )}

            {/* Commute Options */}
            {property.commuteOptions && property.commuteOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="h-5 w-5" />
                  Commute Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {property.commuteOptions.map((commute, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p>{commute.destination}</p>
                        <p className="text-sm text-gray-500 capitalize">{commute.mode.replace('-', ' ')}</p>
                      </div>
                      <Badge>{commute.time} min</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Nearby Amenities */}
            {property.nearbyAmenities && property.nearbyAmenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nearby Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.nearbyAmenities.map((amenity, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="text-sm">{amenity.type}</p>
                        <p className="text-xs text-gray-500">{amenity.name}</p>
                      </div>
                      <span className="text-sm text-gray-600">{amenity.distance} mi</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Demographics */}
            {property.demographics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demographics
                </CardTitle>
                <CardDescription>
                  Population: {property.demographics.population?.toLocaleString() || 'N/A'} | 
                  Median income: £{property.demographics.medianIncome?.toLocaleString() || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {property.demographics.ethnicityBreakdown && (
                <div className="space-y-2">
                  {Object.entries(property.demographics.ethnicityBreakdown).map(([ethnicity, percentage]) => (
                    <div key={ethnicity}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{ethnicity}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage as number} className="h-2" />
                    </div>
                  ))}
                </div>
                )}
                {!property.demographics.ethnicityBreakdown && (
                  <p className="text-sm text-gray-500">Ethnicity breakdown data not available</p>
                )}
              </CardContent>
            </Card>
            )}

            {/* Investment & Market Data */}
            {(property.investmentScore || property.rentalYield) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Investment Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.investmentScore && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl">{property.investmentScore}</p>
                        <p className="text-xs text-gray-600">Investment Score</p>
                      </div>
                    )}
                    {property.appreciationRate && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl">{property.appreciationRate}%</p>
                        <p className="text-xs text-gray-600">Annual Growth</p>
                      </div>
                    )}
                    {property.rentalYield && (
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl">{property.rentalYield}%</p>
                        <p className="text-xs text-gray-600">Rental Yield</p>
                      </div>
                    )}
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl">£{Math.floor(property.price * 0.05 / 1000)}k</p>
                      <p className="text-xs text-gray-600">Estimated Growth</p>
                    </div>
                  </div>

                  {priceChartData.length > 0 && (
                  <div>
                    <h4 className="mb-3">Price History & Forecast</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={priceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual Price" />
                        <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeDasharray="5 5" name="Forecast" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map(amenity => (
                    <Badge key={amenity} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  {getLocationString(property)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyMap
                  lat={getCoordinates(property)?.lat || 0}
                  lng={getCoordinates(property)?.lng || 0}
                  title={property.title}
                  address={getLocationString(property)}
                />
                <p className="text-xs text-gray-500 mt-3">
                  The exact address will be provided after your offer is accepted. This map shows the approximate location for privacy reasons.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Meet the Agent</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                    <UserCircle2 className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-1">{property.agentName || 'Agent Name'}</h3>
                  {property.agentPhone && (
                    <p className="text-sm text-gray-600 mb-2">{property.agentPhone}</p>
                  )}
                  <p className="text-sm text-gray-600">{property.agentEmail}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons - Only for Buyers */}
            {user?.role === 'buyer' && (
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.listingType === 'sale' && (
                  <Button className="w-full" size="lg" onClick={() => navigate(`/purchase/${property.id}`)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Make an Offer
                  </Button>
                )}
                
                {property.listingType === 'rent' && property.acceptingOffers && (
                  <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <Send className="h-4 w-4 mr-2" />
                        Make an Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Rental Offer</DialogTitle>
                        <DialogDescription>
                          Make an offer to rent this property. The landlord will review and respond.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Offered Monthly Rent (£)</Label>
                          <Input
                            type="number"
                            placeholder={property.price.toString()}
                            value={offerRent}
                            onChange={(e) => setOfferRent(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Desired Move-in Date</Label>
                          <Input
                            type="date"
                            value={moveInDate}
                            onChange={(e) => setMoveInDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Lease Term (months)</Label>
                          <Input
                            type="number"
                            value={leaseTerm}
                            onChange={(e) => setLeaseTerm(e.target.value)}
                            placeholder="12"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Message to Landlord (Optional)</Label>
                          <Textarea
                            placeholder="Tell the landlord why you're a great tenant..."
                            value={offerMessage}
                            onChange={(e) => setOfferMessage(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button onClick={submitRentalOffer} className="w-full">
                          Submit Offer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Viewing
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleContactOwner}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {property.listingType === 'rent' ? 'Message Landlord' : 'Message Owner'}
                </Button>
                
                <Button variant="outline" className="w-full" onClick={() => navigate('/contact')}>
                  Contact Agent
                </Button>
              </CardContent>
            </Card>
            )}

            {/* Chat Dialog */}
            <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
              <DialogContent className="max-w-2xl h-[600px] p-0">
                <DialogTitle className="sr-only">
                  Message {property.listingType === 'rent' ? 'Landlord' : 'Property Owner'}
                </DialogTitle>
                <ChatWindow
                  otherUserId={landlordId}
                  otherUserName={property.listingType === 'rent' ? 'Landlord' : 'Property Owner'}
                  propertyId={property.id}
                  onClose={() => setShowChatDialog(false)}
                />
              </DialogContent>
            </Dialog>

            {/* QR Code */}
            <PropertyQRCode property={property} />

            {/* Affordability Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Affordability Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Monthly Disposable Income (£)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3000"
                    value={monthlyDisposableIncome}
                    onChange={(e) => setMonthlyDisposableIncome(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount after all expenses (food, bills, savings)
                  </p>
                </div>

                <Button onClick={calculateAffordability} className="w-full">
                  Calculate Affordability
                </Button>

                {affordabilityResult && (
                  <div className={`p-4 rounded-lg ${affordabilityResult.isAffordable ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className={`h-5 w-5 ${affordabilityResult.isAffordable ? 'text-green-600' : 'text-red-600'}`} />
                      <p className={`${affordabilityResult.isAffordable ? 'text-green-900' : 'text-red-900'}`}>
                        {affordabilityResult.isAffordable ? 'This property is affordable!' : 'This may stretch your budget'}
                      </p>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Monthly Cost:</span>
                        <span>£{Math.floor(affordabilityResult.totalMonthlyCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>% of Income:</span>
                        <span>{affordabilityResult.percentageOfIncome.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recommended Max:</span>
                        <span>£{Math.floor(affordabilityResult.maxAffordablePayment)}</span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="text-xs space-y-1">
                      <p className="text-gray-600">Monthly Breakdown:</p>
                      {Object.entries(affordabilityResult.details).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span>£{Math.floor(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{property.listingType === 'rent' ? 'Rent' : 'Mortgage Est.'}:</span>
                    <span>£{property.price.toLocaleString()}</span>
                  </div>
                  {property.propertyTax > 0 && (
                    <div className="flex justify-between">
                      <span>Property Tax:</span>
                      <span>£{Math.floor(property.propertyTax / 12)}</span>
                    </div>
                  )}
                  {property.hoaFees && (
                    <div className="flex justify-between">
                      <span>HOA Fees:</span>
                      <span>£{property.hoaFees}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Utilities (est.):</span>
                    <span>£{property.utilities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance (est.):</span>
                    <span>£{property.insurance}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>
                      £{(property.price + (property.hoaFees || 0) + property.utilities + property.insurance + (property.propertyTax > 0 ? property.propertyTax / 12 : 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schools */}
            {property.nearbySchools && property.nearbySchools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Nearby Schools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {property.nearbySchools.map((school, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{school}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}