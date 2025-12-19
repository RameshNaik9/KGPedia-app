import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Login from './components/Login';
// import Signup from './components/Signup';
import GroupChatPage from './pages/GroupChatPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CareerAssistantPage from './pages/CareerAssistantPage'; 
import PrivateRoute from './PrivateRoute';

// V2 imports
import { V2App, CareerAssistantPageV2 } from './v2';

// V2 Page Wrapper - wraps v2 pages with theme provider
const V2PageWrapper = ({ children }) => (
    <V2App>{children}</V2App>
);

function RoutesConfig() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                {/* <Route path="/login" element={<Login />} /> */}
                {/* <Route path="/signup" element={<Signup />} /> */}

                {/* Protected Routes - V1 (Original) */}
                <Route element={<PrivateRoute />}>
                    {/* <Route path="/" element={<HomePage />} /> */}
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/group-chat" element={<GroupChatPage />} />
                    
                    {/* Routes for Career Assistant - V1 */}
                    <Route path="/career-assistant" element={<CareerAssistantPage />} />
                    <Route path="/career-assistant/:conversation_id" element={<CareerAssistantPage />} />
                    <Route path="/career-assistant/archived/:conversation_id" element={<CareerAssistantPage />} />

                    {/* ============================================== */}
                    {/* V2 Routes - New Design                        */}
                    {/* ============================================== */}
                    
                    {/* Career Assistant V2 */}
                    <Route 
                        path="/v2/career-assistant" 
                        element={<V2PageWrapper><CareerAssistantPageV2 /></V2PageWrapper>} 
                    />
                    <Route 
                        path="/v2/career-assistant/:conversation_id" 
                        element={<V2PageWrapper><CareerAssistantPageV2 /></V2PageWrapper>} 
                    />

                    {/* Add more V2 routes as needed */}
                </Route>
            </Routes>
        </Router>
    );
}

export default RoutesConfig;
