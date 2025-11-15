import { Property } from '../types/property';

// Single test property for development
export const mockProperties: Property[] = [
  {
    id: 'test-1',
    title: 'Modern 2-Bed Apartment in City Centre',
    price: 1200,
    location: 'City Centre, London',
    city: 'London',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    sqft: 850,
    images: [
      'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    description: 'Beautiful modern apartment in the heart of the city. Perfect for professionals.',
    amenities: ['Parking', 'Gym', 'Balcony', 'Central Heating'],
    yearBuilt: 2020,
    available: true,
    listingType: 'rent',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    nearbySchools: ['City Primary School'],
    commuteTime: '10 min to station',
    neighborhoodVibe: 'Modern, vibrant',
    noiseLevel: 45,
    walkability: 90,
    transitScore: 95,
    lifestyleTags: ['Professional', 'Urban', 'Modern'],
    commuteOptions: [
      { destination: 'Central Station', time: 10, mode: 'walking' }
    ],
    nearbyAmenities: [
      { type: 'Restaurant', name: 'Local Cafe', distance: 0.2 },
      { type: 'Gym', name: 'Fitness Centre', distance: 0.3 },
    ],
    demographics: {
      primaryEthnicity: 'Mixed',
      ethnicityBreakdown: {
        'White British': 45,
        'White Other': 25,
        'Asian': 15,
        'Black': 10,
        'Mixed': 5
      },
      medianAge: 32,
      medianIncome: 45000
    },
    propertyTax: 0,
    utilities: 150,
    insurance: 20,
    priceHistory: [
      { date: '2024-01', price: 1100 },
      { date: '2024-06', price: 1150 },
      { date: '2024-10', price: 1200 }
    ],
    priceForecasts: [
      { date: '2025-12', predictedPrice: 1250 }
    ],
    rentalYield: 4.5,
    investmentScore: 75,
    appreciationRate: 3.5,
    acceptingOffers: true,
    landlordId: 'landlord-001',
    agentId: 'agent-001'
  }
];
