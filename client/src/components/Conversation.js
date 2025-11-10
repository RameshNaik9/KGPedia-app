import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './Conversation.css';
import useMediaQuery from '@mui/material/useMediaQuery'; // Import useMediaQuery
import { FaRegThumbsUp, FaRegThumbsDown, FaRegCopy, FaSyncAlt, FaThumbsUp, FaThumbsDown, FaCheck } from 'react-icons/fa';  // Import FaCheck for tick
import { ToastContainer, toast } from 'react-toastify';


// Cache for storing conversation data
const conversationCache = new Map();

const Conversation = () => {
    const isMobile = useMediaQuery('(max-width: 576px)'); // Check if it's mobile screen
    const { conversation_id } = useParams();
    const [messages, setMessages] = useState([]);
    const [chatTitle, setChatTitle] = useState('');
    const [chatProfile, setChatProfile] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [userMessage, setUserMessage] = useState('');
    const [error, setError] = useState('');
    const [lastRecommendedQuestions, setLastRecommendedQuestions] = useState([]); // Store recommended questions for the latest response
    const [isQuestionsVisible, setIsQuestionsVisible] = useState(!isMobile);  // Toggle for recommended questions
    const [isStreaming, setIsStreaming] = useState(false); // Track if streaming is happening
    const [shouldScroll, setShouldScroll] = useState(true); // Control when to scroll
    const messagesEndRef = useRef(null);
    const textAreaRef = useRef(null); // Ref for textarea
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const fullName = localStorage.getItem('fullName') || 'there';
    const [copiedMessageId, setCopiedMessageId] = useState(null);  // Track copied message
     const [isArchived, setIsArchived] = useState(false); // State to track if conversation is archived
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://kgpedia-app.azurewebsites.net';


    // Function to handle copy
    const handleCopy = (messageId, text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedMessageId(messageId);  // Set the copied message ID
            setTimeout(() => {
                setCopiedMessageId(null);  // Reset after 2 seconds
            }, 2000);  // Show tick for 2 seconds
        });
    };

    // Fetch conversation history on component mount or cache hit
    useEffect(() => {
        // Check if the current URL contains "/archived/" to set the isArchived state
        setIsArchived(window.location.pathname.includes('/archived/'));

        const fetchConversationHistory = async () => {
            setLoading(true);
            setError(''); // Clear any existing errors

            // Check if the conversation is already cached
            if (conversationCache.has(conversation_id)) {
                const cachedConversation = conversationCache.get(conversation_id);
                setMessages(cachedConversation.messages);
                setChatTitle(cachedConversation.chat_title);
                setChatProfile(cachedConversation.chat_profile);
                setCreatedAt(cachedConversation.createdAt);
                setLastRecommendedQuestions(cachedConversation.recommended_questions || []);
                setLoading(false);
                return;
            }

            // If not cached, fetch from the backend
            try {
                const response = await axios.get(
                     `${apiBaseUrl}/api/assistant/conversation/${conversation_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                
                // Store the conversation in cache
                conversationCache.set(conversation_id, response.data);

                // Update state with fetched data
                setMessages(response.data.messages);
                setChatTitle(response.data.chat_title);
                setChatProfile(response.data.chat_profile);
                setCreatedAt(response.data.createdAt);
                setLastRecommendedQuestions(response.data.recommended_questions || []);

            } catch (error) {
                setError('Failed to fetch conversation history');
                console.error('Error fetching conversation history:', error);
                toast.error('Session expired. Login again');
            } finally {
                setLoading(false);
            }
        };

        fetchConversationHistory();
    }, [conversation_id, token]);

    useEffect(() => {
        if (shouldScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, shouldScroll]);

    // const formatDate = (dateString) => {
    //     if (!dateString) return '';
    //     const options = { year: 'numeric', month: 'long', day: 'numeric' };
    //     const parsedDate = new Date(dateString);
    //     return isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleDateString(undefined, options);
    // };


    const sendMessage = async (message) => {
        if (!message.trim()) return;

        const newMessage = {
            message_id: 'temp-' + new Date().getTime(),
            user: userId, 
            user_message: { content: message },
            assistant_response: null
        };

        setMessages((prev) => [...prev, newMessage]);
        setUserMessage('');
        setLoading(true);
        setIsStreaming(true); // Set streaming to true when message is sent
        setShouldScroll(true); // Enable scrolling for new messages

        try {
            // Send HTTP request to process the user message and get final response
            const postResponse = await axios.post(
                 `${apiBaseUrl}/api/assistant/${conversation_id}`,
                { user_message: { content: message } }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Start SSE streaming
            const eventSource = new EventSource(
                `${apiBaseUrl}/api/assistant/stream-response/${conversation_id}?token=${token}`
            );
            eventSource.onmessage = (event) => {
                if (event.data.trim()) {
                    setMessages((prevMessages) => {
                        return prevMessages.map((msg) =>
                            msg.message_id === newMessage.message_id
                                ? {
                                    ...msg,
                                    assistant_response: {
                                        content: (msg.assistant_response?.content || '') + event.data + "\n"
                                    }
                                }
                                : msg
                        );
                    });
                }
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            };

            eventSource.onerror = (err) => {
                console.error('Error in SSE connection:', err);
                eventSource.close(); // Close SSE connection on error
            };

            eventSource.addEventListener('end', () => {
                console.log('SSE stream ended.');
                eventSource.close();  // Close SSE connection when done

                // Replace the streamed response with the final response from the post request
                setMessages((prevMessages) => {
                    return prevMessages.map((msg) =>
                        msg.message_id === newMessage.message_id
                            ? {
                                ...msg,
                                message_id: postResponse.data.message_id,  // Replace with the actual message ID
                                assistant_response: {
                                    content: postResponse.data.assistant_response.content, // Replace with final response content
                                },
                                recommended_questions: postResponse.data.recommended_questions // Set recommended questions for last message
                            }
                            : msg
                    );
                });

                // Set the recommended questions for the last message
                setLastRecommendedQuestions(postResponse.data.recommended_questions || []);
                setIsStreaming(false); // Stop streaming once the final response is set
                setLoading(false);
                setShouldScroll(true); // Re-enable scrolling for the next message

                // Update the cache with new messages
                conversationCache.set(conversation_id, {
                    ...conversationCache.get(conversation_id),
                    messages: [...messages, newMessage], // Append new message to cached messages
                });
            });

        } catch (error) {
            console.error('Error sending message:', error);
            setError('Message sending failed');
            setIsStreaming(false);
            setLoading(false);
            if (textAreaRef.current) {
                textAreaRef.current.style.height = 'auto'; // Reset height
            }
        }
    };

// Handle recommended question click
const handleQuestionClick = (question) => {
    if (isArchived) {
        // alert("This conversation is archived. You cannot continue or extend it.");
        return;
    }
    setUserMessage(question);
    sendMessage(question); // Send the recommended question as a message
};

    const toggleQuestions = () => {
        setIsQuestionsVisible(!isQuestionsVisible); // Toggle visibility of recommended questions
    };

    const handleKeyDown = (event) => {
        // Prevent form submission when pressing Enter without Shift
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage(userMessage); // Send message on Enter
        }
    };

const toggleFeedback = async (messageId, currentFeedback, newFeedback) => {
    // Prevent feedback for temporary messages
    if (messageId.startsWith('temp-')) {
        alert('Cannot submit feedback for unsaved messages.');
        return;
    }

    const updatedFeedback = currentFeedback === newFeedback ? 2.5 : newFeedback; // Toggle feedback
    try {
        setShouldScroll(false); // Disable scrolling when feedback is submitted
        await axios.post(
            `${apiBaseUrl}/api/assistant/feedback`,
            { message_id: messageId, feedback: updatedFeedback },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(prevMessages => prevMessages.map(msg =>
            msg.message_id === messageId ? { ...msg, feedback: updatedFeedback } : msg
        ));
    } catch (error) {
        console.error('Error submitting feedback:', error);
    } finally {
        setShouldScroll(false); // Re-enable scrolling after feedback is handled
    }
};


    // Function to get placeholder text based on chat profile or archived status
    const getPlaceholderText = () => {
        if (isArchived) {
            return 'You cannot continue or extend this conversation as it has been archived due to inactivity.';
        }

        switch (chatProfile) {
            case 'Career':
                return `Hi ${fullName}, Confused about CDC Internships or Off campus placements? Drop your questions!`;
            case 'Academics':
                return `Hi ${fullName}, Load in academics? Need help with details on courses? Shoot your questions!`;
            case 'General':
                return `Hi ${fullName}, Any other funda you wanna know?`;
            case 'Bhaat':
                return `Hi ${fullName}, What's hot on 2.2??`;
            default:
                return 'Ask KGPedia';
        }
    };

    const assistantLogo = '/icons/img1-icon.png';
    // const assistantLogo = '/icons/kgp-chatroom.png';

    // Function to dynamically adjust the textarea height
    const adjustTextareaHeight = () => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto'; // Reset the height to auto
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Set height based on content
        }
    };

    return (
        <div className="conversation-container">
            {/* <h2 className='convo-title'>
                {chatTitle || 'Conversation'}
                <span className="conversation-date">
                    {createdAt && ` - ${formatDate(createdAt)}`}
                </span>
            </h2> */}

            <div className="messages-list">
                {messages.map((msg, index) => (
                    <div key={msg.message_id} className="message-block">
                        <div className="message-item user-message">
                            {msg.user_message.content}
                        </div>
                        {msg.assistant_response ? (
                            <div className="message-item assistant-message">
                                <div className="assistant-response-container">
                                    <img 
                                        src={assistantLogo} 
                                        alt="Assistant Logo" 
                                        className={`assistant-logo ${isStreaming ? 'loading' : ''}`} 
                                    />

                                    <div className="assistant-response-content">
                                        <ReactMarkdown>{msg.assistant_response.content}</ReactMarkdown>

                                        {/* Action buttons */}
                                        {!isStreaming && (
                                            <div className="action-buttons">
                                                {copiedMessageId === msg.message_id
                                                    ? <FaCheck color="grey" />  // Show tick icon if copied
                                                    : <FaRegCopy onClick={() => handleCopy(msg.message_id, msg.assistant_response.content)} />
                                                }
                                                {msg.feedback === 5
                                                    ? <FaThumbsUp color="grey" onClick={() => toggleFeedback(msg.message_id, msg.feedback, 5)} />
                                                    : <FaRegThumbsUp onClick={() => toggleFeedback(msg.message_id, msg.feedback, 5)} />
                                                }
                                                {msg.feedback === 1
                                                    ? <FaThumbsDown color="grey" onClick={() => toggleFeedback(msg.message_id, msg.feedback, 1)} />
                                                    : <FaRegThumbsDown onClick={() => toggleFeedback(msg.message_id, msg.feedback, 1)} />
                                                }
                                                {/* <FaSyncAlt /> */}
                                            </div>
                                        )}

                                        {/* Recommended Questions - only for the latest response and after streaming ends */}
                                        {!isStreaming && index === messages.length - 1 && lastRecommendedQuestions.length > 0 && (
                                            <div className="recommended-questions">
                                                <button onClick={toggleQuestions}>Related  +  </button>
                                                {isQuestionsVisible && (
                                                    <ul className="questions-list">
                                                        {lastRecommendedQuestions.map((question, idx) => (
                                                            <li key={idx} onClick={() => handleQuestionClick(question)}>
                                                                {question}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        ) : loading ? (
                            <div className="message-item assistant-message">
                                <div className="skeleton-loader"></div>
                            </div>
                        ) : null}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Conditionally render input box */}
        <div className="message-input-container">
            {/* Information message about archiving */}
            {isArchived && (
            <div className="archive-info-message">
                <p>The conversation will be archived because it was inactive for two days.</p>
            </div>
            )}

            <div className="message-input">
                <textarea
                    ref={textAreaRef}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder={getPlaceholderText()}
                    rows="1"
                    disabled={isArchived || loading}  // Disable if archived or loading
                    className="textarea-input"
                    style={{
                        overflow: 'auto',
                        height: 'auto',
                        maxHeight: '200px'
                    }}
                />
                <button onClick={() => sendMessage(userMessage)} disabled={isArchived || loading}>Send</button>
            </div>
        </div>
    </div>
    );
};

export default Conversation;
