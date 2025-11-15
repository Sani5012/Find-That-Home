import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Mail, MessageSquare, Phone, HelpCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ContactSupport() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast('Please fill in all fields');
      return;
    }
    toast('Message sent successfully! We\'ll get back to you soon.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  const faqs = [
    {
      question: 'How do I search for properties?',
      answer: 'Use the search bar on the homepage to describe your ideal home in plain language, or use the filters to refine your search by price, location, bedrooms, and property type. Our AI-powered search will match you with relevant properties.'
    },
    {
      question: 'How does the affordability calculator work?',
      answer: 'The affordability calculator uses your monthly income and down payment to estimate your mortgage payment and determine if the property fits within the recommended 28% debt-to-income ratio. This helps you make informed decisions about your budget.'
    },
    {
      question: 'What are Smart Alerts?',
      answer: 'Smart Alerts notify you when new properties matching your preferences are listed, when prices drop on properties you\'re watching, or when there are important market updates in your areas of interest. You can customize these alerts in your profile.'
    },
    {
      question: 'How do I apply to rent a property?',
      answer: 'Click on any rental property, then click "Apply to Rent" from the property details page. You\'ll be guided through a step-by-step process including application submission, credit check, and payment setup.'
    },
    {
      question: 'What is the purchase process?',
      answer: 'The purchase process includes making an offer, connecting with a solicitor for legal representation, arranging a property survey, exchanging contracts, and completion. We guide you through each step and connect you with the necessary professionals.'
    },
    {
      question: 'How is Market Intelligence data collected?',
      answer: 'Our Market Intelligence data is compiled from public property records, recent sales data, and market analysis. We provide price trends, sales volumes, investment potential scores, and forecasts to help you make data-driven decisions.'
    },
    {
      question: 'Can I save my favorite properties?',
      answer: 'Yes! Create a profile to save your preferences and favorite properties. You can access your saved properties anytime from your profile page.'
    },
    {
      question: 'How do I schedule a property viewing?',
      answer: 'From the property details page, click "Schedule Viewing" to request a tour. You can also request virtual tours for remote viewing. An agent will contact you to confirm your appointment.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept major credit cards, debit cards, and bank transfers for rental deposits and application fees. For property purchases, payment methods are coordinated through your solicitor.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All personal and financial information is encrypted and stored securely. We never share your information with third parties without your consent.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1>Contact & Support</h1>
            <p className="text-gray-600">We're here to help you find your perfect home</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3>Live Chat</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Chat with our support team
                </p>
                <Button className="mt-4 w-full" variant="outline">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3>Email</h3>
                <p className="text-sm text-gray-600 mt-2">
                  support@homeai.com
                </p>
                <Button className="mt-4 w-full" variant="outline">
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Phone className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3>Phone</h3>
                <p className="text-sm text-gray-600 mt-2">
                  1-800-HOME-AI1
                </p>
                <Button className="mt-4 w-full" variant="outline">
                  Call Now
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Fill out the form and we'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="property">Property Question</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      rows={6}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </div>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Office Hours */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Office Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-2">Support Hours</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Monday - Friday: 8:00 AM - 8:00 PM EST</p>
                    <p>Saturday: 9:00 AM - 6:00 PM EST</p>
                    <p>Sunday: 10:00 AM - 4:00 PM EST</p>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2">Emergency Support</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>24/7 emergency line available for urgent issues</p>
                    <p>Call: 1-800-HOME-911</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
