import React, { Suspense, lazy } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';

const HomePage = lazy(() => import('@/pages/HomePage.jsx'));
const AboutPage = lazy(() => import('@/pages/AboutPage.jsx'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage.jsx'));
const ParamVirChakraPage = lazy(() => import('@/pages/ParamVirChakraPage.jsx'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage.jsx'));
const AgencyPrivacyPolicyPage = lazy(() => import('@/pages/AgencyPrivacyPolicyPage.jsx'));
const AgencyTermsOfServicePage = lazy(() => import('@/pages/AgencyTermsOfServicePage.jsx'));
// const AdminPassGeneratorPage = lazy(() => import('@/pages/AdminPassGeneratorPage.jsx'));
const PVCLiveRedirect = lazy(() => import('@/pages/PVCLiveRedirect.jsx'));

const PageLoader = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Loading</span>
        </div>
    </div>
);

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/param-vir-chakra" element={<ParamVirChakraPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/privacy" element={<AgencyPrivacyPolicyPage />} />
                    <Route path="/terms" element={<AgencyTermsOfServicePage />} />
                    {/* Disabled routes */}
                    {/* <Route path="/pass-collection" element={<Navigate to="/param-vir-chakra" replace />} /> */}
                    {/* <Route path="/admin/pass-generator" element={<AdminPassGeneratorPage />} /> */}
                    <Route path="/pvclive" element={<PVCLiveRedirect />} />
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </Suspense>
            <Toaster position="bottom-right" theme="dark" />
        </Router>
    );
}

export default App;

