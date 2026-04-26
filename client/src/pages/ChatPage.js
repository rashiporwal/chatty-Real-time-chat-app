

import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";
import UserList from "../components/UserList";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { useLocation } from "react-router-dom"; //new addition
import PrivateChatWindow from "../components/PrivateChatWindow";
import "./ChatPage.css";

function ChatPage() {
  const location = useLocation();
  const { username, room } = location.state || {}; // ye location add kiya ,actual value ke liya
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); //react client:for listen roomData
  const [typingUser, setTypingUser] = useState("");
  // const [roomMessages , setRoomMessages] = useState([]);
  const [privateMessages,setPrivateMessages] = useState({});

  const typingTimerRef = useRef(null);

  //yha changes kiya - username or room and socket emit below add kiya

  // Use the useEffect hook to set up our event listeners.

  const [privateChatTarget,setPrivateChatTarget] = useState(null);

  const handleUserSelect = (user) => {
    setPrivateChatTarget(user);
    console.log(`Starting private chat with: ${user.username}`);
  };

  const handleClosePrivateChat = () => {
    setPrivateChatTarget(null);
  }

  useEffect(() => {
    if (username && room && !socket.joined) {
      socket.emit("join", { username, room });
      socket.joined = true;
    } // guard emit with flag to remove duplicate welcome msg

    // Listener for receiving system messages (e.g., 'Welcome to the room!')
    const messageListener = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      console.log("Received message", message);
    };

    // Listener for receiving user-sent messages
    const newMessageListener = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const roomDataListener = (data) => {
      setUsers(data.users); //update users list
    };

    const loadHistory = (history) => {
      const formattedHistory = history.map((msg) => ({
        user: msg.author,
        text: msg.text,
        timestamp:msg.createdAt || msg.timestamp,
      }));

      setMessages((prevMessages) => [...prevMessages, ...formattedHistory]);
    };

    const userTypingListener = ({ username }) => {
      // console.log(`UserTyping event received from: ${username}`);
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      setTypingUser(username);
      typingTimerRef.current = setTimeout(() => {
        setTypingUser("");
      }, 2000);
    };

    const userStoppedTypingListener = ({ username }) => {
      if (typingUser === username) {
        setTypingUser("");
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
      }
    };

    const newPrivateMessageListener = (message) => {
      const otherUserId = socket.id === message.sender.id ? message.recipient.id : message.sender.id;

      setPrivateMessages(prev => {
        const existingMessages = prev[otherUserId] || [];

        return {
          ...prev,
          [otherUserId]:[...existingMessages,message]
        };
      });
      console.log("Private message received:",message);
      
    };

    socket.on("message", messageListener);
    socket.on("newMessage", newMessageListener);
    socket.on("roomData", roomDataListener);
    socket.on("chatHistory", loadHistory);
    socket.on("userTyping", userTypingListener);
    socket.on("userStoppedTyping", userStoppedTypingListener);
    socket.on("newPrivateMessage",newPrivateMessageListener);

    return () => {
      socket.off("message", messageListener);
      socket.off("newMessage", newMessageListener);
      socket.off("roomData", roomDataListener);
      socket.off("chatHistory", loadHistory);
      socket.off("userTyping", userTypingListener);
      socket.off("userStoppedTyping", userStoppedTypingListener);
      socket.off('newPrivateMessage',newPrivateMessageListener);

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [username, room]); // yha username,room pass kiya

  const messagesForPrivateChat = privateChatTarget ? privateMessages[privateChatTarget.id] || []
  : [];

  return (
    <div className="chat-page">
      {/* {this contain will hold the two main columns:the user list and chats} */}
      <div className="chat-container">
        {/* {sidebar for userlist} */}
        <div className="sidebar">
          <h3>RoomName:{room}</h3>
          <UserList users={users} onUserSelect={handleUserSelect}/>
          {/* {This placeholder for the userList component} */}
        </div>

        {/* {Main chat Area} */}
        <div className="chat-main">
          <MessageList messages={messages} />

          {/* {This is a placeholder for the Message Input component} */}
          {typingUser && (
            <div className="typing-indicator">
              {`${typingUser} is typing....`}
            </div>
          )}

          <MessageInput username={username} room={room} />
          {/* yha messageInput m username,room add kiya */}
        </div>
      </div>

      {privateChatTarget && (
        <PrivateChatWindow  
        targetUser={privateChatTarget}  
        onClose={handleClosePrivateChat}
        messages={messagesForPrivateChat}
        />
      )}
    </div>
  );
}

export default ChatPage;
