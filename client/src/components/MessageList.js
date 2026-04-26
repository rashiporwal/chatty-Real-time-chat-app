import React, { useEffect, useRef } from "react";
import { format } from 'date-fns';
import socket from '../socket';
import './MessageList.css'

function MessageList({messages}){
    /* const messages = [
        {id: 1, author: 'Alice', text:'Hey everyone,welcome the room!'},
        {id: 2, author: 'Bob', text: 'Hi,Alice!Glad to be here.'},
        {id: 3, author: 'You', text:'Hello 1this is looking great.'},
        {id: 4, author: 'Charlie', text:'I agree,the layout is clean'}
    ]; */

   const messagesEndRef = useRef(null);
   
   const scrollToBottom = () => {
       messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
   };
   useEffect(() => {
       scrollToBottom();
   },[messages]);


    return (

        <div className="message-list-container">
            <ul className="message-list">
                {messages.map((msg,index)=>(
                    <li
                      key={msg.id || index}
                      className={`message-item ${msg.sender?.id === socket.id ? 'my-message' : 'their-message'}`}>
                        <div className="message-content">
                            {(msg.sender && msg.sender.username) && (
                                <div className="message-author">{msg.sender.username}</div>
                            )}
                            {msg.user && (
                                <div className="message-author">{msg.user}</div>
                            )}
                            <div className="message-text">{msg.text}</div>
                            {msg.timestamp && (
                                <div className="message-timestamp">
                                    {format(new Date(msg.timestamp),'p')}
                                </div>
                            )}
                        </div>

                      </li>
                ))}
            </ul>
            <div ref={messagesEndRef} />
        </div>
    );
}

export default MessageList;