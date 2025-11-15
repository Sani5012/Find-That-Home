import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { PropertySearchResults } from './components/PropertySearchResults';
import { PropertyDetails } from './components/PropertyDetails';
import { UserProfile } from './components/UserProfile';
import { LegalEngagement } from './components/LegalEngagement';
import { SmartAlerts } from './components/SmartAlerts';
import { MarketIntelligence } from './components/MarketIntelligence';
import { ContactSupport } from './components/ContactSupport';
import { AboutUs } from './components/AboutUs';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { NotFound } from './components/NotFound';
import { NearbyProperties } from './components/NearbyProperties';
import { LandlordDashboard } from './components/LandlordDashboard';
import AdminDashboard from './components/AdminDashboard';
import { AdminProfileView } from './components/AdminProfileView';
import { AgentDashboard } from './components/AgentDashboard';
import { PurchaseTransaction } from './components/PurchaseTransaction';
import { BackendTest } from './components/BackendTest';
import { Messages } from './components/Messages';
import { PropertyChatbot } from './components/PropertyChatbot';
import { UserProvider } from './contexts/UserContext';
import { AddPropertyForm } from './components/AddPropertyForm';

function AppContent() {
  const location = useLocation();
  const hideNavigation = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-white">
      {!hideNavigation && <Navigation />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<PropertySearchResults />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/legal/:id" element={<LegalEngagement />} />
        <Route path="/purchase/:id" element={<PurchaseTransaction />} />
        <Route path="/nearby" element={<NearbyProperties />} />
        <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-profile" element={<AdminProfileView />} />
        <Route path="/agent-dashboard" element={<AgentDashboard />} />
        <Route path="/add-property" element={<AddPropertyForm />} />
        <Route path="/alerts" element={<SmartAlerts />} />
        <Route path="/market-intelligence" element={<MarketIntelligence />} />
        <Route path="/contact" element={<ContactSupport />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/backend-test" element={<BackendTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PropertyChatbot />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  );
}