import React, { useState } from 'react';
import socket from '../socket';
import './MessageInput.css';



function MessageInput({username,room,recipientId}){
    // yha parameter pass kiya username , room

    const [message , setMessage] = useState('');

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (message.trim()){
            if (recipientId){
                socket.emit('privateMessage',{
                    recipientId,
                    text:message,
                    timestamp:new Date().toISOString()
                })
            }else{
                socket.emit("sendMessage", { text: message, username, room });
            }
            
            // yha pe changes kiya h ,message <=> {isme add kiya}
            // console.log('Sending message:',message);
            socket.emit('stopTyping', {username,room});
            setMessage('');
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        // console.log('Typing event detched!')
        // socket.emit('typing');
        handleTyping();
    };

    const handleBlur = () => {
        socket.emit('stopTyping',{username,room});
    };

    const handleTyping = () => {
        socket.emit('typing',{username,room});
        console.log('User is typing....');
    };

    return (
        <form className='message-form' onSubmit={handleSendMessage}>
            <input 
               type='text'
               className='message-input'
               placeholder='Type your message'
               value={message}
               onChange={handleInputChange} 
               onBlur={handleBlur} //Add the onBlur event prop to the input element.      
            
            />
            <button type='submit' className='send-button'>
                Send
            </button>
        </form>
    );
}

export default MessageInput;