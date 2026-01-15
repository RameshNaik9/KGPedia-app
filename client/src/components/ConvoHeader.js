import React, { useState, useEffect, useRef } from 'react';
import {  useNavigate } from 'react-router-dom';
import './Header.css';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/MenuOpen';
// import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import CardContent from '@mui/material/CardContent';
import axios from 'axios';

const ConvoHeader = ({ toggleDrawer, isDrawerOpen, conversationId }) => {
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);  // Track window width for mobile
    const [chatTitle, setChatTitle] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const profileCardRef = useRef(null);

    const fullName = localStorage.getItem('fullName');
    const email = localStorage.getItem('email');
    const rollNumber = localStorage.getItem('rollNumber');
    const department = localStorage.getItem('department');
    const isVerified = localStorage.getItem('isVerified') === 'true';
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://www.kgpedia.com';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const toggleProfileOpen = () => {
        setProfileOpen(prevOpen => !prevOpen);
    };

    const handleClickOutside = (event) => {
        if (profileCardRef.current && !profileCardRef.current.contains(event.target)) {
            setProfileOpen(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const parsedDate = new Date(dateString);
        return isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleDateString(undefined, options);
    };

    useEffect(() => {
        if (profileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileOpen]);

    // Update isMobile state on window resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch conversation details dynamically if conversationId is provided
    useEffect(() => {
        if (conversationId) {
            const fetchConversationDetails = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `${apiBaseUrl}/api/assistant/conversation/${conversationId}`,
                        {headers: { Authorization: `Bearer ${token}` }}
                    );
                    const { chat_title, createdAt } = response.data;
                    setChatTitle(chat_title);
                    setCreatedAt(createdAt);
                } catch (error) {
                    console.error('Error fetching conversation details:', error);
                }
            };
            fetchConversationDetails();
        }
    }, [conversationId,apiBaseUrl]);

    return (
        <header className="header-class">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer}
                    >
                        {isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>

                    {/* Display dynamic chat title and date here */}
                    {conversationId && (
                        <div className="chat-info">
                            <h2 className="convo-title">
                                {chatTitle || 'Conversation'}
                                <span className="conversation-date">
                                    {createdAt && ` - ${formatDate(createdAt)}`}
                                </span>
                            </h2>
                        </div>
                    )}

                    <div className="d-flex align-items-center">
                        <Avatar 
                            alt="Profile" 
                            onClick={toggleProfileOpen} 
                            className="avatar"
                        />
                        {/* Conditionally render logout button based on screen size */}
                        {!isMobile && (
                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        )}
                    </div>
                </div>
            </nav>

            {profileOpen && (
                <div className="profile-card" ref={profileCardRef}>
                    <CardContent>
                        <h5>{fullName}</h5>
                        <p>{email}</p>
                        <p>{rollNumber}</p>
                        <p>{department} Department</p>
                        <p><strong>Verified:</strong> {isVerified ? 'Yes' : 'No'}</p>
                        {/* Render logout button inside profile card for mobile screens */}
                        {isMobile && (
                            <button className="logout-btn logout-btn-mobile" onClick={handleLogout}>Logout</button>
                        )}
                        <span className="close-btn" onClick={() => setProfileOpen(false)}>&times;</span>
                    </CardContent>
                </div>
            )}
        </header>
    );
};

export default ConvoHeader;
