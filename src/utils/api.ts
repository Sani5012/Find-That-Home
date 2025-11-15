// Local Storage API - replaces all backend/Supabase calls
// 
// ============================================================
// IMPORTANT: SUPABASE REMOVED
// ============================================================
// This application runs entirely on localStorage (browser-based storage).
// All Supabase and backend functionality has been removed.
// Data is stored locally in the browser and will persist until cleared.
// 
// Note: This is suitable for development/demo purposes.
// For production use with real users, consider implementing a proper backend.
// ============================================================

import * as storage from './localStorage';

// ============================================================
// AUTH API
// ============================================================

export const authAPI = {
  signup: async (email: string, password: string, name: string, role: 'tenant' | 'landlord' | 'buyer' | 'agent') => {
    // Check if user already exists
    const existingUser = storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user = storage.createUser({
      email,
      password,
      name,
      role,
    });

    // Return in API format
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'User created successfully',
    };
  },
};

// ============================================================
// USER API
// ============================================================

export const userAPI = {
  getProfile: async () => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const user = storage.getUserById(currentUserId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...profile } = user;
    return { profile };
  },

  updateProfile: async (updates: any) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const updatedUser = storage.updateUser(currentUserId, updates);
    if (!updatedUser) {
      throw new Error('Failed to update profile');
    }

    const { password, ...profile } = updatedUser;
    return { profile };
  },

  updatePreferences: async (preferences: any) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const updatedUser = storage.updateUser(currentUserId, { preferences });
    if (!updatedUser) {
      throw new Error('Failed to update preferences');
    }

    return { preferences: updatedUser.preferences };
  },

  getSavedProperties: async () => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const savedPropertyIds = JSON.parse(localStorage.getItem(`savedProperties_${currentUserId}`) || '[]');
    const properties = savedPropertyIds
      .map((id: string) => storage.getPropertyById(id))
      .filter((p: any) => p !== null);

    return { savedProperties: properties };
  },

  saveProperty: async (propertyId: string) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const savedPropertyIds = JSON.parse(localStorage.getItem(`savedProperties_${currentUserId}`) || '[]');
    if (!savedPropertyIds.includes(propertyId)) {
      savedPropertyIds.push(propertyId);
      localStorage.setItem(`savedProperties_${currentUserId}`, JSON.stringify(savedPropertyIds));
    }

    return { message: 'Property saved successfully' };
  },

  unsaveProperty: async (propertyId: string) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const savedPropertyIds = JSON.parse(localStorage.getItem(`savedProperties_${currentUserId}`) || '[]');
    const filtered = savedPropertyIds.filter((id: string) => id !== propertyId);
    localStorage.setItem(`savedProperties_${currentUserId}`, JSON.stringify(filtered));

    return { message: 'Property unsaved successfully' };
  },
};

// ============================================================
// PROPERTY API
// ============================================================

export const propertyAPI = {
  getProperties: async (filters?: any) => {
    let properties = filters ? storage.searchProperties(filters) : storage.getApprovedProperties();
    return { properties };
  },

  getProperty: async (propertyId: string) => {
    const property = storage.getPropertyById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    return { property };
  },

  createProperty: async (propertyData: any) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const user = storage.getUserById(currentUserId);
    if (!user) {
      throw new Error('User not found');
    }

    const property = storage.createProperty({
      ...propertyData,
      agentId: currentUserId,
      agentName: user.name,
      agentEmail: user.email,
      agentPhone: user.phone,
      approvalStatus: 'pending',
    });

    return { property };
  },

  updateProperty: async (propertyId: string, updates: any) => {
    const property = storage.updateProperty(propertyId, updates);
    if (!property) {
      throw new Error('Failed to update property');
    }
    return { property };
  },

  deleteProperty: async (propertyId: string) => {
    const success = storage.deleteProperty(propertyId);
    if (!success) {
      throw new Error('Failed to delete property');
    }
    return { message: 'Property deleted successfully' };
  },

  searchProperties: async (filters: any) => {
    const properties = storage.searchProperties(filters);
    return { properties };
  },

  getNearbyProperties: async (lat: number, lng: number, radiusKm: number) => {
    const properties = storage.getNearbyProperties(lat, lng, radiusKm);
    return { properties };
  },
};

// ============================================================
// LANDLORD API
// ============================================================

export const landlordAPI = {
  getProperties: async () => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const properties = storage.getPropertiesByAgent(currentUserId);
    return { properties };
  },

  createProperty: async (propertyData: any) => {
    return propertyAPI.createProperty(propertyData);
  },

  updateProperty: async (propertyId: string, updates: any) => {
    return propertyAPI.updateProperty(propertyId, updates);
  },
};

export const landlordDeleteAPI = {
  deleteProperty: async (propertyId: string) => {
    return propertyAPI.deleteProperty(propertyId);
  },
};

// ============================================================
// AGENT API
// ============================================================

export const agentAPI = {
  getProperties: async () => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const properties = storage.getPropertiesByAgent(currentUserId);
    return { properties };
  },

  createProperty: async (propertyData: any) => {
    return propertyAPI.createProperty(propertyData);
  },

  updateProperty: async (propertyId: string, updates: any) => {
    return propertyAPI.updateProperty(propertyId, updates);
  },

  deleteProperty: async (propertyId: string) => {
    return propertyAPI.deleteProperty(propertyId);
  },

  getAlerts: async () => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const alerts = storage.getAlertsByUser(currentUserId);
    return { alerts };
  },

  markAlertAsRead: async (alertId: string) => {
    const success = storage.markAlertAsRead(alertId);
    if (!success) {
      throw new Error('Failed to mark alert as read');
    }
    return { message: 'Alert marked as read' };
  },
};

// ============================================================
// ADMIN API
// ============================================================

export const adminAPI = {
  getUsers: async () => {
    const users = storage.getUsers();
    return { users };
  },

  getProperties: async () => {
    const properties = storage.getProperties();
    return { properties };
  },

  getStats: async () => {
    const stats = storage.getStats();
    return { stats };
  },

  approveProperty: async (propertyId: string) => {
    const property = storage.updateProperty(propertyId, { approvalStatus: 'approved' });
    if (!property) {
      throw new Error('Failed to approve property');
    }
    return { property };
  },

  rejectProperty: async (propertyId: string, reason: string) => {
    const property = storage.updateProperty(propertyId, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
    });
    if (!property) {
      throw new Error('Failed to reject property');
    }
    return { property };
  },

  deleteProperty: async (propertyId: string) => {
    return propertyAPI.deleteProperty(propertyId);
  },

  deleteUser: async (userId: string) => {
    const success = storage.deleteUser(userId);
    if (!success) {
      throw new Error('Failed to delete user');
    }
    return { message: 'User deleted successfully' };
  },

  clearAllData: async () => {
    storage.clearAllData();
    return { message: 'All data cleared successfully' };
  },
};

// ============================================================
// MESSAGING API
// ============================================================

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  propertyId?: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

export const messagingAPI = {
  getConversations: async () => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]') as Conversation[];
    const conversations = allConversations.filter(c => c.participants.includes(currentUserId));

    return { conversations };
  },

  createConversation: async (otherUserId: string, propertyId?: string) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const currentUser = storage.getUserById(currentUserId);
    const otherUser = storage.getUserById(otherUserId);

    if (!currentUser || !otherUser) {
      throw new Error('User not found');
    }

    // Check if conversation already exists
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]') as Conversation[];
    const existing = allConversations.find(c =>
      c.participants.includes(currentUserId) &&
      c.participants.includes(otherUserId) &&
      (!propertyId || c.propertyId === propertyId)
    );

    if (existing) {
      return { conversation: existing };
    }

    // Create new conversation
    const conversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      participants: [currentUserId, otherUserId],
      participantNames: {
        [currentUserId]: currentUser.name,
        [otherUserId]: otherUser.name,
      },
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };

    allConversations.push(conversation);
    localStorage.setItem('conversations', JSON.stringify(allConversations));

    return { conversation };
  },

  getMessages: async (conversationId: string) => {
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    const messages = allMessages.filter(m => m.conversationId === conversationId);

    return { messages };
  },

  sendMessage: async (conversationId: string, content: string) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const currentUser = storage.getUserById(currentUserId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: currentUserId,
      senderName: currentUser.name,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    allMessages.push(message);
    localStorage.setItem('messages', JSON.stringify(allMessages));

    // Update conversation with last message
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]') as Conversation[];
    const convIndex = allConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      allConversations[convIndex].lastMessage = content;
      allConversations[convIndex].lastMessageAt = message.createdAt;
      localStorage.setItem('conversations', JSON.stringify(allConversations));
    }

    return { message };
  },

  markAsRead: async (conversationId: string) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    const updated = allMessages.map(m => {
      if (m.conversationId === conversationId && m.senderId !== currentUserId) {
        return { ...m, read: true };
      }
      return m;
    });
    localStorage.setItem('messages', JSON.stringify(updated));

    // Update conversation unread count
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]') as Conversation[];
    const convIndex = allConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      allConversations[convIndex].unreadCount = 0;
      localStorage.setItem('conversations', JSON.stringify(allConversations));
    }

    return { message: 'Messages marked as read' };
  },
};

// ============================================================
// ALERTS API
// ============================================================

export const alertsAPI = {
  getAlerts: async () => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const alerts = storage.getAlertsByUser(currentUserId);
    return { alerts };
  },

  createAlert: async (propertyId: string, type: 'nearby' | 'price_change' | 'new_listing', message: string) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const alert = storage.createAlert({
      userId: currentUserId,
      propertyId,
      type,
      message,
      read: false,
    });

    return { alert };
  },

  markAsRead: async (alertId: string) => {
    const success = storage.markAlertAsRead(alertId);
    if (!success) {
      throw new Error('Failed to mark alert as read');
    }
    return { message: 'Alert marked as read' };
  },

  deleteAlert: async (alertId: string) => {
    const success = storage.deleteAlert(alertId);
    if (!success) {
      throw new Error('Failed to delete alert');
    }
    return { message: 'Alert deleted successfully' };
  },
};

// ============================================================
// HEALTH CHECK
// ============================================================

export const healthCheck = async () => {
  return {
    status: 'ok',
    message: 'LocalStorage API is working',
    timestamp: new Date().toISOString(),
  };
};