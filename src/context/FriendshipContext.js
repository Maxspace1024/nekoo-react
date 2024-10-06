import React, { createContext, useState, useContext } from 'react';

// 建立一個 FriendshipContext
const FriendshipContext = createContext();

// 建立一個 FriendshipProvider，讓所有子元件可以共用
export const FriendshipProvider = ({ children }) => {
  const [friendshipNotifications, setFriendshipNotifications] = useState([]);
  const [searchFriendships, setSearchFriendships] = useState([])

  return (
    <FriendshipContext.Provider value={
      { 
        friendshipNotifications, setFriendshipNotifications,
        searchFriendships, setSearchFriendships
      }}
    >
      {children}
    </FriendshipContext.Provider>
  );
};

// 建立一個方便使用的 hook 來存取 FriendshipContext
export const useFriendship = () => {
  return useContext(FriendshipContext);
};
