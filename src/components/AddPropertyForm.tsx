import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { useUser } from '../contexts/UserContext';
import { createProperty } from '../utils/localStorage';
import { LeafletMap } from './LeafletMap';
import { 
  Home, MapPin, DollarSign, Bed, Bath, Maximize, Image as ImageIcon,
  Plus, X, Train, TrendingUp, Users, Map, Save, AlertCircle
} from 'lucide-react';

export function AddPropertyForm() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'rent' | 'sale'>('rent');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');

  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [latitude, setLatitude] = useState('51.5074'); // Default to London
  const [longitude, setLongitude] = useState('-0.1278');

  // Features
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  // Commute Options
  const [trainStation, setTrainStation] = useState('');
  const [trainDistance, setTrainDistance] = useState('');
  const [trainWalkTime, setTrainWalkTime] = useState('');
  const [busCount, setBusCount] = useState('');
  const [busDistance, setBusDistance] = useState('');
  const [motorway, setMotorway] = useState('');
  const [motorwayDistance, setMotorwayDistance] = useState('');
  const [airport, setAirport] = useState('');
  const [airportDistance, setAirportDistance] = useState('');

  // Neighborhood Vibe
  const [neighborhoodDescription, setNeighborhoodDescription] = useState('');
  const [neighborhoodTags, setNeighborhoodTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [neighborhoodRating, setNeighborhoodRating] = useState<number>(3);
  const [noiseLevel, setNoiseLevel] = useState<'quiet' | 'moderate' | 'noisy'>('moderate');

  // Lifestyle Scores
  const [walkScore, setWalkScore] = useState<number>(50);
  const [transitScore, setTransitScore] = useState<number>(50);
  const [bikeScore, setBikeScore] = useState<number>(50);
  const [schoolRating, setSchoolRating] = useState<number>(50);
  const [restaurantRating, setRestaurantRating] = useState<number>(50);
  const [shoppingRating, setShoppingRating] = useState<number>(50);
  const [nightlifeRating, setNightlifeRating] = useState<number>(50);
  const [parksRating, setParksRating] = useState<number>(50);

  // Demographics
  const [population, setPopulation] = useState('');
  const [medianAge, setMedianAge] = useState('');
  const [medianIncome, setMedianIncome] = useState('');
  const [employmentRate, setEmploymentRate] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [crimeRate, setCrimeRate] = useState('low');

  // Investment Insights
  const [rentalYield, setRentalYield] = useState('');
  const [appreciationRate, setAppreciationRate] = useState('');
  const [marketTrend, setMarketTrend] = useState<'rising' | 'stable' | 'declining'>('stable');
  const [rentalDemand, setRentalDemand] = useState<'high' | 'medium' | 'low'>('medium');
  const [comparableProperties, setComparableProperties] = useState('');

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  const addTag = () => {
    if (tagInput.trim() && !neighborhoodTags.includes(tagInput.trim())) {
      setNeighborhoodTags([...neighborhoodTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNeighborhoodTags(neighborhoodTags.filter(t => t !== tag));
  };

  const addImage = () => {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  const removeImage = (image: string) => {
    setImages(images.filter(img => img !== image));
  };

  const handleSubmit = async () => {
    // Validation
    const requiredFields: { [key: string]: string } = {
      title: 'Property Title',
      description: 'Description',
      price: 'Price',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      area: 'Area',
      address: 'Street Address',
      city: 'City',
      postcode: 'Postcode',
    };

    const missing: string[] = [];
    for (const [key, label] of Object.entries(requiredFields)) {
      if (!eval(key)) {
        missing.push(label);
      }
    }

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationDialog(true);
      return;
    }

    if (!user) {
      toast.error('You must be logged in to add a property');
      return;
    }

    setIsLoading(true);

    try {
      const pricePerSqFt = parseFloat(price) / parseFloat(area);

      const newProperty = createProperty({
        title,
        description,
        type,
        price: parseFloat(price),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseFloat(bathrooms),
        area: parseFloat(area),
        features,
        images,
        location: {
          address,
          city,
          postcode,
          coordinates: {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
          },
        },
        agentId: user.id,
        agentName: user.name,
        agentEmail: user.email,
        agentPhone: user.phone,
        approvalStatus: 'pending',
        // Enhanced fields
        commuteOptions: {
          ...(trainStation && {
            trainStation: {
              name: trainStation,
              distance: trainDistance,
              walkTime: trainWalkTime,
            },
          }),
          ...(busCount && {
            busStops: {
              count: parseInt(busCount),
              nearestDistance: busDistance,
            },
          }),
          ...(motorway && {
            motorway: {
              name: motorway,
              distance: motorwayDistance,
            },
          }),
          ...(airport && {
            airport: {
              name: airport,
              distance: airportDistance,
            },
          }),
        },
        neighborhoodVibe: {
          description: neighborhoodDescription,
          tags: neighborhoodTags,
          rating: neighborhoodRating,
          noiseLevel,
        },
        lifestyleScores: {
          walkScore,
          transitScore,
          bikeScore,
          schoolRating,
          restaurantRating,
          shoppingRating,
          nightlifeRating,
          parksRating,
        },
        demographics: {
          ...(population && { population: parseInt(population) }),
          ...(medianAge && { medianAge: parseInt(medianAge) }),
          ...(medianIncome && { medianIncome: parseInt(medianIncome) }),
          ...(employmentRate && { employmentRate: parseFloat(employmentRate) }),
          ...(educationLevel && { educationLevel }),
          crimeRate,
        },
        investmentInsights: {
          ...(rentalYield && { averageRentalYield: parseFloat(rentalYield) }),
          ...(appreciationRate && { propertyAppreciation: parseFloat(appreciationRate) }),
          marketTrend,
          rentalDemand,
          ...(comparableProperties && { comparableProperties: parseInt(comparableProperties) }),
          pricePerSqFt,
        },
      });

      toast.success('Property submitted successfully! It will be reviewed by an admin before appearing in search.');
      // Navigate to agent dashboard after successful submission
      navigate('/agent-dashboard');
    } catch (error: any) {
      console.error('Error adding property:', error);
      toast.error('Failed to add property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1>Add New Property</h1>
          <p className="text-gray-600 mt-2">Fill in the details below to list a new property</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="commute">Commute</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Basic Property Information
                </CardTitle>
                <CardDescription>Enter the essential details about the property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern 2-Bed Apartment in Central London"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the property, its features, and what makes it special..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Listing Type *</Label>
                    <Select value={type} onValueChange={(value: 'rent' | 'sale') => setType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (£) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder={type === 'rent' ? 'Monthly rent' : 'Sale price'}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="e.g., 2"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      step="0.5"
                      placeholder="e.g., 1.5"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sqft) *</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="e.g., 850"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Property Features</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Parking, Garden, Balcony"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="pr-1">
                        {feature}
                        <button
                          onClick={() => removeFeature(feature)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter image URL"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    />
                    <Button type="button" onClick={addImage} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {images.map((image) => (
                      <div key={image} className="relative group">
                        <img src={image} alt="Property" className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => removeImage(image)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Details
                </CardTitle>
                <CardDescription>Specify the exact location of the property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Oxford Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., London"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      placeholder="e.g., W1D 1LL"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-2 block">GPS Coordinates</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Drag the map marker to pinpoint the exact property location
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="51.5074"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="-0.1278"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <LeafletMap
                      latitude={parseFloat(latitude)}
                      longitude={parseFloat(longitude)}
                      onLocationChange={(lat, lng) => {
                        setLatitude(lat.toString());
                        setLongitude(lng.toString());
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commute Tab */}
          <TabsContent value="commute">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="h-5 w-5" />
                  Commute Options
                </CardTitle>
                <CardDescription>Add nearby transport links and travel times</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4>Nearest Train Station</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trainStation">Station Name</Label>
                      <Input
                        id="trainStation"
                        placeholder="e.g., King's Cross"
                        value={trainStation}
                        onChange={(e) => setTrainStation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trainDistance">Distance</Label>
                      <Input
                        id="trainDistance"
                        placeholder="e.g., 0.5 miles"
                        value={trainDistance}
                        onChange={(e) => setTrainDistance(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trainWalkTime">Walk Time</Label>
                      <Input
                        id="trainWalkTime"
                        placeholder="e.g., 10 mins"
                        value={trainWalkTime}
                        onChange={(e) => setTrainWalkTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4>Bus Stops</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="busCount">Number of Bus Stops</Label>
                      <Input
                        id="busCount"
                        type="number"
                        placeholder="e.g., 3"
                        value={busCount}
                        onChange={(e) => setBusCount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="busDistance">Nearest Distance</Label>
                      <Input
                        id="busDistance"
                        placeholder="e.g., 200m"
                        value={busDistance}
                        onChange={(e) => setBusDistance(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4>Motorway Access</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motorway">Motorway Name</Label>
                      <Input
                        id="motorway"
                        placeholder="e.g., M25"
                        value={motorway}
                        onChange={(e) => setMotorway(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motorwayDistance">Distance</Label>
                      <Input
                        id="motorwayDistance"
                        placeholder="e.g., 2 miles"
                        value={motorwayDistance}
                        onChange={(e) => setMotorwayDistance(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4>Airport</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="airport">Airport Name</Label>
                      <Input
                        id="airport"
                        placeholder="e.g., Heathrow"
                        value={airport}
                        onChange={(e) => setAirport(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="airportDistance">Distance</Label>
                      <Input
                        id="airportDistance"
                        placeholder="e.g., 15 miles"
                        value={airportDistance}
                        onChange={(e) => setAirportDistance(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle">
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle & Location Scores</CardTitle>
                <CardDescription>Rate the neighborhood characteristics (0-100)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4>Neighborhood Vibe</h4>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhoodDescription">Description</Label>
                    <Textarea
                      id="neighborhoodDescription"
                      placeholder="Describe the neighborhood atmosphere..."
                      value={neighborhoodDescription}
                      onChange={(e) => setNeighborhoodDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Neighborhood Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Family-Friendly, Trendy, Quiet"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {neighborhoodTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="pr-1">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Neighborhood Rating: {neighborhoodRating}/5</Label>
                    <Slider
                      value={[neighborhoodRating]}
                      onValueChange={(value) => setNeighborhoodRating(value[0])}
                      min={1}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Noise Level</Label>
                    <Select value={noiseLevel} onValueChange={setNoiseLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiet">Quiet</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="noisy">Noisy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Walk Score: {walkScore}</Label>
                    <Slider
                      value={[walkScore]}
                      onValueChange={(value) => setWalkScore(value[0])}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Transit Score: {transitScore}</Label>
                    <Slider
                      value={[transitScore]}
                      onValueChange={(value) => setTransitScore(value[0])}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bike Score: {bikeScore}</Label>
                    <Slider
                      value={[bikeScore]}
                      onValueChange={(value) => setBikeScore(value[0])}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>School Rating: {schoolRating}</Label>
                    <Slider
                      value={[schoolRating]}
                      onValueChange={(value) => setSchoolRating(value[0])}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Restaurant Rating: {restaurantRating}</Label>
                    <Slider
                      value={[restaurantRating]}
                      onValueChange={(value) => setRestaurantRating(value[0])}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shopping Rating: {shoppingRating}</Label>
                    <Slider
                      value={[shoppingRating]}
                      onValueChange={(value) => setShoppingRating(value[0])}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nightlife Rating: {nightlifeRating}</Label>
                    <Slider
                      value={[nightlifeRating]}
                      onValueChange={(value) => setNightlifeRating(value[0])}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Parks Rating: {parksRating}</Label>
                    <Slider
                      value={[parksRating]}
                      onValueChange={(value) => setParksRating(value[0])}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Neighborhood Demographics
                </CardTitle>
                <CardDescription>Provide demographic information about the area</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="population">Population</Label>
                    <Input
                      id="population"
                      type="number"
                      placeholder="e.g., 50000"
                      value={population}
                      onChange={(e) => setPopulation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medianAge">Median Age</Label>
                    <Input
                      id="medianAge"
                      type="number"
                      placeholder="e.g., 35"
                      value={medianAge}
                      onChange={(e) => setMedianAge(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medianIncome">Median Income (£)</Label>
                    <Input
                      id="medianIncome"
                      type="number"
                      placeholder="e.g., 45000"
                      value={medianIncome}
                      onChange={(e) => setMedianIncome(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentRate">Employment Rate (%)</Label>
                    <Input
                      id="employmentRate"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 94.5"
                      value={employmentRate}
                      onChange={(e) => setEmploymentRate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">Education Level</Label>
                    <Input
                      id="educationLevel"
                      placeholder="e.g., Bachelor's Degree"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crimeRate">Crime Rate</Label>
                    <Select value={crimeRate} onValueChange={setCrimeRate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Insights
                </CardTitle>
                <CardDescription>Provide investment and market data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rentalYield">Rental Yield (%)</Label>
                    <Input
                      id="rentalYield"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 4.5"
                      value={rentalYield}
                      onChange={(e) => setRentalYield(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appreciationRate">Appreciation Rate (%/year)</Label>
                    <Input
                      id="appreciationRate"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 3.2"
                      value={appreciationRate}
                      onChange={(e) => setAppreciationRate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketTrend">Market Trend</Label>
                    <Select value={marketTrend} onValueChange={(value: 'rising' | 'stable' | 'declining') => setMarketTrend(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rising">Rising</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="declining">Declining</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rentalDemand">Rental Demand</Label>
                    <Select value={rentalDemand} onValueChange={(value: 'high' | 'medium' | 'low') => setRentalDemand(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comparableProperties">Comparable Properties</Label>
                    <Input
                      id="comparableProperties"
                      type="number"
                      placeholder="e.g., 15"
                      value={comparableProperties}
                      onChange={(e) => setComparableProperties(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price per Sqft</Label>
                    <Input
                      value={price && area ? `£${(parseFloat(price) / parseFloat(area)).toFixed(2)}` : '£0'}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Submitting...' : 'Submit Property for Review'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/agent-dashboard')}
                size="lg"
              >
                Cancel
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Your property will be reviewed by an admin before appearing in search results
            </p>
          </CardContent>
        </Card>

        {/* Validation Dialog */}
        <AlertDialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Please Fill Up the Form
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>The following required fields are missing:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {missingFields.map((field) => (
                    <li key={field} className="text-red-600">{field}</li>
                  ))}
                </ul>
                <p className="mt-3">Please complete all required fields before submitting.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowValidationDialog(false)}>
                OK, I'll Fill Them In
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}