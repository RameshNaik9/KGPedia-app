import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Three dots icon
import AssistantIcon from '@mui/icons-material/Assistant';
import Collapse from '@mui/material/Collapse';
import './ChatDrawer.css';
import { useNavigate, useLocation } from 'react-router-dom'; // Use useLocation to track URL
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add'; // Add icon for the plus button
import Divider from '@mui/material/Divider'; // Divider for horizontal line
import ArchiveIcon from '@mui/icons-material/Archive';
// import image3 from '../media/image3.png'; // Import the image for Group Chat

const ChatDrawer = ({ toggleDrawer, newConversation }) => {
    const image3 = `${process.env.PUBLIC_URL}/media/image3.png`;
    const navigate = useNavigate();
    const location = useLocation(); // Get current location (URL)
    const [allConversations, setAllConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState('');
    const [careerOpen, setCareerOpen] = useState(false); // Toggle career history visibility
    const [archivedOpen, setArchivedOpen] = useState(false); // Toggle archived chats visibility
    const [generalOpen, setGymkhanaOpen] = useState(false); // Toggle general history visibility
    const [academicsOpen, setAcademicsOpen] = useState(false); // Toggle academics history visibility
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentConversationId, setCurrentConversationId] = useState(null); // Track the clicked conversation
    const open = Boolean(anchorEl);
    const [archivedConversations, setArchivedConversations] = useState([]); // Define state for archived conversations

    
    const [longPress, setLongPress] = useState(false); // New state for long press
    let pressTimer;

    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://kgpedia-app.azurewebsites.net';


    useEffect(() => {
        const fetchAllConversations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiBaseUrl}/api/assistant/conversations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Separate archived conversations from others
                const allConversations = response.data.reverse(); // Reverse to have the latest at the top
                const activeConversations = allConversations.filter(convo => convo.status === "active");
                const archivedConversations = allConversations.filter(convo => convo.status === "archived");

                setAllConversations(activeConversations); // Set only active conversations here
                setArchivedConversations(archivedConversations); // Set archived conversations separately
            } catch (error) {
                console.error('Error fetching conversations:', error);
                toast.error('Session expired. Login again');
            }
        };
        fetchAllConversations();
    }, [apiBaseUrl]);

    useEffect(() => {
        if (newConversation) {
            setAllConversations(prevConversations => [newConversation, ...prevConversations]);
            setSelectedConversation(newConversation._id); // Set the new conversation as active
        }
    }, [newConversation]);

    // Sync with current conversation from URL
    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        if (pathSegments.length >= 3) {
            const category = pathSegments[1];
            const conversationId = pathSegments[2];

            // Set selected conversation if not set yet (i.e., on initial load)
            if (!selectedConversation) {
                setSelectedConversation(conversationId);
            }

            // Open the correct assistant history based on URL category
            if (category === 'career-assistant') {
                setCareerOpen(true);
            } else if (category === 'academics-assistant') {
                setAcademicsOpen(true);
            } else if (category === 'general-assistant') {
                setGymkhanaOpen(true);
            } else if (category === 'archived') {
                setArchivedOpen(true); // Keep archived chats open if URL indicates an archived chat
            }
        }
    }, [location.pathname, selectedConversation]);



    // Filter conversations based on selected assistant
    const filteredConversations = (profile) =>
        allConversations.filter(conversation => conversation.chat_profile === profile);
    
    // Handle long press for mobile devices
    const handleTouchStart = () => {
        pressTimer = setTimeout(() => setLongPress(true), 600); // Trigger long press after 600ms
    };

    const handleTouchEnd = () => {
        clearTimeout(pressTimer); // Clear timer if touch ends early
        setLongPress(false); // Reset long press state
    };

    // Toggle history visibility for Career Assistant
    const handleCareerArrowClick = (event) => {
        event.stopPropagation(); // Prevent any other event from being triggered
        setCareerOpen(prevOpen => !prevOpen); // Toggle the career history visibility
    };

    // Toggle history visibility for Academics Assistant
    const handleAcademicsArrowClick = (event) => {
        event.stopPropagation();
        setAcademicsOpen(prevOpen => !prevOpen);
    };

    // Toggle history visibility for General Assistant
    const handleGeneralArrowClick = (event) => {
        event.stopPropagation();
        setGymkhanaOpen(prevOpen => !prevOpen);
    };

    const handleConversationClick = (category, conversationId, isArchived = false) => {
        setSelectedConversation(conversationId);

        // Maintain the correct toggle state based on category
        if (category === 'career-assistant') {
            setCareerOpen(true);
        } else if (category === 'academics-assistant') {
            setAcademicsOpen(true);
        } else if (category === 'general-assistant') {
            setGymkhanaOpen(true);
        } else if (isArchived) {
            setArchivedOpen(true); // Ensure archived chats remain open
        }

        // Navigate to the selected conversation
        if (isArchived) {
            navigate(`/${category}/archived/${conversationId}`, { replace: true });
        } else {
            navigate(`/${category}/${conversationId}`, { replace: true });
        }
    };

    // Toggle history visibility for Archived Chats
    const handleArchivedArrowClick = (event) => {
        event.stopPropagation();
        setArchivedOpen(prevOpen => !prevOpen);
    };

    const handleMenuClick = (event, conversationId) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setCurrentConversationId(conversationId);  // Set the conversation ID being archived
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentConversationId(null);
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${apiBaseUrl}/api/assistant/conversation/${currentConversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update both active and archived lists to immediately remove the deleted conversation
            setAllConversations(prevConversations => 
                prevConversations.filter(c => c._id !== currentConversationId)
            );
            setArchivedConversations(prevConversations => 
                prevConversations.filter(c => c._id !== currentConversationId)
            );
        } catch (error) {
            console.error('Error deleting conversation:', error);
        } finally {
            handleMenuClose();
        }
    };

    const currentConversation = allConversations.find(
    (c) => c._id === currentConversationId
    ) || archivedConversations.find((c) => c._id === currentConversationId);

    const handleArchiveConversation = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.patch(`${apiBaseUrl}/api/assistant/conversation/${currentConversationId}`, {
            status: 'archived'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Update the UI to move the conversation to archived
        setAllConversations(prevConversations => prevConversations.filter(c => c._id !== currentConversationId));
        setArchivedConversations(prevConversations => [
            ...prevConversations,
            allConversations.find(c => c._id === currentConversationId)
        ]);

    } catch (error) {
        console.error('Error archiving conversation:', error);
    } finally {
        handleMenuClose();
    }
};


    return (
        <Box className="drawer-container" role="presentation">
            <List>
                {/* Home Header */}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/home')}>
                        <ListItemText
                            sx={{ color: 'white', marginRight: 1, marginLeft: 2 }}
                            primary="Home"
                        />
                    </ListItemButton>
                </ListItem>

                {/* Group Chat */}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/group-chat')}>
                        <img src={image3} alt="Chatroom Icon" style={{ width: 24, marginRight: 8, filter: 'brightness(0) invert(1)' }} />
                        <ListItemText primary="Group Chat" sx={{ color: 'white' }} />
                    </ListItemButton>
                </ListItem>

                {/* Horizontal line to separate Group Chat and Assistants */}
                <Divider sx={{ marginY: 1, backgroundColor: 'grey' }} />

                {/* Assistants Header */}
                <ListItem disablePadding>
                    <AssistantIcon sx={{ color: 'white', marginRight: 1, marginLeft: 2 }} />
                    <ListItemText primary="Assistants" sx={{ color: 'white' }} />
                </ListItem>

                {/* Career Assistant */}
                <ListItemButton className={`assistant-item ${careerOpen ? 'open' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <ListItemText primary="Career" sx={{ color: 'white' }} />
                    <IconButton onClick={() => {navigate('/career-assistant');
                                                setSelectedConversation('');
                                                }} 
                        sx={{ color: 'white', visibility: longPress || careerOpen ? 'visible' : 'hidden' }}>
                        <AddIcon />
                    </IconButton>
                    <IconButton onClick={handleCareerArrowClick} sx={{ color: 'white' }}>
                        {careerOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </ListItemButton>
                <Collapse in={careerOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding className="history-list">
                        {filteredConversations('Career').map(conversation => (
                            <ListItem key={conversation._id} disablePadding sx={{ pl: 4 }} className={selectedConversation === conversation._id ? 'active-item' : ''}>
                                <ListItemButton onClick={() => handleConversationClick('career-assistant', conversation._id)}>
                                    <ListItemText primary={conversation.chat_title} sx={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                                    <IconButton size="small" onClick={(e) => handleMenuClick(e, conversation._id)} aria-label="more" sx={{ color: 'white', visibility: longPress ? 'visible' : 'hidden' }}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Collapse>

                {/* Academics Assistant */}
                <ListItemButton className={`assistant-item ${academicsOpen ? 'open' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <ListItemText primary="Academics" sx={{ color: 'white' }} />
                    <IconButton onClick={() => {navigate('/academics-assistant');
                        setSelectedConversation('');}} 
                        sx={{ color: 'white', visibility: longPress || academicsOpen ? 'visible' : 'hidden' }}>
                        <AddIcon />
                    </IconButton>
                    <IconButton onClick={handleAcademicsArrowClick} sx={{ color: 'white' }}>
                        {academicsOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </ListItemButton>
                <Collapse in={academicsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding className="history-list">
                        {filteredConversations('Academics').map(conversation => (
                            <ListItem key={conversation._id} disablePadding sx={{ pl: 4 }} className={selectedConversation === conversation._id ? 'active-item' : ''}>
                                <ListItemButton onClick={() => handleConversationClick('academics-assistant', conversation._id)}>
                                    <ListItemText primary={conversation.chat_title} sx={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                                    <IconButton size="small" onClick={(e) => handleMenuClick(e, conversation._id)} aria-label="more" sx={{ color: 'white', visibility: longPress ? 'visible' : 'hidden' }}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Collapse>

                {/* Gymkhana Assistant */}
                <ListItemButton className={`assistant-item ${generalOpen ? 'open' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <ListItemText primary="Gymkhana" sx={{ color: 'white' }} />
                    <IconButton onClick={() => {navigate('/gymkhana-assistant');
                        setSelectedConversation('');}} 
                        sx={{ color: 'white', visibility: longPress || generalOpen ? 'visible' : 'hidden' }}>
                        <AddIcon />
                    </IconButton>
                    <IconButton onClick={handleGeneralArrowClick} sx={{ color: 'white' }}>
                        {generalOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </ListItemButton>
                <Collapse in={generalOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding className="history-list">
                        {filteredConversations('Gymkhana').map(conversation => (
                            <ListItem key={conversation._id} disablePadding sx={{ pl: 4 }} className={selectedConversation === conversation._id ? 'active-item' : ''}>
                                <ListItemButton onClick={() => handleConversationClick('gymkhana-assistant', conversation._id)}>
                                    <ListItemText primary={conversation.chat_title} sx={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                                    <IconButton size="small" onClick={(e) => handleMenuClick(e, conversation._id)} aria-label="more" sx={{ color: 'white', visibility: longPress ? 'visible' : 'hidden' }}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Collapse>

                {/* Bhaat Assistant */}
                <ListItemButton className={`assistant-item ${generalOpen ? 'open' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <ListItemText primary="Bhaat" sx={{ color: 'white' }} />
                    <IconButton onClick={() => {navigate('/bhaat-assistant');
                        setSelectedConversation('');}} 
                        sx={{ color: 'white', visibility: longPress || generalOpen ? 'visible' : 'hidden' }}>
                        <AddIcon />
                    </IconButton>
                    <IconButton onClick={handleGeneralArrowClick} sx={{ color: 'white' }}>
                        {generalOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </ListItemButton>
                <Collapse in={generalOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding className="history-list">
                        {filteredConversations('Bhaat').map(conversation => (
                            <ListItem key={conversation._id} disablePadding sx={{ pl: 4 }} className={selectedConversation === conversation._id ? 'active-item' : ''}>
                                <ListItemButton onClick={() => handleConversationClick('bhaat-assistant', conversation._id)}>
                                    <ListItemText primary={conversation.chat_title} sx={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                                    <IconButton size="small" onClick={(e) => handleMenuClick(e, conversation._id)} aria-label="more" sx={{ color: 'white', visibility: longPress ? 'visible' : 'hidden' }}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Collapse>

                

                {/* Divider and Bottom List Items */}
                <Divider sx={{ marginY: 1, backgroundColor: 'grey' }} />

                {/* Archived Chats */}
                <ListItem disablePadding>
                    <ListItemButton className="assistant-item">
                        <ArchiveIcon sx={{ color: 'white', marginRight: 1 }} />
                        <ListItemText primary="Archived Chats" sx={{ color: 'white' }} />
                        <IconButton onClick={handleArchivedArrowClick} sx={{ color: 'white' }}>
                            {archivedOpen ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </ListItemButton>
                </ListItem>
                <Collapse in={archivedOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding className="history-list">
                        {archivedConversations.map(conversation => (
                            <ListItem
                                key={conversation._id}
                                disablePadding
                                sx={{ pl: 4 }}
                                className={selectedConversation === conversation._id ? 'active-item' : ''}
                            >
                                <ListItemButton
                                    onClick={() => handleConversationClick('career-assistant', conversation._id, true)}
                                    className={selectedConversation === conversation._id ? 'active-item' : ''}
                                >
                                    <ListItemText
                                        primary={conversation.chat_title}
                                        sx={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuClick(e, conversation._id)}
                                        aria-label="more"
                                        sx={{ color: 'white', visibility: longPress ? 'visible' : 'hidden' }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Collapse>

                {/* Private Rooms */}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/rooms')}>
                        <img src={image3} alt="Chatroom Icon" style={{ width: 24, marginRight: 8 }} />
                        <ListItemText primary="Private Rooms" sx={{ color: 'white' }} />
                    </ListItemButton>
                </ListItem>
            </List>

    <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => console.log('Rename clicked')}>Rename</MenuItem>
        {currentConversation && currentConversation.status !== 'archived' && (
            <MenuItem onClick={handleArchiveConversation}>Archive</MenuItem>
        )}
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
    </Menu>
        </Box>
    );
};

export default ChatDrawer;
