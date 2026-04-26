import { io } from 'socket.io-client';

const SERVER_URL = 
    process.env.NODE_ENV === 'production'
       ? window.location.origin
       : 'http://localhost:5000';

const socket = io(SERVER_URL);

export default socket;