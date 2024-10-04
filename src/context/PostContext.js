import React, { createContext, useState, useContext } from 'react';

// 建立一個 AuthContext
const PostContext = createContext();

// 建立一個 AuthProvider，讓所有子元件可以共用
export const PostProvider = ({ children }) => {

  return (
    <PostContext.Provider value={{}}>
      {children}
    </PostContext.Provider>
  );
};

// 建立一個方便使用的 hook 來存取
export const usePost = () => {
  return useContext(PostProvider);
};
