import React, { createContext, useState, useContext } from 'react';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [s3Progress, setS3Progress] = useState(0)

  return (
    <ProgressContext.Provider value={{s3Progress, setS3Progress}}>
      {children}
    </ProgressContext.Provider>
  );
};

// 建立一個方便使用的 hook 來存取
export const useProgress = () => {
  return useContext(ProgressContext);
};
