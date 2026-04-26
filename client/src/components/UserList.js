
import React from "react";

import './UserList.css';

function UserList({ users , onUserSelect }){
    // const users = ['Alice','Bob','Charlie','You']
    const handleUserClick = (user) => {
        // console.log(`Clicked on user: ${user.username} with ID: ${user.id}`);
        onUserSelect(user);
        
    }

    return (
        <div className="user-list-container">
            <h4>Online Users ({users.length})</h4>
            <ul className="user-list">
                {users.map((user)=>(
                    <li key={user.id} className="user-list-item">
                     <button className="user-button" onClick={()=> handleUserClick(user)}>
                        {user.username}
                     </button>
                   </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;