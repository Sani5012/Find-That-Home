import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { MessageSquare, Search, Loader2, Inbox, MessageCircle } from 'lucide-react';
import { messagingAPI } from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { ChatWindow } from './ChatWindow';
import { toast } from 'sonner@2.0.3';

interface Conversation {
  id: string;
  participants: Array<{
    userId: string;
    name: string;
    role: string;
  }>;
  propertyId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: { [key: string]: number };
  createdAt: string;
}

export function Messages() {
  const { user, isAuthenticated } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Messages component - isAuthenticated:', isAuthenticated, 'user:', user);
    if (isAuthenticated && user) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Auto-refresh conversations every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      loadConversations(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadConversations = async (silent = false) => {
    if (!isAuthenticated || !user) {
      console.log('Not loading conversations - not authenticated or no user');
      return;
    }
    
    try {
      if (!silent) setLoading(true);
      const { conversations: fetchedConversations } = await messagingAPI.getConversations();
      setConversations(fetchedConversations);
    } catch (error: any) {
      console.error('Load conversations error:', error);
      
      // Check if it's an authentication error
      if (!silent) toast.error('Failed to load conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== user?.id);
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount?.[user?.id || ''] || 0;
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + getUnreadCount(conv), 0);

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <MessageCircle className="h-16 w-16 text-gray-300" />
            <div className="text-center">
              <p className="text-xl mb-2">Please Sign In</p>
              <p className="text-gray-500 mb-4">You need to be signed in to view messages</p>
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl">Messages</h1>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {totalUnread}
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            Chat with landlords, tenants, and buyers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <div className="px-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <Inbox className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">
                      {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </p>
                    {!searchQuery && (
                      <p className="text-gray-400 text-xs mt-1">
                        Start chatting by viewing a property
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conversation) => {
                      const otherParticipant = getOtherParticipant(conversation);
                      const unread = getUnreadCount(conversation);
                      const isSelected = selectedConversation?.id === conversation.id;

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {otherParticipant?.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-sm truncate">
                                  {otherParticipant?.name}
                                </p>
                                {conversation.lastMessageAt && (
                                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                    {new Date(conversation.lastMessageAt).toLocaleDateString([], {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs mb-1">
                                  {otherParticipant?.role}
                                </Badge>
                                {unread > 0 && (
                                  <Badge variant="destructive" className="rounded-full text-xs">
                                    {unread}
                                  </Badge>
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {conversation.lastMessage}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <div className="md:col-span-2 h-full">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                onClose={() => setSelectedConversation(null)}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Select a conversation to start chatting</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
