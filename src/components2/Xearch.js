import React, { useEffect, useState } from "react";
import { List, Space, Tabs } from "antd";
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

  const { TabPane } = Tabs;

const UserTab = () => (
  <div>
    <h2>用戶資訊</h2>
    <p>這裡顯示用戶的相關資訊。</p>
  </div>
);

const PostTab = () => (
  <div>
    <h2>貼文列表</h2>
    <p>這裡顯示用戶的貼文列表。</p>
  </div>
);

const TagTab = () => (
  <div>
    <h2>標籤列表</h2>
    <p>這裡顯示熱門標籤。</p>
  </div>
);

  return (
    <div 
      // ref={postScrollRef} 
      style={{ 
        flexGrow: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        height: '100%',
        overflowY: 'scroll',
        // ...xtyle.hideScrollbar
      }}
      // onScroll={handlePostScroll}
      // onClick={() => {
      //   console.log(`${postScrollRef.current.scrollLeft} ${postScrollRef.current.scrollTop}`)
      // }}
    >
      <Space 
        direction='vertical' 
        style={{
          width: '100%', 
          maxWidth: '800px',
          height: '100%', 
          padding: '0px 16px',
        }}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="用戶" key="1">
            <UserTab />
          </TabPane>
          <TabPane tab="貼文" key="2">
            <PostTab />
          </TabPane>
          <TabPane tab="標籤" key="3">
            <TagTab />
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );

  // return (
  //   <div style={xtyle.xearchPage}>
  //     <div style={{...xtyle.xearchCol, ...xtyle.hideScrollbar, flex: 1}}>
  //       <div style={xtyle.xearchTopLable}>
  //         <h2>用戶</h2>
  //       </div>
  //       <List
  //         itemLayout="horizontal"
  //         dataSource={searchFriendships}
  //         style={{backgroundColor: "white", padding: '0 24px', borderRadius: 8}}
  //         renderItem={item => (
  //           <UserFriend item={item} userId={auth.userId}/>
  //         )}
  //       />
  //     </div>
  //     <div style={{...xtyle.xearchCol, ...xtyle.hideScrollbar, flex: 2}}>
  //       <div style={xtyle.xearchTopLable}>
  //         <h2>貼文</h2>
  //       </div>
  //     </div>
  //     <div style={{...xtyle.xearchCol, ...xtyle.hideScrollbar, flex: 2}}>
  //       <div style={xtyle.xearchTopLable}>
  //         <h2>標籤</h2>
  //       </div>
  //     </div>
  //   </div>
  // )
}

export default Xearch