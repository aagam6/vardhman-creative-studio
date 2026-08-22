import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import HomePage from '@/pages/HomePage.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import ServicesPage from '@/pages/ServicesPage.jsx';
import ParamVirChakraPage from '@/pages/ParamVirChakraPage.jsx';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage.jsx';
import AgencyPrivacyPolicyPage from '@/pages/AgencyPrivacyPolicyPage.jsx';
import AgencyTermsOfServicePage from '@/pages/AgencyTermsOfServicePage.jsx';
import AdminPassGeneratorPage from '@/pages/AdminPassGeneratorPage.jsx';
import PVCLiveRedirect from '@/pages/PVCLiveRedirect.jsx';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/param-vir-chakra" element={<ParamVirChakraPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/privacy" element={<AgencyPrivacyPolicyPage />} />
                <Route path="/terms" element={<AgencyTermsOfServicePage />} />
                <Route path="/pass-collection" element={<Navigate to="/param-vir-chakra" replace />} />
                <Route path="/admin/pass-generator" element={<AdminPassGeneratorPage />} />
                <Route path="/pvclive" element={<PVCLiveRedirect />} />
                <Route path="*" element={<HomePage />} />
            </Routes>
            <Toaster position="bottom-right" theme="dark" />
        </Router>
    );
}

export default App;

