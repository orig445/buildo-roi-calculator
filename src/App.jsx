import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import Calculator from "@/pages/Calculator";
import CalculatorV2 from "@/pages/CalculatorV2";
import Admin from "@/pages/Admin";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdCreator from "@/pages/AdCreator";
import ClientBriefForm from "@/pages/ClientBriefForm";
import SEOAnalyzer from "@/pages/SEOAnalyzer";
import LandingPage from "@/pages/LandingPage";
import ComparisonPage from "@/pages/ComparisonPage";
import FacebookAdGenerator from "@/pages/tools/FacebookAdGenerator";
import MarketingPlanGenerator from "@/pages/tools/MarketingPlanGenerator";
import WhatsAppCampaignGenerator from "@/pages/tools/WhatsAppCampaignGenerator";
import SEOAdminPage from "@/pages/SEOAdmin";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Calculator />} />
      <Route path="/v2" element={<CalculatorV2 />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/ad-creator" element={<AdCreator />} />
      <Route path="/brief" element={<ClientBriefForm />} />
      <Route path="/seo" element={<SEOAnalyzer />} />
      <Route path="/seo-admin" element={<SEOAdminPage />} />
      <Route path="/tools/facebook-ad-generator" element={<FacebookAdGenerator />} />
      <Route path="/tools/marketing-plan-generator" element={<MarketingPlanGenerator />} />
      <Route path="/tools/whatsapp-campaign-generator" element={<WhatsAppCampaignGenerator />} />
      <Route path="/buildo-vs-chatgpt" element={<ComparisonPage />} />
      <Route path="/buildo-vs-marketing-agency" element={<ComparisonPage />} />
      <Route path="/buildo-vs-canva" element={<ComparisonPage />} />
      <Route path="/:slug" element={<LandingPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App