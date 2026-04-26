# Real-time Chat Application

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

A full-stack, real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and WebSockets. This project allows users to join different chat rooms, send messages instantly, and engage in private one-on-one conversations.

<!-- Add a link to your live demo once it's deployed! -->
**Live Demo:** [deployed Link of Chatty](https://chatty-real-time-chat-app-b561.onrender.com/)

<!-- Add a screenshot or GIF of your application in action! -->
<img width="1883" height="907" alt="Screenshot 2026-04-26 101453" src="https://github.com/user-attachments/assets/ac9f0786-de68-4201-9634-809ce2e1cf8c" />


---

## Features

*   **Public Chat Rooms:** Users can join different chat rooms by providing a username and room name.
*   **Real-time Messaging:** Messages are sent and received instantly without needing to refresh the page, powered by WebSockets.
*   **Private One-on-One Messaging:** Users can click on any other user in the room to initiate a private, secure chat.
*   **Live User List:** The list of online users in each room updates in real-time as users join and leave.
*   **Real-time Typing Indicators:** See when another user is typing a message in both public and private chats.
*   **Persistent Chat History:** Public room messages are saved to a MongoDB database and loaded when a user joins a room.
*   **Polished User Interface:**
    *   Messages are styled differently for the current user and other users for easy readability.
    *   Human-readable timestamps are displayed for each message.
    *   The message list automatically scrolls to the bottom to show the latest messages.

## Technology Stack

### Backend
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **Socket.IO:** Library for real-time, bidirectional, event-based communication.
*   **MongoDB:** NoSQL database for storing message history.
*   **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js.
*   **dotenv:** For managing environment variables.
*   **cors:** For enabling Cross-Origin Resource Sharing.

### Frontend
*   **React.js:** JavaScript library for building user interfaces.
*   **Socket.IO Client:** Client-side library for connecting to the Socket.IO server.
*   **React Router:** For client-side routing.
*   **date-fns:** For formatting timestamps in a user-friendly way.

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v14 or later recommended)
*   npm (comes with Node.js)
*   MongoDB (either a local instance or a free cloud instance from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install backend dependencies:**
    Navigate to the `server` directory and run:
    ```bash
    cd server
    npm install
    ```

3.  **Install frontend dependencies:**
    Navigate to the `client` directory and run:
    ```bash
    cd ../client
    npm install
    ```

### Environment Variables

The server requires a `.env` file for configuration. In the `server` directory, create a file named `.env` and add the following variables. You can copy the `example.env` file if one is provided.
