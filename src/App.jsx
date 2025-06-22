import React, { useEffect, useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import AudienceInsights from './pages/AudienceInsights'
import ContentStudio from './pages/ContentStudio'
import CampaignBuilder from './pages/CampaignBuilder'
import Analytics from './pages/Analytics'
import Pricing from './pages/Pricing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import About from './pages/About'
import BusinessForm from './pages/BusinessForm'
import Contact from './pages/Contact'
import Features from './pages/Features'
import TrendingEvents from './components/EventTrigger'
import FineTunePage from './pages/FineTunePage'
import ContentGenerator from './pages/ContentGenerator'
import SEOAudit from './pages/SEOAudit';
import ReachbeeCompetitorAnalysis from './pages/ReachbeeCompetitorAnalysis';
import BrandKitGenerator from './pages/BrandKitGenerator';

const AppContent = () => {
  const location = useLocation();
  const showSidebar = ['/dashboard', '/audience-insights', '/content-studio', '/campaign-builder', '/analytics', '/finetune', '/campaign-builder/template', '/seo-audit', '/competitor', '/brand-kit-generator'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {!showSidebar && <Navbar />}
      
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 ${showSidebar ? 'ml-64' : 'w-full'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/audience-insights" element={<AudienceInsights />} />
            <Route path="/content-studio" element={<ContentStudio />} />
            <Route path="/campaign-builder" element={<CampaignBuilder />} />
            <Route path="/campaign-builder/template" element={<ContentGenerator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/seo-audit" element={<SEOAudit />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/business-form" element={<BusinessForm />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/features" element={<Features />} />
            <Route path="/finetune" element={<FineTunePage />} />
            <Route path="/competitor" element={<ReachbeeCompetitorAnalysis/>} />
            <Route path="/brand-kit-generator" element={<BrandKitGenerator />} />
          </Routes>
        </main>
      </div>
      {!showSidebar && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
    // <CustomizationForm/>
  );
}
