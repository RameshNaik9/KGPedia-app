import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import GroupChatPage from './pages/GroupChatPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CareerAssistantPage from './pages/CareerAssistantPage'; 
import PrivateRoute from './PrivateRoute';

// V2 imports
import { 
    V2LayoutWrapper,
    HomePageV2,
    CareerAssistantPageV2,
    CareerAssistantWelcomeV2,
    AcademicsAssistantPageV2,
    AcademicsAssistantWelcomeV2,
    GymkhanaAssistantPageV2,
    GymkhanaAssistantWelcomeV2,
    BhaatAssistantPageV2,
    BhaatAssistantWelcomeV2
} from './v2';

function RoutesConfig() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />

                {/* Protected Routes - V1 (Original) */}
                <Route element={<PrivateRoute />}>
                    <Route path="/home" element={<Navigate to="/home/v1" replace />} />
                    <Route path="/home/v1" element={<HomePage />} />
                    <Route path="/group-chat" element={<GroupChatPage />} />
                    
                    {/* Routes for Career Assistant - V1 */}
                    <Route path="/career-assistant" element={<CareerAssistantPage />} />
                    <Route path="/career-assistant/:conversation_id" element={<CareerAssistantPage />} />
                    <Route path="/career-assistant/archived/:conversation_id" element={<CareerAssistantPage />} />

                    {/* ============================================== */}
                    {/* V2 Routes - New Design with Persistent Layout  */}
                    {/* ============================================== */}
                    
                    {/* V2 Parent Route - Wraps all V2 pages with persistent layout */}
                    <Route path="/home/v2" element={<V2LayoutWrapper />}>
                        {/* Home */}
                        <Route index element={<HomePageV2 />} />
                        
                        {/* Career Assistant */}
                        <Route path="career-assistant" element={<CareerAssistantWelcomeV2 />} />
                        <Route path="career-assistant/:conversation_id" element={<CareerAssistantPageV2 />} />

                        {/* Academics Assistant */}
                        <Route path="academics-assistant" element={<AcademicsAssistantWelcomeV2 />} />
                        <Route path="academics-assistant/:conversation_id" element={<AcademicsAssistantPageV2 />} />
                        
                        {/* Gymkhana Assistant */}
                        <Route path="gymkhana-assistant" element={<GymkhanaAssistantWelcomeV2 />} />
                        <Route path="gymkhana-assistant/:conversation_id" element={<GymkhanaAssistantPageV2 />} />
                        
                        {/* Bhaat Assistant */}
                        <Route path="bhaat-assistant" element={<BhaatAssistantWelcomeV2 />} />
                        <Route path="bhaat-assistant/:conversation_id" element={<BhaatAssistantPageV2 />} />
                    </Route>
                    {/* Legacy V2 path (redirect to /home/v2) */}
                    <Route path="/v2/*" element={<Navigate to="/home/v2" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default RoutesConfig;
