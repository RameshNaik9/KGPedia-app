import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './Chatroom.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { getDateLabel } from './DateUtility'; // Ensure correct path
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'https://kgpedia-app.azurewebsites.net');
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://kgpedia-app.azurewebsites.net';
const vapid_public_key = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BOMBbfvkjUBtjs49boCTJnI11Wec0CG7bp-vyVcvAclcvDfgRg2XMdwrINtOlO-S4SX5UxTiMNwAifpAEJ25wts';

const ChatroomComponent = ({ onProfileClick }) => {  // Pass function to parent
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [newMessageContent, setNewMessageContent] = useState("");
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const userId = localStorage.getItem('userId');
    // const [profileData, setProfileData] = useState(null);  
    const [ setShowProfileCard] = useState(false); // State for controlling profile card visibility
    const profileCardRef = useRef(null); // Ref for the profile card
    const longPressDuration = 500; // Threshold for detecting long press in milliseconds
    let touchStartX = 0;
    let touchStartTime = 0;
    let isLongPress = false;
    let swipeElement = null; // Store the reference to the message element
    let currentTranslateX = 0; // Track the current X translation of the message
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    // const [lastTapTime, setLastTapTime] = useState(0);
    // const [lastTapY, setLastTapY] = useState(0);
    const doubleTapTimeoutRef = useRef(null);
    const threshold = window.innerWidth * 0.4; // 40% of the screen width






    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Function to check if the screen width is mobile
        const checkMobile = () => {
            if (window.innerWidth <= 768) { // You can adjust the width breakpoint as needed
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        };

        // Check on initial load
        checkMobile();

        // Add an event listener to handle window resize
        window.addEventListener('resize', checkMobile);

        // Clean up the event listener
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    useEffect(() => {
    return () => {
        if (doubleTapTimeoutRef.current) {
            clearTimeout(doubleTapTimeoutRef.current);
        }
    };
}, []);



    useLayoutEffect(() => {
        axios.get(`${apiBaseUrl}/api/messages`)
            .then(response => {
                setMessages(response.data);
                setIsLoading(false);
                scrollToBottom();
            })
            .catch(error => {
                console.error('Error fetching messages:', error);
                setIsConnected(false);
            });

        socket.on('newMessage', (newMessage) => {
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages, newMessage];
                scrollToBottom();
                return updatedMessages;
            });
        });

        socket.on('connect', () => {
            setIsConnected(true);
            setIsLoading(false);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socket.off('newMessage');
        };
    }, [isConnected]);

    useEffect(() => {
        subscribeUserToPush();
    }, []);

    // Function to close the profile card when clicking outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileCardRef.current && !profileCardRef.current.contains(event.target)) {
                setShowProfileCard(false);
            }
        }

        // Add event listener when profile card is shown
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up event listener when component unmounts or profile card is hidden
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileCardRef]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 0);
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        setIsScrolledUp(scrollTop < scrollHeight - clientHeight);
    };


        const handleFullNameClick = (userId) => {
        axios.get(`${apiBaseUrl}/api/profile/get-profile-info/${userId}`)
            .then(response => {
                onProfileClick(response.data); // Pass profile data to the parent component
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            });
    };
// Handle long press detection
const handleLongPressStart = (e, messageId) => {
    e.preventDefault(); // Prevent default actions
    isLongPress = false; // Reset long press state
    touchStartTime = Date.now(); // Start timing the press
    touchStartX = e.touches[0].clientX; // Track initial touch position for swipe
    e.currentTarget.longPressTimeout = setTimeout(() => {
        isLongPress = true; // Set long press flag
        document.getElementById(`dropdownMenuButton-${messageId}`).click(); // Trigger dropdown on long press
    }, longPressDuration);
};
// Handle touch move to detect swipe gesture
const handleTouchMove = (e, msg, isCurrentUser) => {
    const touchCurrentX = e.touches[0].clientX;
    const touchDeltaX = touchCurrentX - touchStartX;
    swipeElement = e.currentTarget;

    // Set the threshold for triggering reply (e.g., 40% of screen width)
    const threshold = window.innerWidth * 0.4; // 40% of the screen width

    // Determine if the swipe direction is allowed and calculate translation
    if (isCurrentUser && touchDeltaX < 0) {
        // Current user swiping left is allowed
        // Limit the translation to negative values up to -40% of screen width
        currentTranslateX = Math.max(touchDeltaX, -threshold);
    } else if (!isCurrentUser && touchDeltaX > 0) {
        // Other users swiping right is allowed
        // Limit the translation to positive values up to 40% of screen width
        currentTranslateX = Math.min(touchDeltaX, threshold);
    } else {
        // Disallow movement in the other direction
        currentTranslateX = 0;
    }

    // Apply the translation to the message box
    swipeElement.style.transform = `translateX(${currentTranslateX}px)`;

    // Check if the swipe has crossed the threshold to trigger reply
    if (isCurrentUser && currentTranslateX <= -threshold) {
        // Swiping left for current user's messages
        setReplyToMessage(msg); // Trigger reply
        handleTouchEnd(e); // Reset the swipe
    } else if (!isCurrentUser && currentTranslateX >= threshold) {
        // Swiping right for other users' messages
        setReplyToMessage(msg); // Trigger reply
        handleTouchEnd(e); // Reset the swipe
    }

    // If user moves, cancel the long press action
    clearTimeout(e.currentTarget.longPressTimeout);
};

// Clear the long press detection and swipe if the touch ends
const handleTouchEnd = (e) => {
    if (swipeElement) {
        swipeElement.style.transition = 'transform 0.3s ease'; // Smooth transition back to original position
        swipeElement.style.transform = 'translateX(0)';
    }
    clearTimeout(e.currentTarget.longPressTimeout);

    // If the long press was triggered, avoid triggering other actions
    if (isLongPress) {
        isLongPress = false;
        return;
    }

    // Reset the swipe element and translation
    swipeElement = null;
    currentTranslateX = 0;
};


    const subscribeUserToPush = async () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const existingSubscription = await registration.pushManager.getSubscription();

                if (existingSubscription) {
                    console.log('Already subscribed:', existingSubscription);

                    await axios.post(`${apiBaseUrl}/api/subscribe`, {
                        ...existingSubscription.toJSON(),
                        userId,
                    });
                    return;
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapid_public_key),
                });

                await axios.post(`${apiBaseUrl}/api/subscribe`, {
                    ...subscription.toJSON(),
                    userId,
                });

                console.log('User is subscribed:', subscription);
            } catch (error) {
                if (Notification.permission === 'denied') {
                    console.warn('Permission for notifications was denied');
                } else {
                    console.error('Failed to subscribe the user:', error);
                }
            }
        }
    };

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (message.trim() !== '') {
            const messageData = {
                user: userId,
                message: message,
                replyTo: replyToMessage?._id || null 
            };

            setMessage('');
            setReplyToMessage(null); 
            scrollToBottom();

            socket.emit("sendMessage", messageData, (response) => {
                if (response.status !== 'ok') {
                    toast.error('Session expired. Login again');
                }
            });
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleDeleteMessage = (messageId) => {
        socket.emit("deleteMessage", { messageId }, (response) => {
            if (response.status === "ok") {
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg._id !== messageId)
                );
            } else {
                toast.error('Session expired. Login again');
            }
        });
    };

    const handleEditMessageClick = (messageId, currentMessage) => {
        setEditingMessageId(messageId);
        setNewMessageContent(currentMessage);
    };

    const handleEditMessageSubmit = (messageId) => {
        socket.emit("editMessage", { messageId, newMessage: newMessageContent }, (response) => {
            if (response.status === "ok") {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === messageId
                            ? { ...msg, message: newMessageContent, isEdited: true }
                            : msg
                    )
                );
                setEditingMessageId(null);
                setNewMessageContent("");
            } else {
                toast.error('Session expired. Login again');
            }
        });
    };

    const handleReplyClick = (msg) => {
        setReplyToMessage({ 
           _id: msg._id,
           fullName: msg.user.fullName,
           message: msg.message 
        });
    };

  

    // Filter messages based on search query
    const filteredMessages = messages.filter(msg =>
        msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChatroomDoubleClick = (e) => {
        const chatContainer = e.currentTarget;
        const clickY = e.clientY - chatContainer.getBoundingClientRect().top;
        const containerHeight = chatContainer.clientHeight;
        if (clickY < containerHeight / 2) {
            // Double-clicked in the upper half, scroll to the top
            chatContainer.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Double-clicked in the lower half, scroll to the bottom
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

const handleChatroomTap = (e) => {
    const chatContainer = e.currentTarget;
    const containerHeight = chatContainer.clientHeight;

    let tapY = 0;

    if (e.changedTouches && e.changedTouches[0]) {
        // Use changedTouches to get the touch point that ended
        tapY = e.changedTouches[0].clientY - chatContainer.getBoundingClientRect().top;
    } else if (e.clientY) {
        tapY = e.clientY - chatContainer.getBoundingClientRect().top;
    } else {
        // If we can't get the Y coordinate, exit the function
        return;
    }

    if (doubleTapTimeoutRef.current) {
        clearTimeout(doubleTapTimeoutRef.current);
        doubleTapTimeoutRef.current = null;

        if (tapY < containerHeight / 2) {
            // Double-tap in the upper half, scroll to the top
            chatContainer.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Double-tap in the lower half, scroll to the bottom
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    } else {
        // Set a timeout to detect double-tap within 300ms
        doubleTapTimeoutRef.current = setTimeout(() => {
            doubleTapTimeoutRef.current = null;
        }, 300);
    }
};


    return (
        <div className={`chatroom-container bg-${theme}`} style={{ width: '100%' }}>
            <ToastContainer /> 
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <strong><h2 style={{fontSize:'18px',}} className={`m-0 ${theme === 'dark' ? 'text-light' : 'text-dark'}`}>Group Chat</h2></strong>
                <div className=" fs-6 d-flex align-items-center">
                    <input
                        style={{borderRadius:'20px'}}
                        type="text"
                        className="form-control me-3"
                        placeholder="Search messages or users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="form-check form-switch ms-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="themeSwitch"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                        />
                    </div>
                </div>
            </div>
            <div className={`overlay ${isConnected ? 'd-none' : 'd-flex'}`}>
                <div className="overlay-content">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className={`m-0 ${theme === 'dark' ? 'text-light' : 'text-dark'}`} >Connecting to server...</p>
                </div>
            </div>
            <div className={`messages p-3 ${isLoading ? 'blur' : ''}`} onScroll={handleScroll} onDoubleClick={handleChatroomDoubleClick} onClick={handleChatroomTap}>
                {filteredMessages.map((msg, index) => {
                    const isCurrentUser = msg.user._id === userId;
                    const isEditing = editingMessageId === msg._id;

                  
                    const showDateLabel = index === 0 || getDateLabel(msg.createdAt, filteredMessages[index - 1].createdAt);

                    return (
                        <div key={msg._id}>
                            {showDateLabel && (
                                <div className={`date-label text-center text-muted ${theme === "dark" ? "text-light" : "text-dark"}`}>
                                    {showDateLabel}
                                </div>
                            )}
                            <div className={`d-flex flex-column mb-3 ${isCurrentUser ? 'align-items-end' : 'align-items-start'}`}>
                                <div
                                    className={`small text-muted mb-1 ${
                                        isCurrentUser ? 'text-end' : ''
                                    }`}
                                >
                                    {!isCurrentUser && (
                                        <span
                                            style={{
                                                cursor: 'pointer',
                                                textDecoration: '',
                                            }}
                                            onClick={() =>
                                                handleFullNameClick(msg.user._id)
                                            }
                                        >
                                            {`${msg.user.fullName} • `}
                                        </span>
                                    )}
                                    <span
                                        className={`timestamp ${
                                            theme === 'dark' ? 'text-light' : 'text-dark'
                                        }`}
                                    >
                                        {`${moment(msg.createdAt).format('hh:mm A')}`}
                                        {msg.isEdited && (
                                            <span className="edited"> (edited)</span>
                                        )}
                                    </span>
                                    {msg.replyTo && msg.replyTo.user && (
                                        <div className="custom-reply-info">
                                            Replying to:{' '}
                                            <strong>
                                                {msg.replyTo.user.fullName}
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                <div className="message-wrapper">
                                    {msg.replyTo && (
                                        <div className={`reply-to-wrapper small border ${theme === "dark" ? "text-light" : "text-dark"}`}>
                                            {msg.replyTo.message}
                                        </div>
                                    )}
                                    {isEditing ? (
                                        <div className="d-flex">
                                            <textarea
                                                className="form-control me-2"
                                                value={newMessageContent}
                                                onChange={(e) => setNewMessageContent(e.target.value)}
                                            />
                                            <button
                                                style={{backgroundColor:'green'}}
                                                className="btn2"
                                                onClick={() => handleEditMessageSubmit(msg._id)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                style={{backgroundColor:'grey',width:'135px'}}
                                                className="btn2 ms-2"
                                                onClick={() => setEditingMessageId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className={`message-box p-2  text-white ${isCurrentUser ? 'bg-primary' : 'bg-success'}`}
                                            onTouchStart={(e) => handleLongPressStart(e, msg._id)} // Start long press and track swipe
                                            onTouchMove={(e) => handleTouchMove(e, msg, isCurrentUser)} // Detect swipe for reply
                                            onTouchEnd={handleTouchEnd} // Handle end of the touch, clear timeouts
                                        >
                                            <span>{msg.message}</span>

                                              {/* Menu Icon (down arrow) */}
                                                {!isMobile && (
                                                    <div className="menu-icon" data-bs-toggle="dropdown">
                                                        <KeyboardArrowDownIcon/>
                                                    </div>
                                                )}

                                            
                                            <div className="dropdown" style={{ marginRight: 'auto',marginLeft: 'auto' }}>
                                                <button
                                                    // className={` dropdown-toggle ${theme === 'dark' ? 'text-light' : 'text-dark'}`}
                                                    className={`dropdown-toggle ${theme === 'dark' ? (isMobile ? 'text-dark' : 'text-light') : (isMobile ? 'text-light' : 'text-dark')}`}
                                                    type="button"
                                                    id={`dropdownMenuButton-${msg._id}`}
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                </button>
                                                <ul
                                                    className={`dropdown-menu p-0 ${!isCurrentUser ? 'dropdown-menu-start' : 'dropdown-menu-end'}`}
                                                    aria-labelledby={`dropdownMenuButton-${msg._id}`}
                                                >
                                                    {isCurrentUser ? (
                                                        <>
                                                            <li><button className="dropdown-item" onClick={() => handleEditMessageClick(msg._id, msg.message)}>Edit</button></li>
                                                            <li><button className="dropdown-item" onClick={() => handleDeleteMessage(msg._id)}>Delete</button></li>
                                                            <li><button className="dropdown-item" onClick={() => handleReplyClick(msg)}>Reply</button></li>
                                                        </>
                                                        ) : (
                                                        <>
                                                            <li><button className="dropdown-item" href="#" onClick={() => handleReplyClick(msg)}>Reply</button></li>
                                                            {localStorage.getItem('fullName') === 'Admin' && (
                                                                <li><button className="dropdown-item" href="#" onClick={() => handleDeleteMessage(msg._id)}>Delete</button></li>
                                                            )}
                                                        </>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="msg-chese-space">
                {replyToMessage && (
                    <div className={`reply-to-container text-muted small p-2  border ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        <span>
                            Replying to: <strong>{replyToMessage.fullName}</strong> - {replyToMessage.message}
                        </span>
                        <div className="cancel-button" onClick={() => setReplyToMessage(null)}>
                            <button
                                className=" btn-sm"
                                // onClick={() => setReplyToMessage(null)}
                                >
                        </button>
                        Cancel
                        </div>
                    </div>
                )}
                <div className="input-group">
                    <textarea
                        className="form-control"
                        placeholder="Enter your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                        style={{ resize: "none", height: "auto", overflow: "auto" }}
                        rows={1}
                    />
                    {/* <button type="submit" className=" send-button" style={{ height: "auto" ,}}>Send</button> */}
                    <button type="submit" className="send-button" style={{ height: "auto" }}>
                        <i className="fas fa-paper-plane"></i>  {/* Font Awesome send icon */}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatroomComponent;
