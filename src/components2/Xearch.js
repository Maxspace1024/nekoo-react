import React, { useEffect, useState } from "react";
import { List } from "antd";
import { useLocation } from "react-router-dom";
import axiox from "../axiox";
import xtyle from "./CommonStyle"
import { useAuth } from "../context/AuthContext";
import { useFriendship } from '../context/FriendshipContext';
import UserFriend from "./UserFriend";

function Xearch() {
  const {auth, setAuth} = useAuth()
  const location = useLocation();
  const [query, setQuery] = useState("")
  const [queryAt, setQueryAt] = useState("")

  const {searchFriendships, setSearchFriendships} = useFriendship()

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    const queryAt = params.get("queryAt")
    setQuery(q)
    setQueryAt(queryAt)

    // 發送 axios 請求
    if (q && queryAt) {
      axiox
      .post(`/api/v1/friendship/search`, {
        searchName: q
      })
      .then(res => {
        const data = res.data
        if (res.status === 200 && data.data) {
          setSearchFriendships(data.data)
        } else {

        }
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
    }
  }, [location.search]);

  return (
    <div style={xtyle.xearchPage}>
      <div style={{...xtyle.xearchCol, ...xtyle.hideScrollbar, flex: 1}}>
        <div style={xtyle.xearchTopLable}>
          <h2>用戶</h2>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={searchFriendships}
          style={{backgroundColor: "white", padding: '0 24px', borderRadius: 8}}
          renderItem={item => (
            <UserFriend item={item} userId={auth.userId}/>
          )}
        />
      </div>
      <div style={{...xtyle.xearchCol, ...xtyle.hideScrollbar, flex: 2}}>
        <div style={xtyle.xearchTopLable}>
          <h2>貼文</h2>
        </div>
      </div>
      <div style={{...xtyle.xearchCol, ...xtyle.hideScrollbar, flex: 2}}>
        <div style={xtyle.xearchTopLable}>
          <h2>標籤</h2>
        </div>
      </div>
    </div>
  )
}

export default Xearch