export interface Property {
  id: string;
  title: string;
  price: number;
  location?: string | {  // Support both old (string) and new (object) formats
    address: string;
    city: string;
    postcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  city?: string;
  type?: 'house' | 'apartment' | 'condo' | 'townhouse' | 'rent' | 'sale';  // Support both property type and listing type
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  area?: number;  // Support both sqft and area
  images: string[];
  description: string;
  amenities?: string[];
  features?: string[];  // Support both amenities and features
  yearBuilt?: number;
  available?: boolean;
  listingType?: 'rent' | 'sale';
  coordinates?: { lat: number; lng: number };
  nearbySchools?: string[];
  commuteTime?: string;
  neighborhoodVibe?: string | {  // Support both old (string) and new (object) formats
    description: string;
    tags: string[];
    rating: number;
    noiseLevel?: 'quiet' | 'moderate' | 'noisy';
  };
  
  // Lifestyle & Location Data
  noiseLevel?: number; // 0-100 (0 = quiet, 50 = moderate, 100 = very noisy)
  walkability?: number; // 0-100
  transitScore?: number; // 0-100
  lifestyleTags?: string[]; // e.g., "Family-friendly", "Nightlife", "Artsy", "Professional"
  
  // Support new lifestyleScores structure
  lifestyleScores?: {
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
    schoolRating?: number;
    restaurantRating?: number;
    shoppingRating?: number;
    nightlifeRating?: number;
    parksRating?: number;
  };
  
  // Commute & Amenities - support both formats
  commuteOptions?: ({
    destination: string;
    time: number; // minutes
    mode: 'driving' | 'public-transit' | 'walking' | 'cycling';
  }[]) | {
    trainStation?: { name: string; distance: string; walkTime: string };
    busStops?: { count: number; nearestDistance: string };
    motorway?: { name: string; distance: string };
    airport?: { name: string; distance: string };
  };
  
  nearbyAmenities?: {
    type: string; // e.g., "Restaurant", "Gym", "Park", "Shopping"
    name: string;
    distance: number; // in miles/km
  }[];
  
  // Demographics & Vibe - support both formats
  demographics?: {
    primaryEthnicity?: string;
    ethnicityBreakdown?: { [key: string]: number }; // percentages
    medianAge?: number;
    medianIncome?: number;
    population?: number;
    employmentRate?: number;
    educationLevel?: string;
    crimeRate?: string;
  };
  
  // Financial Data
  propertyTax?: number; // annual
  hoaFees?: number; // monthly
  utilities?: number; // estimated monthly
  insurance?: number; // estimated monthly
  
  // Investment & Market Data
  priceHistory?: { date: string; price: number }[];
  priceForecasts?: { date: string; predictedPrice: number }[];
  rentalYield?: number; // percentage
  investmentScore?: number; // 0-100
  appreciationRate?: number; // percentage per year
  
  // Support new investmentInsights structure
  investmentInsights?: {
    averageRentalYield?: number;
    propertyAppreciation?: number;
    marketTrend?: 'rising' | 'stable' | 'declining';
    rentalDemand?: 'high' | 'medium' | 'low';
    comparableProperties?: number;
    pricePerSqFt?: number;
  };
  
  // Rental Application (for rent properties)
  acceptingOffers?: boolean;
  landlordId?: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreferences {
  priceRange: [number, number];
  bedrooms: number[];
  propertyTypes: string[];
  locations: string[];
  lifestyle: {
    commuteTime?: string;
    neighborhoodType?: string;
    amenities?: string[];
    maxNoiseLevel?: number;
    minWalkability?: number;
    preferredVibes?: string[];
  };
  financial: {
    monthlyIncome?: number;
    monthlyDisposableIncome?: number; // After all expenses
    downPayment?: number;
    creditScore?: number;
    maxMonthlyPayment?: number;
  };
  demographics?: {
    preferredDemographics?: string[];
  };
  gpsAlerts?: boolean;
}

export interface RentalOffer {
  id: string;
  propertyId: string;
  userId: string;
  offeredRent: number;
  moveInDate: string;
  leaseTerm: number; // months
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface RentalApplication {
  id: string;
  offerId: string;
  propertyId: string;
  userId: string;
  status: 'pending' | 'credit-check' | 'references' | 'approved' | 'rejected';
  creditCheckComplete: boolean;
  referencesComplete: boolean;
  depositPaid: boolean;
  firstMonthPaid: boolean;
  directDebitSetup: boolean;
  documents: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
  }[];
}

export interface Alert {
  id: string;
  type: 'new-listing' | 'price-drop' | 'market-update' | 'nearby-property' | 'gps-alert';
  message: string;
  date: string;
  propertyId?: string;
  read: boolean;
  distance?: number; // in miles for GPS alerts
}

// Purchase Offer types
export interface PurchaseOffer {
  id: string;
  propertyId: string;
  userId: string;
  offeredPrice: number;
  offerDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  message: string;
  conditions?: string[];
  counterOffer?: number;
  expiryDate: string;
}

export interface PurchaseTransaction {
  id: string;
  offerId: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  status: 'offer-accepted' | 'survey-booked' | 'survey-complete' | 'mortgage-approved' | 'contracts-exchanged' | 'completion' | 'completed';
  currentStep: number;
  totalSteps: number;
  surveyBooked: boolean;
  surveyComplete: boolean;
  mortgageApproved: boolean;
  contractsExchanged: boolean;
  completionDate?: string;
  documents: {
    id: string;
    name: string;
    type: 'survey' | 'mortgage' | 'contract' | 'id' | 'other';
    uploadedAt: string;
    signedAt?: string;
  }[];
  legalSteps: {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in-progress' | 'complete';
    completedAt?: string;
  }[];
}

export interface RentalContract {
  id: string;
  applicationId: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  status: 'draft' | 'awaiting-signatures' | 'signed' | 'active' | 'ended';
  tenantSigned: boolean;
  landlordSigned: boolean;
  depositScheme?: string; // e.g., "DPS", "MyDeposits", "TDS"
  depositProtected: boolean;
  terms: string[];
}

export interface GPSLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}