import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, List, Avatar, notification, Input, AutoComplete } from 'antd';
import {
  BellOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import ChatRoomChannel from './components/ChatRoomChannel';
import ChatRoomModal from './components/ChatRoomModal';
import UserFriend from './components/UserFriend';
import Post from './components/Post';
import UploadPost from './components/UploadPost';
import Login from './components/Login';

import axiox from './axiox';
import stompClient from './StompClient'

const { Header, Content, Sider } = Layout;
const { Search } = Input;

const scrollbarHiddenStyle = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none'
};

const Main = () => {
  const postScrollRef = useRef(null)
  const [postScrollLock, setPostScrollLock] = useState(false)
  const [postScrollPage, setPostScrollPage] = useState(0)

  const channelScrollRef = useRef(null)
  const [channelScrollLock, setChannelScrollLock] = useState(false)
  const [channelScrollPage, setChannelScrollPage] = useState(0)

  const [channelConfig, setChannelConfig] = useState({})

  const [userAvatarPath, setUserAvatarPath] = useState(localStorage.getItem("userAvatarPath"))
  const [userName, setUserName] = useState(localStorage.getItem("userName"))
  const [userId, setUserId] = useState(localStorage.getItem("userId"))
  const [jwt, setJwt] = useState(localStorage.getItem("jwt"))
  const [email, setEmail] = useState(localStorage.getItem("email"))
  const [isLoginValid, setIsLoginValid] = useState(false)

  const [posts, setPosts] = useState([])
  const [myFriendships, setMyFriendships] = useState([])
  const [myMessages, setMyMessages] = useState([])
  const [chatroomChannels, setChatroomChannels] = useState([])

  useEffect(() => {
    const jwtStr = localStorage.getItem("jwt")
    setEmail(localStorage.getItem("email"))
    setUserAvatarPath(localStorage.getItem("userAvatarPath"))
    setUserName(localStorage.getItem("userName"))
    setUserId(localStorage.getItem("userId"))
    setJwt(jwtStr)
    if (jwtStr !== null) {
      setIsLoginValid(true)
      axiox.defaults.headers.common['Authorization'] = `Bearer ${jwtStr}`;
    } else {
      setIsLoginValid(false)
    }
  }, [])

  function fetchPostPage() {
    axiox.post("/api/v1/postPage",
      {
        page: postScrollPage
      }
    ).then(response => {
      const data = response.data
      const success = data.success
      const {page, totalPages} = data.data
      if (success && postScrollPage < totalPages) {
        setPosts(prev => [...prev, ...page])
      }
      setPostScrollLock(false)
      console.log(data)
    })
    .catch(e => console.error(e))
  }

  function fetchChannelPage() {
    axiox.post("/api/v1/chatroomPage",
      {
        page: postScrollPage
      }
    ).then(response => {
      const data = response.data
      const success = data.success
      const {page, totalPages} = data.data
      if (success && channelScrollPage < totalPages) {
        setChatroomChannels(prev => [...prev, ...page])
      }
      console.log(data)
      // setChannelScrollLock(false)
    })
    .catch(e => console.error(e))
  }

  useEffect(() => {
    stompClient.connect({}, (frame) => {
      // #貼文
      stompClient.subscribe(`/topic/post/new`, (msgPost) => {
        setPosts(prev => [msgPost, ...prev])
      })
      stompClient.subscribe(`/topic/post/delete`, (msgPost) => {
        setPosts(prev => 
          prev.filter( p => p.postId !== msgPost.postId)
        )
      })

      // 聊天室頻道
      stompClient.subscribe(`/topic/chatroom/new/${userId}`, (msgChatroom) => {
        setChatroomChannels(prev => [msgChatroom, ...prev])
      })

      // 交友
      stompClient.subscribe(`/topic/friendship/${userId}`, (msgFriendships) => {
        const dropdwonFriendships = msgFriendships.map((friendship,i) => (
          {
            value: i,
            label: (
              <UserFriend item={friendship} />
            ),
          }
        ))
        setOptions(dropdwonFriendships);
      })
      stompClient.subscribe(`/topic/friendship/new/${userId}`, (msg) => {
        console.log(msg)
      })

      // 交友通知(page)
      stompClient.subscribe(`/topic/friendship/notification/${userId}`, (msgFriendships) => {
        setMyFriendships(msgFriendships)
      })
      // 新加入的交友通知
      stompClient.subscribe(`/topic/friendship/notification/new/${userId}`, (msgFriendship) => {
        // 看看同friendship有沒有存在
        console.log(msgFriendship)
        setMyFriendships(prev => {
          const index = prev.findIndex(item => item.friendshipId === msgFriendship.friendshipId);
          if (index !== -1) {
              // 如果找到，替换该对象
              prev[index] = msgFriendship;
          } else {
              // 如果没有找到，将新的对象放在数组的最前面
              prev.unshift(msgFriendship);
          }
          return prev
        })
      })

      // 未讀訊息(page)
      stompClient.subscribe(`/topic/message/notification/${userId}`, (msgMessages) => {
        console.log(msgMessages)
        setMyMessages(msgMessages)
      })
      stompClient.subscribe(`/topic/message/notification/new/${userId}`, (msgMessage) => {
        console.log(msgMessage)
      })
      
      fetchChannelPage()
      stompClient.send("/app/friendship/notification", {Authorization: `Bearer ${jwt}`}, {})
      stompClient.send("/app/message/notification", {Authorization: `Bearer ${jwt}`}, {})
    })
  }, [])

  // 側欄開闔
  const [collapsed, setCollapsed] = useState(false);

  // 搜尋下拉選單
  const [options, setOptions] = useState([]);

  const handlePostScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = postScrollRef.current
    if (scrollTop + clientHeight + 20 >= scrollHeight && postScrollLock == false) {
      // console.log(`${scrollTop} ${scrollHeight} ${clientHeight}`)
      setPostScrollLock(true)
      setPostScrollPage(prev => prev + 1)
    }
  }

  // page 遞增
  useEffect(() => {
    fetchPostPage()
  }, [postScrollPage])

  const handleSearch = (value) => {
    // 模擬搜尋邏輯，可以替換為你的 API 請求
    if (!value) {
      setOptions([]);
    } else {
      stompClient.send("/app/friendship", {Authorization: `Bearer ${jwt}`}, {searchName: value})
    }
  };

  const handleProfile = () => {
    console.log('個人主頁面')
  }

  const handleLogout = () => {
    console.log('登出')
    localStorage.removeItem("jwt")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    setIsLoginValid(false)
    window.location.href = '/'
  }

  const handleLogin = () => {
    console.log('登入')
  }

  const menus = isLoginValid ? [
    { label: <div style={{width: 200, textAlign: "right"}}>你好，{localStorage.getItem("userName")}</div>, key: 'nusername', } ,
    { label: "個人資訊", key: 'nprofile', 
      icon: <UserOutlined style={{ fontSize: '20px', color:'white' }} />, 
      onClick: () => handleProfile() 
    } ,
    { label: "通知", key: 'nevent', icon: <BellOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => openFriendshipNotification('您有新的通知', myFriendships)} ,
    { label: "訊息", key: 'nmessage', icon: <MessageOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => openMessageNotification('您有新的通知', myMessages)} ,
    { label: "登出", key: 'nlogout', icon: <LogoutOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => handleLogout() } ,
    { label: "", key: 'ndrawer', icon: <MenuOutlined style={{ fontSize: '20px', color: 'white' }} />, onClick: () => setCollapsed(!collapsed)} ,
  ] : [
    { label: "登入", key: 'nlogin', icon: <LoginOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => handleLogin() } ,
  ]

  const openMessageNotification = (message, data) => {
    notification.open({
      message: message,
      description: (
        <List
          itemLayout="horizontal"
          dataSource={data}
          style={{
            overflowY: 'auto',
            height: '30vh',
            ...scrollbarHiddenStyle
          }}
          renderItem={item => (
            <ChatRoomChannel item={item} onClick={() => console.log('聊天室頻道')}/>
          )}
        />
      ),
      style: { width: 320 },
    });
  };

  const openFriendshipNotification = (message, data) => {
    notification.open({
      message: message,
      description: (
        <List
          itemLayout="horizontal"
          dataSource={data}
          style={{
            overflowY: 'auto',
            height: '30vh',
            ...scrollbarHiddenStyle
          }}
          renderItem={item => (
            <UserFriend item={item}/>
          )}
        />
      ),
      style: { width: 320 },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#e5e7f0'}}>
      <Header className="header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 4px 0px 20px',
        backgroundColor: 'steelblue',
        height: 48,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginRight: '20px' }}>Nekoo</div>
          { isLoginValid && 
            <AutoComplete
              options={options}
              onSearch={handleSearch}
              style={{ width: 320 }}
            >
              <Search
                placeholder="搜尋用戶"
                allowClear
                style={{ 
                  borderRadius: '20px', 
                  overflow: 'hidden', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </AutoComplete>
          }
        </div>
        <Menu mode="horizontal"  theme="dark" 
        selectable={false}
        style={{ 
          display: 'flex', 
          justifyContent: 'end', 
          alignItems: 'center',
          height: '100%',
          border: 'none', 
          backgroundColor: 'transparent',
          maxWidth: 800
        }} 
        items={menus}/>
      </Header>

      { isLoginValid && <Layout>
        <Content style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', backgroundColor: '#e5e7f0' }}>
          <div style={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            overflowY: 'auto',
          }}>
            <div 
              ref={postScrollRef} 
              style={{ 
                width: '100%', 
                // maxWidth: '880px',
                maxWidth: '720px',
                height: '100%', 
                overflowY: 'scroll',
                padding: '0px 16px',
                ...scrollbarHiddenStyle
              }}
              onScroll={handlePostScroll}
            >
              <UploadPost />
              {posts.map(post => (
                <Post key={`post-${post.postId}`} item={post}/>
              ))}
            </div>
          </div>
        </Content>

        <Sider
          width={300}
          collapsedWidth={0}
          breakpoint="lg"
          collapsed={collapsed}
          onCollapse={(collapsed, type) => {
            setCollapsed(collapsed);
          }}
          style={{ 
            backgroundColor: '#fff',
            boxShadow: '-1px 0 3px rgba(0,0,0,0.1)',
            height: 'calc(100vh - 48px)',
            overflow: 'auto',
            padding: collapsed ? '0px' : '20px',
          }}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Search
              placeholder="搜尋聊天室"
              allowClear
              onSearch={(value) => console.log(value)}
            />
            <div style={{ flexGrow: 1, overflowY: 'auto', ...scrollbarHiddenStyle }}>
              <List
                itemLayout="horizontal"
                dataSource={chatroomChannels}
                renderItem={item => (
                  <ChatRoomChannel item={item} onClick={(data) => setChannelConfig(data)}/>
                )}
              />
            </div>
          </div>
        </Sider>
        <ChatRoomModal visible={true} config={channelConfig} />
      </Layout>
      }
      {!isLoginValid && <Login />}
    </Layout>
  );
};

export default Main;