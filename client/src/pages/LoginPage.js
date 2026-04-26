

import React, {useState} from 'react';
// import socket from '../socket';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage(){

    const [username , setUsername] = useState('');
    const [room,setRoom] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event)=>{
        event.preventDefault();

        if (username.trim() && room.trim()){
            // socket.emit('join' , {username,room});
            navigate("/chat" , {state:{username,room}});
            // yha bhi state ke andar username ,room add kiya

        }else{
            console.log(`Username and room are required.`)
        }
    }
    return (
        <div className='login-page'>
            <div className='login-form-container'>
                <h2>Join chat room</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='username'>
                            Username
                        </label>
                        <input  
                           type='text'
                           id='username'
                           placeholder='Enter your username'
                           required
                           value={username}
                           onChange={(event) => setUsername(event.target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='room'>
                            Room
                        </label>
                        <input 
                           type='text'
                           id = "room"
                           placeholder='Enter the room name'
                           required
                           value={room}
                           onChange={(event) => setRoom(event.target.value)}
                        />
                    </div>
                    <button type='submit' className='form-button'>Join Room</button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;