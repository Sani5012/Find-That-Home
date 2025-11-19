// localStorage utility for managing all app data

export interface Property {
  id: string;
  title: string;
  type: 'rent' | 'sale';
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  features: string[];
  images: string[];
  location: {
    address: string;
    city: string;
    postcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  // New enhanced fields
  commuteOptions?: {
    trainStation?: { name: string; distance: string; walkTime: string };
    busStops?: { count: number; nearestDistance: string };
    motorway?: { name: string; distance: string };
    airport?: { name: string; distance: string };
  };
  neighborhoodVibe?: {
    description: string;
    tags: string[];
    rating: number;
    noiseLevel?: 'quiet' | 'moderate' | 'noisy';
  };
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
  demographics?: {
    population?: number;
    medianAge?: number;
    medianIncome?: number;
    employmentRate?: number;
    educationLevel?: string;
    crimeRate?: string;
  };
  investmentInsights?: {
    averageRentalYield?: number;
    propertyAppreciation?: number;
    marketTrend?: 'rising' | 'stable' | 'declining';
    rentalDemand?: 'high' | 'medium' | 'low';
    comparableProperties?: number;
    pricePerSqFt?: number;
  };
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'tenant' | 'landlord' | 'buyer' | 'agent' | 'admin';
  createdAt: string;
  income?: number;
  incomeType?: 'monthly' | 'yearly';
  preferredPropertyType?: 'rent' | 'buy';
  preferences?: {
    propertyType?: string[];
    priceRange?: { min: number; max: number };
    locations?: string[];
    bedrooms?: number;
  };
}

export interface Alert {
  id: string;
  userId: string;
  propertyId: string;
  type: 'nearby' | 'price_change' | 'new_listing';
  message: string;
  read: boolean;
  createdAt: string;
}

// Initialize localStorage with default data structure
export const initializeStorage = () => {
  if (!localStorage.getItem('users')) {
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        email: 'admin@findthathome.com',
        password: 'admin123',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tenant-1',
        email: 'tenant@test.com',
        password: 'tenant123',
        name: 'John Tenant',
        firstName: 'John',
        lastName: 'Tenant',
        phone: '+44 20 1234 5678',
        role: 'tenant',
        createdAt: new Date().toISOString(),
        preferredPropertyType: 'rent',
        incomeType: 'monthly',
      },
      {
        id: 'landlord-1',
        email: 'landlord@test.com',
        password: 'landlord123',
        name: 'Sarah Landlord',
        firstName: 'Sarah',
        lastName: 'Landlord',
        phone: '+44 20 2345 6789',
        role: 'landlord',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'agent-1',
        email: 'agent@test.com',
        password: 'agent123',
        name: 'Michael Agent',
        firstName: 'Michael',
        lastName: 'Agent',
        phone: '+44 20 3456 7890',
        role: 'agent',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'buyer-1',
        email: 'buyer@test.com',
        password: 'buyer123',
        name: 'Emma Buyer',
        firstName: 'Emma',
        lastName: 'Buyer',
        phone: '+44 20 4567 8901',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        preferredPropertyType: 'buy',
      },
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem('properties')) {
    localStorage.setItem('properties', JSON.stringify([]));
  }
  if (!localStorage.getItem('alerts')) {
    localStorage.setItem('alerts', JSON.stringify([]));
  }
};

// User Management
export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  localStorage.setItem('users', JSON.stringify(users));
  return users[index];
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  
  localStorage.setItem('users', JSON.stringify(filtered));
  return true;
};

// Property Management
export const getProperties = (): Property[] => {
  const properties = localStorage.getItem('properties');
  return properties ? JSON.parse(properties) : [];
};

// Alias for consistency with API naming
export const getAllProperties = getProperties;

export const getApprovedProperties = (): Property[] => {
  return getProperties().filter(p => p.approvalStatus === 'approved');
};

export const getPropertyById = (id: string): Property | null => {
  const properties = getProperties();
  return properties.find(p => p.id === id) || null;
};

export const getPropertiesByAgent = (agentId: string): Property[] => {
  return getProperties().filter(p => p.agentId === agentId);
};

export const createProperty = (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property => {
  const properties = getProperties();
  const newProperty: Property = {
    ...propertyData,
    id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  properties.push(newProperty);
  localStorage.setItem('properties', JSON.stringify(properties));
  return newProperty;
};

export const updateProperty = (id: string, updates: Partial<Property>): Property | null => {
  const properties = getProperties();
  const index = properties.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  properties[index] = { 
    ...properties[index], 
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('properties', JSON.stringify(properties));
  return properties[index];
};

export const deleteProperty = (id: string): boolean => {
  const properties = getProperties();
  const filtered = properties.filter(p => p.id !== id);
  if (filtered.length === properties.length) return false;
  
  localStorage.setItem('properties', JSON.stringify(filtered));
  return true;
};

// Alert Management
export const getAlerts = (): Alert[] => {
  const alerts = localStorage.getItem('alerts');
  return alerts ? JSON.parse(alerts) : [];
};

export const getAlertsByUser = (userId: string): Alert[] => {
  return getAlerts().filter(a => a.userId === userId);
};

export const createAlert = (alertData: Omit<Alert, 'id' | 'createdAt'>): Alert => {
  const alerts = getAlerts();
  const newAlert: Alert = {
    ...alertData,
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  localStorage.setItem('alerts', JSON.stringify(alerts));
  return newAlert;
};

export const markAlertAsRead = (id: string): boolean => {
  const alerts = getAlerts();
  const index = alerts.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  alerts[index].read = true;
  localStorage.setItem('alerts', JSON.stringify(alerts));
  return true;
};

export const deleteAlert = (id: string): boolean => {
  const alerts = getAlerts();
  const filtered = alerts.filter(a => a.id !== id);
  if (filtered.length === alerts.length) return false;
  
  localStorage.setItem('alerts', JSON.stringify(filtered));
  return true;
};

// Search Properties
export const searchProperties = (filters: {
  type?: 'rent' | 'sale';
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}): Property[] => {
  let properties = getApprovedProperties();
  
  if (filters.type) {
    properties = properties.filter(p => p.type === filters.type);
  }
  if (filters.city) {
    properties = properties.filter(p => 
      p.location.city.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  if (filters.minPrice !== undefined) {
    properties = properties.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    properties = properties.filter(p => p.price <= filters.maxPrice!);
  }
  if (filters.bedrooms) {
    properties = properties.filter(p => p.bedrooms >= filters.bedrooms!);
  }
  if (filters.bathrooms) {
    properties = properties.filter(p => p.bathrooms >= filters.bathrooms!);
  }
  
  return properties;
};

// Get nearby properties based on coordinates
export const getNearbyProperties = (
  lat: number,
  lng: number,
  radiusKm: number = 5
): Property[] => {
  const properties = getApprovedProperties();
  
  return properties.filter(property => {
    const distance = calculateDistance(
      lat,
      lng,
      property.location.coordinates.lat,
      property.location.coordinates.lng
    );
    return distance <= radiusKm;
  });
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Stats for admin/agent dashboards
export const getStats = () => {
  const users = getUsers();
  const properties = getProperties();
  
  return {
    totalUsers: users.length,
    usersByRole: {
      tenant: users.filter(u => u.role === 'tenant').length,
      landlord: users.filter(u => u.role === 'landlord').length,
      buyer: users.filter(u => u.role === 'buyer').length,
      agent: users.filter(u => u.role === 'agent').length,
      admin: users.filter(u => u.role === 'admin').length,
    },
    totalProperties: properties.length,
    propertiesByStatus: {
      pending: properties.filter(p => p.approvalStatus === 'pending').length,
      approved: properties.filter(p => p.approvalStatus === 'approved').length,
      rejected: properties.filter(p => p.approvalStatus === 'rejected').length,
    },
    propertiesByType: {
      rent: properties.filter(p => p.type === 'rent').length,
      sale: properties.filter(p => p.type === 'sale').length,
    },
  };
};

// Clear all data (admin only)
export const clearAllData = () => {
  localStorage.setItem('properties', JSON.stringify([]));
  const users = getUsers().filter(u => u.role === 'admin');
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('alerts', JSON.stringify([]));
};