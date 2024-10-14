// import React, { useState } from 'react';
// import Greeting from './Greeting';
// import Cards from './Cards';
// import MessageBar from './MessageBar';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Assistant.css';

// const Assistant = ({ onNewConversation }) => {  // Prop to update the drawer
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSendMessage = async (message) => {
//         if (loading) return; // Prevent multiple sends while loading
//         setLoading(true); // Show loading until conversation ID is received

//         const userId = localStorage.getItem('userId');
//         const token = localStorage.getItem('token');

//         try {
//             // Start a new conversation
//             const response = await axios.post(
//                 `http://localhost:8080/api/assistant/new-conversation?userId=${userId}`,
//                 { chat_profile: 'Career' },
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             const { conversation_id } = response.data;

//             // Send the initial message to trigger the assistant response
//             const assistantResponse = await axios.post(
//                 `http://localhost:8080/api/assistant/${conversation_id}`,
//                 { user_message: { content: message } }, // Send the initial message as payload
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );

//             const { chat_title } = assistantResponse.data;

//             // Update the chat drawer dynamically
//             onNewConversation({
//                 _id: conversation_id,
//                 chat_title,
//                 chat_profile: 'Career'
//             });

//             // Navigate to the conversation page after getting the response
//             navigate(`/career-assistant/${conversation_id}`);  // This ensures correct navigation
//         } catch (error) {
//             console.error('Error starting new conversation or sending initial message:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="assistant-container">
//             {loading ? <p>Loading...</p> : (
//                 <>
//                     <Greeting />
//                     <Cards />
//                     <MessageBar onSend={handleSendMessage} />
//                 </>
//             )}
//         </div>
//     );
// };

// export default Assistant;

import React, { useState } from 'react';
import Greeting from './Greeting';
import Cards from './Cards';
import MessageBar from './MessageBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Assistant.css';

const Assistant = ({ onNewConversation }) => {  // Prop to update the drawer
    const [loading, setLoading] = useState(false);
    const [userMessage, setUserMessage] = useState(''); // Store the user's message
    const [assistantMessage, setAssistantMessage] = useState(''); // Store the assistant's response
    const navigate = useNavigate();

    const handleSendMessage = async (message) => {
        if (loading) return; // Prevent multiple sends while loading
        setLoading(true); // Show loading until conversation ID is received
        setUserMessage(message); // Store the user message to display it on the right

        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        try {
            // Start a new conversation
            const response = await axios.post(
                `http://localhost:8080/api/assistant/new-conversation?userId=${userId}`,
                { chat_profile: 'Career' },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const { conversation_id } = response.data;

            // Send the initial message to trigger the assistant response
            const assistantResponse = await axios.post(
                `http://localhost:8080/api/assistant/${conversation_id}`,
                { user_message: { content: message } }, // Send the initial message as payload
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { chat_title, assistant_response } = assistantResponse.data;

            // Update the chat drawer dynamically
            onNewConversation({
                _id: conversation_id,
                chat_title,
                chat_profile: 'Career'
            });

            // Store assistant response to display in the UI
            setAssistantMessage(assistant_response.content);

            // Navigate to the conversation page after getting the response
            navigate(`/career-assistant/${conversation_id}`);  // This ensures correct navigation
        } catch (error) {
            console.error('Error starting new conversation or sending initial message:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="assistant-container">
            {loading ? (
                <div className="loading-section">
                    <div className="user-message-right">{userMessage}</div>
                    <div className="skeleton-loader"></div> {/* Skeleton Loader */}
                </div>
            ) : (
                <>
                    <Greeting />
                    <Cards />
                    <MessageBar onSend={handleSendMessage} />
                    {assistantMessage && (
                        <div className="assistant-message">
                            <p>{assistantMessage}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Assistant;
