import React, { createContext, useState, useContext } from 'react';

// 建立一個 ChatroomContext
const ChatroomContext = createContext();

// 建立一個 AuthProvider，讓所有子元件可以共用
export const ChatroomProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [unreadChannels, setUnreadChannels] = useState([]);
  const [chatLogs, setChatLogs] = useState([])
  const [newChannel, setNewChannel] = useState(null)
  const [newChatLog, setNewChatLog] = useState(null)

  return (
    <ChatroomContext.Provider value={
      { 
      channels, setChannels, 
      unreadChannels, setUnreadChannels, 
      chatLogs, setChatLogs, 
      newChannel, setNewChannel, 
      newChatLog, setNewChatLog 
      }}
    >
      {children}
    </ChatroomContext.Provider>
  );
};

// 建立一個方便使用的 hook 來存取 ChatroomContext
export const useChatroom = () => {
  return useContext(ChatroomContext);
};
