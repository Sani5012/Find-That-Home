import { supabase } from '../lib/supabaseClient';
import { propertyStore, userStore, statsStore } from '../services/platformData';

export const adminAPI = {
  async getUsers() {
    const users = await userStore.getAll();
    return { users };
  },

  async getProperties() {
    const properties = await propertyStore.getAll();
    return { properties };
  },

  async getStats() {
    const stats = await statsStore.getOverview();
    return { stats };
  },

  async approveProperty(propertyId: string) {
    const property = await propertyStore.getById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    return { property: { ...property, approvalStatus: 'approved' as const } };
  },

  async rejectProperty(propertyId: string, reason: string) {
    const property = await propertyStore.getById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    return { property: { ...property, approvalStatus: 'rejected' as const, rejectionReason: reason } };
  },

  async deleteProperty(propertyId: string) {
    await propertyStore.remove(propertyId);
    return { message: 'Property deleted successfully' };
  },

  async deleteUser(userId: string) {
    await userStore.delete(userId);
    return { message: 'User deleted successfully' };
  },

  async clearAllData() {
    throw new Error('Clearing production data is disabled. Please remove records directly in Supabase if required.');
  },
};

const emptyConversationResponse = { conversations: [] as any[] };
const emptyMessages = { messages: [] as any[] };

export const messagingAPI = {
  async getConversations() {
    console.warn('Messaging backend not connected to Supabase. Returning empty conversations.');
    return emptyConversationResponse;
  },
  async createConversation() {
    console.warn('Messaging backend not connected to Supabase. Conversation creation skipped.');
    return { conversation: null };
  },
  async getMessages() {
    console.warn('Messaging backend not connected to Supabase. Returning no messages.');
    return emptyMessages;
  },
  async sendMessage() {
    console.warn('Messaging backend not connected to Supabase. Message send skipped.');
    return { message: null };
  },
  async markAsRead() {
    return { message: 'ok' };
  },
};

export const healthCheck = async () => {
  const { error } = await supabase.from('properties').select('id').limit(1);
  if (error) {
    throw new Error(error.message);
  }
  return {
    status: 'ok',
    message: 'Supabase connection healthy',
    timestamp: new Date().toISOString(),
  };
};
