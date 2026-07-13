import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ParamVirChakraPage from '@/pages/ParamVirChakraPage.jsx';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage.jsx';
import VardhmanComingSoonPage from '@/pages/VardhmanComingSoonPage.jsx';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<VardhmanComingSoonPage />} />
                <Route path="/param-vir-chakra" element={<ParamVirChakraPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="*" element={<VardhmanComingSoonPage />} />
            </Routes>
            <Toaster position="bottom-right" theme="dark" />
        </Router>
    );
}

export default App;

