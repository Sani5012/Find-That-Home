import { supabase } from '../lib/supabaseClient';
import { Property, Alert as AlertType, RentalOffer, RentalOfferStatus } from '../types/property';

interface AgentRow {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  agency_name: string | null;
}

interface PropertyAgentRow {
  agent_id: number | null;
  agents: AgentRow | null;
}

interface PropertyRow {
  id: number;
  title: string | null;
  description: string | null;
  price: number | null;
  location: string | null;
  city: string | null;
  postcode: string | null;
  bedrooms: number | null;
  property_type: string | null;
  near_park: boolean | null;
  near_school: boolean | null;
  noise_level: string | null;
  image_url: string | null;
  virtual_tour_link: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  property_agent: PropertyAgentRow[] | null;
}

interface UserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  created_at: string | null;
}

interface AlertRow {
  id: number;
  user_id: string | null;
  property_id: number | null;
  message: string | null;
  created_at: string | null;
  type?: string | null;
  read?: boolean | null;
}

interface OfferRow {
  id: number;
  user_id: string | null;
  property_id: number | null;
  offer_type: string | null;
  status: string | null;
  submitted_at: string | null;
  property: PropertyRow | null;
  applicant: UserRow | null;
}

interface LegalProcessRow {
  id: number;
  offer_id: number | null;
  process_type: string | null;
  assigned_to: string | null;
  status: string | null;
  credit_check: boolean | null;
  deposit_amount: number | null;
  payment_reference: string | null;
  started_at: string | null;
  completed_at: string | null;
  offer: OfferRow | null;
}

export interface LegalProcessRecord {
  id: string;
  processType?: string;
  status?: string;
  assignedTo?: string;
  creditCheck?: boolean;
  depositAmount?: number;
  paymentReference?: string;
  startedAt?: string;
  completedAt?: string;
  offer?: RentalOffer;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=800';

const OFFER_SELECT = `
  id,
  user_id,
  property_id,
  offer_type,
  status,
  submitted_at,
  property:properties (
    *,
    property_agent:property_agent(
      agent_id,
      agents(
        id,
        name,
        email,
        phone,
        agency_name
      )
    )
  ),
  applicant:users(
    id,
    email,
    first_name,
    last_name,
    phone
  )
`;

const LEGAL_PROCESS_SELECT = `
  id,
  offer_id,
  process_type,
  assigned_to,
  status,
  credit_check,
  deposit_amount,
  payment_reference,
  started_at,
  completed_at,
  offer:offers (
    ${OFFER_SELECT}
  )
`;

const normalizeNoiseLevel = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('quiet')) return 25;
  if (normalized.includes('moderate')) return 50;
  if (normalized.includes('noisy') || normalized.includes('busy')) return 75;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const normalizeListingType = (value: string | null): 'rent' | 'sale' => {
  if (!value) return 'rent';
  const normalized = value.toLowerCase();
  if (normalized.includes('rent') || normalized.includes('lease')) {
    return 'rent';
  }
  return 'sale';
};

const normalizeOfferStatus = (value: string | null): RentalOfferStatus => {
  const normalized = (value ?? '').toLowerCase();
  const statuses: RentalOfferStatus[] = ['pending', 'accepted', 'rejected', 'countered', 'completed', 'in-progress', 'submitted'];
  if (statuses.includes(normalized as RentalOfferStatus)) {
    return normalized as RentalOfferStatus;
  }
  return 'pending';
};

const mapOfferRowToRentalOffer = (row: OfferRow): RentalOffer => {
  const property = row.property ? mapPropertyRowToProperty(row.property) : undefined;
  const buyerName = row.applicant
    ? `${row.applicant.first_name ?? ''} ${row.applicant.last_name ?? ''}`.trim() || row.applicant.email
    : undefined;

  return {
    id: row.id?.toString() ?? crypto.randomUUID(),
    propertyId: row.property_id?.toString() ?? '',
    userId: row.user_id ?? '',
    status: normalizeOfferStatus(row.status),
    offerType: row.offer_type ?? undefined,
    createdAt: row.submitted_at ?? new Date().toISOString(),
    property,
    buyerEmail: row.applicant?.email ?? undefined,
    buyerName: buyerName ?? undefined,
    offeredRent: property?.price,
    offeredPrice: property?.price,
  };
};

const mapLegalProcessRowToRecord = (row: LegalProcessRow): LegalProcessRecord => ({
  id: row.id?.toString() ?? crypto.randomUUID(),
  processType: row.process_type ?? undefined,
  status: row.status ?? undefined,
  assignedTo: row.assigned_to ?? undefined,
  creditCheck: row.credit_check ?? undefined,
  depositAmount: row.deposit_amount ?? undefined,
  paymentReference: row.payment_reference ?? undefined,
  startedAt: row.started_at ?? undefined,
  completedAt: row.completed_at ?? undefined,
  offer: row.offer ? mapOfferRowToRentalOffer(row.offer) : undefined,
});

const mapPropertyRowToProperty = (row: PropertyRow): Property => {
  const listingType = normalizeListingType(row.property_type);
  const coordinatesAvailable = typeof row.latitude === 'number' && typeof row.longitude === 'number';

  return {
    id: row.id?.toString() ?? crypto.randomUUID(),
    title: row.title ?? 'Untitled property',
    price: row.price ?? 0,
    location: row.location
      ? {
          address: row.location,
          city: row.city ?? 'Unknown',
          postcode: row.postcode ?? '',
          coordinates: {
            lat: row.latitude ?? 0,
            lng: row.longitude ?? 0,
          },
        }
      : undefined,
    city: row.city ?? undefined,
    type: listingType,
    bedrooms: row.bedrooms ?? 0,
    bathrooms: 1,
    sqft: undefined,
    images: row.image_url ? [row.image_url] : [DEFAULT_IMAGE],
    description: row.description ?? 'No description available.',
    amenities: [],
    features: [],
    yearBuilt: undefined,
    available: true,
    listingType,
    coordinates: coordinatesAvailable
      ? { lat: row.latitude as number, lng: row.longitude as number }
      : undefined,
    nearbySchools: [],
    commuteTime: undefined,
    neighborhoodVibe: undefined,
    noiseLevel: normalizeNoiseLevel(row.noise_level),
    walkability: undefined,
    transitScore: undefined,
    lifestyleTags: [],
    lifestyleScores: {},
    commuteOptions: [],
    nearbyAmenities: [],
    demographics: {},
    propertyTax: 0,
    hoaFees: 0,
    utilities: 0,
    insurance: 0,
    priceHistory: [],
    priceForecasts: [],
    rentalYield: undefined,
    investmentScore: undefined,
    appreciationRate: undefined,
    investmentInsights: {},
    acceptingOffers: true,
    landlordId: undefined,
    agentId: row.property_agent?.[0]?.agent_id?.toString(),
    agentName: row.property_agent?.[0]?.agents?.name ?? undefined,
    agentEmail: row.property_agent?.[0]?.agents?.email ?? undefined,
    agentPhone: row.property_agent?.[0]?.agents?.phone ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.created_at ?? undefined,
    approvalStatus: 'approved',
  } as Property;
};

const fetchAgentIdForUser = async (userId: string | undefined, email?: string | null) => {
  if (!userId && !email) return null;

  const query = supabase
    .from<AgentRow>('agents')
    .select('id, email')
    .limit(1);

  if (email) {
    query.eq('email', email);
  }

  const { data, error } = await query.maybeSingle();
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data?.id ?? null;
};

export const propertyStore = {
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase
      .from<PropertyRow>('properties')
      .select(`
        *,
        property_agent:property_agent(
          agent_id,
          agents(
            id,
            name,
            email,
            phone,
            agency_name
          )
        )
      `);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapPropertyRowToProperty);
  },

  async getApproved(): Promise<Property[]> {
    return this.getAll();
  },

  async getById(id: string): Promise<Property | null> {
    const numericId = Number(id);
    const query = supabase
      .from<PropertyRow>('properties')
      .select(`
        *,
        property_agent:property_agent(
          agent_id,
          agents(
            id,
            name,
            email,
            phone,
            agency_name
          )
        )
      `)
      .eq('id', numericId)
      .maybeSingle();

    const { data, error } = await query;
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return data ? mapPropertyRowToProperty(data) : null;
  },

  async getByAgent(userId: string, email?: string | null): Promise<Property[]> {
    const agentId = await fetchAgentIdForUser(userId, email);
    if (!agentId) return [];

    const { data, error } = await supabase
      .from<PropertyRow>('properties')
      .select(`
        *,
        property_agent:property_agent(
          agent_id,
          agents(
            id,
            name,
            email,
            phone,
            agency_name
          )
        )
      `)
      .eq('property_agent.agent_id', agentId);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapPropertyRowToProperty);
  },

  async create(input: {
    title: string;
    description: string;
    listingType: 'rent' | 'sale';
    price: number;
    bedrooms: number;
    bathrooms?: number;
    address: string;
    city: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
    image?: string;
    agentUserId?: string;
    agentEmail?: string | null;
    agentName?: string | null;
    agentPhone?: string | null;
  }): Promise<Property> {
    const agentId = await fetchAgentIdForUser(input.agentUserId, input.agentEmail);

    const insertPayload = {
      title: input.title,
      description: input.description,
      price: input.price,
      location: input.address,
      city: input.city,
      postcode: input.postcode,
      bedrooms: input.bedrooms,
      property_type: input.listingType,
      noise_level: null,
      image_url: input.image ?? DEFAULT_IMAGE,
      virtual_tour_link: null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    };

    const { data, error } = await supabase
      .from<PropertyRow>('properties')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (agentId) {
      await supabase.from('property_agent').insert({
        property_id: data.id,
        agent_id: agentId,
      });
    }

    return this.getById(data.id.toString()) as Promise<Property>;
  },

  async update(id: string, updates: Partial<Property>): Promise<Property> {
    const numericId = Number(id);
    const updatePayload: Record<string, any> = {};

    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.price !== undefined) updatePayload.price = updates.price;
    if (updates.location && typeof updates.location === 'object') {
      updatePayload.location = updates.location.address;
      updatePayload.city = updates.location.city;
      updatePayload.postcode = updates.location.postcode;
      updatePayload.latitude = updates.location.coordinates?.lat ?? null;
      updatePayload.longitude = updates.location.coordinates?.lng ?? null;
    }
    if (updates.bedrooms !== undefined) updatePayload.bedrooms = updates.bedrooms;
    if (updates.listingType) updatePayload.property_type = updates.listingType;
    if (updates.images && updates.images.length > 0) updatePayload.image_url = updates.images[0];

    const { error } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', numericId);

    if (error) {
      throw new Error(error.message);
    }

    const refreshed = await this.getById(id);
    if (!refreshed) {
      throw new Error('Failed to fetch updated property');
    }
    return refreshed;
  },

  async remove(id: string): Promise<void> {
    const numericId = Number(id);
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', numericId);
    if (error) {
      throw new Error(error.message);
    }
  },

  async search(filters: {
    type?: 'rent' | 'sale';
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
  }): Promise<Property[]> {
    const properties = await this.getApproved();
    return properties.filter(property => {
      if (filters.type && property.listingType !== filters.type) {
        return false;
      }
      if (filters.city) {
        const city = property.city ?? property.location?.city;
        if (!city || !city.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
      }
      if (filters.minPrice !== undefined && property.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && property.price > filters.maxPrice) {
        return false;
      }
      if (filters.bedrooms && property.bedrooms < filters.bedrooms) {
        return false;
      }
      if (filters.bathrooms && (property.bathrooms ?? 0) < filters.bathrooms) {
        return false;
      }
      return true;
    });
  },

  async nearby(lat: number, lng: number, radiusKm: number): Promise<Property[]> {
    const properties = await this.getApproved();
    const toRad = (degrees: number) => degrees * (Math.PI / 180);
    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return properties.filter(property => {
      const coords = property.coordinates || property.location?.coordinates;
      if (!coords) return false;
      const distance = haversine(lat, lng, coords.lat, coords.lng);
      return distance <= radiusKm;
    });
  },
};

export const userStore = {
  async getAll(): Promise<UserRow[]> {
    const { data, error } = await supabase
      .from<UserRow>('users')
      .select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data ?? [];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },
};

export const alertStore = {
  async getByUser(userId: string): Promise<AlertType[]> {
    const { data, error } = await supabase
      .from<AlertRow>('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(alert => ({
      id: alert.id.toString(),
      type: (alert.type as AlertType['type']) ?? 'market-update',
      message: alert.message ?? '',
      date: alert.created_at ?? new Date().toISOString(),
      propertyId: alert.property_id?.toString(),
      read: alert.read ?? false,
    }));
  },

  async create(alert: Omit<AlertType, 'id' | 'date' | 'read'> & { userId: string; read?: boolean }): Promise<AlertType> {
    const insertPayload = {
      user_id: alert.userId,
      property_id: alert.propertyId ? Number(alert.propertyId) : null,
      message: alert.message,
      type: alert.type,
      read: alert.read ?? false,
    };

    const { data, error } = await supabase
      .from<AlertRow>('alerts')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id.toString(),
      type: (data.type as AlertType['type']) ?? 'market-update',
      message: data.message ?? '',
      date: data.created_at ?? new Date().toISOString(),
      propertyId: data.property_id?.toString(),
      read: data.read ?? false,
    };
  },

  async markAsRead(alertId: string): Promise<void> {
    const numericId = Number(alertId);
    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', numericId);
    if (error) {
      throw new Error(error.message);
    }
  },

  async remove(alertId: string): Promise<void> {
    const numericId = Number(alertId);
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', numericId);
    if (error) {
      throw new Error(error.message);
    }
  },
};

export const offerStore = {
  async getByUser(userId: string | undefined): Promise<RentalOffer[]> {
    if (!userId) return [];

    const { data, error } = await supabase
      .from<OfferRow>('offers')
      .select(OFFER_SELECT)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapOfferRowToRentalOffer);
  },

  async getByPropertyIds(propertyIds: number[]): Promise<RentalOffer[]> {
    if (!propertyIds.length) return [];

    const { data, error } = await supabase
      .from<OfferRow>('offers')
      .select(OFFER_SELECT)
      .in('property_id', propertyIds)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapOfferRowToRentalOffer);
  },

  async getById(id: string): Promise<RentalOffer | null> {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return null;
    }

    const { data, error } = await supabase
      .from<OfferRow>('offers')
      .select(OFFER_SELECT)
      .eq('id', numericId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data ? mapOfferRowToRentalOffer(data) : null;
  },

  async create(input: {
    userId: string;
    propertyId: string;
    offerType?: 'rent' | 'sale' | 'purchase' | string;
    status?: RentalOfferStatus;
  }): Promise<RentalOffer> {
    const numericPropertyId = Number(input.propertyId);
    if (!Number.isFinite(numericPropertyId)) {
      throw new Error('Invalid property identifier');
    }

    const insertPayload = {
      user_id: input.userId,
      property_id: numericPropertyId,
      offer_type: input.offerType ?? 'rent',
      status: input.status ?? 'pending',
    } satisfies Partial<OfferRow>;

    const { data, error } = await supabase
      .from<OfferRow>('offers')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const created = await this.getById(data.id.toString());
    if (!created) {
      throw new Error('Failed to fetch created offer');
    }
    return created;
  },

  async updateStatus(id: string, status: RentalOfferStatus): Promise<RentalOffer> {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      throw new Error('Invalid offer identifier');
    }

    const { error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', numericId);

    if (error) {
      throw new Error(error.message);
    }

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error('Failed to fetch updated offer');
    }
    return updated;
  },
};

export const legalProcessStore = {
  async getByOfferIds(offerIds: number[]): Promise<LegalProcessRecord[]> {
    if (!offerIds.length) return [];

    const { data, error } = await supabase
      .from<LegalProcessRow>('legal_process')
      .select(LEGAL_PROCESS_SELECT)
      .in('offer_id', offerIds);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapLegalProcessRowToRecord);
  },
};

export const statsStore = {
  async getOverview() {
    const [users, properties] = await Promise.all([
      userStore.getAll(),
      propertyStore.getAll(),
    ]);

    const usersByRole = users.reduce(
      (acc, user) => {
        const role = (user.role as keyof typeof acc) ?? 'tenant';
        if (!acc[role]) {
          acc[role] = 0;
        }
        acc[role]! += 1;
        return acc;
      },
      { tenant: 0, landlord: 0, buyer: 0, admin: 0, agent: 0 } as Record<string, number>
    );

    const propertiesByStatus = {
      pending: 0,
      approved: properties.length,
      rejected: 0,
    };

    return {
      totalUsers: users.length,
      usersByRole,
      totalProperties: properties.length,
      propertiesByStatus,
    };
  },
};
