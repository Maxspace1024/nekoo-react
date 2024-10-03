import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import axiox from "./axiox";

function Authdata() {
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    // 模擬一個 API 請求來取得使用者資料
    const fetchUserData = async () => {
      const response = await fetch('/api/user');
      const data = await response.json();
      setAuth(data); // 將 API 回應資料儲存在 auth 變數中
    };

    setAuth("asdfasdf")

    // fetchUserData();
  }, [setAuth]);

  // useEffect(() => {
  //   // check jwt
  //   axiox.post("/api/v1/user/signin", {
  //     email: 'asdf@gmail.com',
  //     password: 'asdfasdf'
  //   })
  //   .then(response => {
  //     const data = response.data
  //     setAuthData({
  //       "data": {
  //         "username": "JohnDoe"
  //       },
  //       "success": true,
  //       "error": null
  //     })
  //   })
  //   .catch(e => console.error(e))

    // axiox.post("/api/v1/user/authJwt")
    // .then(response => {
    //   const data = response.data
    //   setAuthData(data)
    // })
    // .catch(e => console.error(e))
  // }, []);

  // 假設 API 回傳的 `data` 是具體用戶資料
  return (
    <div>
      {auth}
    </div>
  );
}

export default Authdata