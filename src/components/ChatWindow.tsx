import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Send, Loader2, X, ArrowLeft } from 'lucide-react';
import { messagingAPI } from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachments?: any[];
  read: boolean;
  createdAt: string;
}

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

interface ChatWindowProps {
  conversationId?: string;
  otherUserId?: string;
  otherUserName?: string;
  propertyId?: string;
  onClose?: () => void;
}

export function ChatWindow({ 
  conversationId: initialConversationId, 
  otherUserId, 
  otherUserName,
  propertyId,
  onClose 
}: ChatWindowProps) {
  const { user } = useUser();
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    if (conversationId) {
      loadMessages();
    } else if (otherUserId) {
      createConversation();
    }
  }, [conversationId, otherUserId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    if (!conversationId || !user) return;

    const interval = setInterval(() => {
      loadMessages(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createConversation = async () => {
    if (!otherUserId || !user) return;

    try {
      setLoading(true);
      const { conversation: newConv } = await messagingAPI.createConversation(otherUserId, propertyId);
      setConversation(newConv);
      setConversationId(newConv.id);
    } catch (error: any) {
      console.error('Create conversation error:', error);
      toast.error('Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (silent = false) => {
    if (!conversationId || !user) return;

    try {
      if (!silent) setLoading(true);
      const { messages: fetchedMessages } = await messagingAPI.getMessages(conversationId);
      setMessages(fetchedMessages);
      
      // Mark as read
      await messagingAPI.markAsRead(conversationId);
    } catch (error: any) {
      console.error('Load messages error:', error);
      if (!silent) toast.error('Failed to load messages');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversationId || !user) return;

    try {
      setSending(true);
      const { message } = await messagingAPI.sendMessage(conversationId, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (conversation) {
      return conversation.participants.find(p => p.userId !== user?.id);
    }
    return { name: otherUserName || 'User', role: 'user' };
  };

  const otherParticipant = getOtherParticipant();

  if (!user) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <p className="text-gray-500">Please sign in to use chat</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Avatar>
              <AvatarFallback>
                {otherParticipant?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{otherParticipant?.name}</CardTitle>
              <CardDescription className="text-xs">
                <Badge variant="outline" className="text-xs">
                  {otherParticipant?.role}
                </Badge>
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hidden md:flex"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      {!isOwn && (
                        <div className="text-xs text-gray-500 mb-1 ml-2">
                          {message.senderName}
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
