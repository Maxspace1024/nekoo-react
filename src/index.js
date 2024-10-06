import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from "./context/AuthContext";
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PostProvider } from './context/PostContext';
import { ChatroomProvider } from './context/ChatroomContext';
import { FriendshipProvider } from './context/FriendshipContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
  <AuthProvider>
    <PostProvider>
      <ChatroomProvider>
        <FriendshipProvider>
          <App />
        </FriendshipProvider>
      </ChatroomProvider>
    </PostProvider>
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
