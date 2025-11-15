import { mockProperties } from '../data/mockProperties';
import { getAllProperties, getPropertyById } from '../utils/localStorage';
import { Property } from '../types/property';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Send, 
  Bot,
  Sparkles,
  MapPin,
  Home,
  Banknote,
  Calendar,
  Info
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { propertiesAPI } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  propertyId?: string;
}

export function PropertyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>(mockProperties);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user } = useUser();

  // Fetch all properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const localProperties = getAllProperties();
        setAllProperties([...mockProperties, ...localProperties]);
      } catch (error) {
        console.error('Error fetching properties for chatbot:', error);
        setAllProperties(mockProperties);
      }
    };

    fetchProperties();
  }, []);

  // Fetch current property if on property details page
  useEffect(() => {
    const fetchCurrentProperty = async () => {
      const pathParts = location.pathname.split('/');
      if (pathParts[1] === 'property' && pathParts[2]) {
        const propertyId = pathParts[2];
        
        // Try to get property from localStorage
        const localProperty = getPropertyById(propertyId);
        
        if (localProperty) {
          console.log(`✓ Chatbot found property ${propertyId} in localStorage`);
          setCurrentProperty(localProperty);
          return;
        }
        
        // Second, try to find in already loaded properties (faster)
        const cachedProperty = allProperties.find(p => p.id === propertyId);
        if (cachedProperty) {
          setCurrentProperty(cachedProperty);
          return;
        }

        // Fallback to mock properties
        const mockProperty = mockProperties.find(p => p.id === propertyId);
        if (mockProperty) {
          setCurrentProperty(mockProperty);
        } else {
          setCurrentProperty(null);
        }
      } else {
        setCurrentProperty(null);
      }
    };

    fetchCurrentProperty();
  }, [location.pathname, allProperties]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send welcome message when chatbot is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: getWelcomeMessage(),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = () => {
    const userName = user?.name ? `, ${user.name.split(' ')[0]}` : '';
    const currentPath = location.pathname;

    if (currentPath.includes('/property/')) {
      return `Hi${userName}! 👋 I'm your property assistant. I can help you with questions about this property, nearby amenities, pricing, availability, and much more. How can I assist you today?`;
    } else if (currentPath === '/search') {
      return `Hi${userName}! 👋 I'm here to help you find your perfect property. Ask me about specific locations, price ranges, property types, or anything else you'd like to know!`;
    } else if (currentPath === '/nearby') {
      return `Hi${userName}! 👋 Looking for properties near you? I can help you understand the local market, compare properties, and answer any questions about the listings you see!`;
    } else {
      return `Hi${userName}! 👋 Welcome to Find that Home! I'm your AI property assistant. I can help you with property searches, answer questions about listings, explain our platform features, and guide you through the rental or purchase process. What would you like to know?`;
    }
  };

  const getCurrentPropertyContext = () => {
    return currentProperty;
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const currentProperty = getCurrentPropertyContext();

    // Property-specific responses
    if (currentProperty) {
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rent')) {
        const priceFormatted = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(currentProperty.price);
        return `This property is listed at ${priceFormatted}. ${
          currentProperty.listingType === 'rent' 
            ? 'This is a monthly rental price. Additional costs may include utilities and council tax.' 
            : 'This is the asking price for purchase. Additional costs include stamp duty, legal fees, and surveys.'
        }`;
      }

      if (lowerMessage.includes('bedroom') || lowerMessage.includes('bed')) {
        return `This property has ${currentProperty.bedrooms} bedroom${currentProperty.bedrooms > 1 ? 's' : ''}. ${
          currentProperty.bedrooms >= 3 
            ? 'Perfect for families or those who need extra space!' 
            : 'Great for individuals or couples!'
        }`;
      }

      if (lowerMessage.includes('bathroom') || lowerMessage.includes('bath')) {
        return `This property has ${currentProperty.bathrooms} bathroom${currentProperty.bathrooms > 1 ? 's' : ''}. ${
          currentProperty.bathrooms >= 2 
            ? 'Multiple bathrooms provide great convenience for families or shared living.' 
            : ''
        }`;
      }

      if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address')) {
        const location = currentProperty.location || currentProperty.address || 'the listed location';
        const city = currentProperty.city || '';
        return `This property is located in ${location}${city ? `, ${city}` : ''}. ${
          currentProperty.features?.includes('Near public transport') 
            ? 'It has excellent transport links!' 
            : ''
        }`;
      }

      if (lowerMessage.includes('feature') || lowerMessage.includes('amenities') || lowerMessage.includes('includes')) {
        const features = currentProperty.features?.join(', ') || 'various features';
        return `This property includes: ${features}. ${
          currentProperty.features?.includes('Garden') 
            ? '🌳 The garden is perfect for outdoor activities!' 
            : ''
        }`;
      }

      if (lowerMessage.includes('available') || lowerMessage.includes('when') || lowerMessage.includes('move')) {
        return `This property is currently ${currentProperty.status}. ${
          currentProperty.status === 'available' 
            ? 'You can schedule a viewing or make an offer right away!' 
            : 'I can add you to the waiting list for when it becomes available.'
        }`;
      }

      if (lowerMessage.includes('view') || lowerMessage.includes('visit') || lowerMessage.includes('tour')) {
        return `I can help you schedule a viewing! ${
          currentProperty.listingType === 'rent' 
            ? 'For rental properties, you can book a viewing slot directly through the platform.' 
            : 'For properties for sale, viewings are typically arranged within 24-48 hours.'
        } Would you like me to guide you to the booking section?`;
      }

      if (lowerMessage.includes('contact') || lowerMessage.includes('landlord') || lowerMessage.includes('owner')) {
        return `You can contact the ${currentProperty.listingType === 'rent' ? 'landlord' : 'seller'} through our messaging system. This keeps all communications secure and documented. Click on the "Contact ${currentProperty.listingType === 'rent' ? 'Landlord' : 'Seller'}" button on the property page.`;
      }

      // Default property context response
      const city = currentProperty.city || 'this area';
      return `Great question about this ${currentProperty.bedrooms}-bedroom property in ${city}! Could you be more specific? I can tell you about pricing, features, availability, location details, viewing appointments, or the application process.`;
    }

    // General platform responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! 😊 How can I help you today? I can assist with property searches, answer questions about listings, or explain how our platform works.`;
    }

    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('use'))) {
      return `Find that Home makes property searching easy! You can browse listings, save favorites, schedule viewings, and complete the entire rental or purchase process online. For rentals, we handle everything from tenant screening to deposit management. For purchases, you can make offers and complete legal steps right on the platform. What would you like to know more about?`;
    }

    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return `To search for properties, use the search bar on the homepage or visit the Search page. You can filter by location, price range, number of bedrooms, property type (rent/buy), and more! You can also check out the Nearby Properties feature to find homes near your current location.`;
    }

    if (lowerMessage.includes('rent') && (lowerMessage.includes('process') || lowerMessage.includes('apply'))) {
      return `Our rental process is simple: 1️⃣ Find a property you like, 2️⃣ Schedule a viewing, 3️⃣ Submit an application, 4️⃣ We handle reference checks, 5️⃣ Sign the agreement digitally, 6️⃣ Pay deposit through our secure third-party service. The whole process typically takes 7-14 days!`;
    }

    if (lowerMessage.includes('buy') && (lowerMessage.includes('process') || lowerMessage.includes('purchase'))) {
      return `Buying a property through our platform: 1️⃣ Find your ideal home, 2️⃣ Make an offer online, 3️⃣ Get mortgage advice (if needed), 4️⃣ Complete legal steps through our platform with digital solicitors, 5️⃣ Survey and valuation, 6️⃣ Exchange contracts and complete! No need for in-person meetings - everything is digital.`;
    }

    if (lowerMessage.includes('deposit') || lowerMessage.includes('payment')) {
      return `For rentals, deposits are handled through a government-approved third-party scheme, ensuring your money is protected. For purchases, we use secure payment gateways with full legal compliance. All transactions are encrypted and monitored for your safety.`;
    }

    if (lowerMessage.includes('gps') || lowerMessage.includes('nearby') || lowerMessage.includes('location')) {
      return `Our GPS feature helps you find properties near you! Visit the "Nearby Properties" page to see listings based on your current location. You'll also get alerts when you're near properties you've saved. Make sure to enable location permissions in your browser!`;
    }

    if (lowerMessage.includes('qr') || lowerMessage.includes('code')) {
      return `Each property has a unique QR code that you can scan to quickly access full details and get directions from your current location. Landlords can print these QR codes and place them on property boards or in windows!`;
    }

    if (lowerMessage.includes('alert') || lowerMessage.includes('notification')) {
      return `You can set up Smart Alerts to get notified about new properties matching your criteria, price changes, or when you're near saved properties. Visit the Alerts page to customize your preferences!`;
    }

    if (lowerMessage.includes('thank')) {
      return `You're welcome! 😊 Is there anything else I can help you with today?`;
    }

    // Default response
    return `I'm here to help! I can assist you with:
    
📍 Property searches and filters
💰 Pricing and payment information
🏠 Rental and purchase processes
📱 Platform features (GPS, QR codes, alerts)
📄 Legal and contract information
🗺️ Location and nearby amenities

What would you like to know more about?`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing and generate response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 1000); // Random delay between 800-1800ms for natural feel
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    // Auto-send the message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: action,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(action),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 1000);
  };

  const getQuickActions = () => {
    const currentProperty = getCurrentPropertyContext();
    
    if (currentProperty) {
      return [
        { icon: Banknote, label: 'Pricing details', query: 'Tell me about the price' },
        { icon: MapPin, label: 'Location info', query: 'Where is this property?' },
        { icon: Home, label: 'Features', query: 'What features does this have?' },
        { icon: Calendar, label: 'Schedule viewing', query: 'How do I schedule a viewing?' },
      ];
    }

    return [
      { icon: Home, label: 'How to search', query: 'How do I search for properties?' },
      { icon: MapPin, label: 'Nearby properties', query: 'Tell me about nearby properties' },
      { icon: Banknote, label: 'Rental process', query: 'How does the rental process work?' },
      { icon: Info, label: 'Platform features', query: 'What features does the platform have?' },
    ];
  };

  return (
    <>
      {/* Floating chatbot button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 group relative"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] shadow-2xl"
            style={{ maxHeight: isMinimized ? 'auto' : '600px' }}
          >
            <Card className="h-full flex flex-col border-2 border-blue-100">
              {/* Header */}
              <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 bg-white">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <Bot className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        Property Assistant
                        <Sparkles className="h-4 w-4" />
                      </CardTitle>
                      <p className="text-xs text-blue-100">Always here to help</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="h-8 w-8 text-white hover:bg-blue-500"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 text-white hover:bg-blue-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Minimized state */}
              {isMinimized ? (
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">
                    Click to expand and continue our conversation...
                  </p>
                </CardContent>
              ) : (
                <>
                  {/* Messages */}
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full px-4 py-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-2xl px-4 py-2.5 ${
                                  message.type === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                  {message.content}
                                </p>
                              </div>
                              <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'} text-gray-500`}>
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Quick actions */}
                  {messages.length <= 1 && (
                    <div className="border-t px-4 py-3 bg-gray-50">
                      <p className="text-xs mb-2 text-gray-600">Quick actions:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {getQuickActions().map((action, index) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAction(action.query)}
                              className="justify-start text-xs h-auto py-2 px-3"
                            >
                              <Icon className="h-3 w-3 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{action.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        disabled={!inputValue.trim() || isTyping}
                        size="icon"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Powered by AI • Always learning
                    </p>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}