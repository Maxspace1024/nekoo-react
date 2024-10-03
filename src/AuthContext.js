import React, { createContext, useState, useContext } from 'react';

// 建立一個 AuthContext
const AuthContext = createContext();

// 建立一個 AuthProvider，讓所有子元件可以共用
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null); // 預設值是 null，表示沒有使用者登入

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// 建立一個方便使用的 hook 來存取 AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
