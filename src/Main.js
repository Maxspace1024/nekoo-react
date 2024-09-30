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

  const [channelConfig, setChannelConfig] = useState({})

  const [userName, setUserName] = useState(localStorage.getItem("userName"))
  const [userId, setUserId] = useState(localStorage.getItem("userId"))
  const [jwt, setJwt] = useState(localStorage.getItem("jwt"))
  const [isLoginValid, setIsLoginValid] = useState(false)

  const [posts, setPosts] = useState([])
  const [myFriendships, setMyFriendships] = useState([])
  const [myMessages, setMyMessages] = useState([])
  const [myChatrooms, setMyChatrooms] = useState([])

  useEffect(() => {
    const jwtStr = localStorage.getItem("jwt")
    setUserName(localStorage.getItem("userName"))
    setUserId(localStorage.getItem("userId"))
    setJwt(jwtStr)
    if (jwtStr !== null) {
      setIsLoginValid(true)
    } else {
      setIsLoginValid(false)
    }
  }, [])

  useEffect(() => {
    stompClient.connect({}, (frame) => {
      // 貼文
      stompClient.subscribe(`/topic/post`, (msgPosts) => {
        setPosts(prev => [...prev, ...msgPosts])
        setPostScrollLock(false)
      })
      stompClient.subscribe(`/topic/post/new`, (msgPost) => {
        setPosts(prev => [msgPost, ...prev])
      })
      stompClient.subscribe(`/topic/post/delete`, (msgPost) => {
        setPosts(prev => 
          prev.filter( p => p.postId !== msgPost.postId)
        )
        // delete
      })

      // 聊天室頻道
      stompClient.subscribe(`/topic/myChatroom/${userId}`, (msgChatrooms) => {
        setMyChatrooms(msgChatrooms)
      })
      stompClient.subscribe(`/topic/myChatroom/new/${userId}`, (msg) => {
        console.log(msg)
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

      stompClient.send("/app/post", {Authorization: `Bearer ${jwt}`}, {})
      stompClient.send("/app/myChatroom", {Authorization: `Bearer ${jwt}`}, {})
      stompClient.send("/app/friendship/notification", {Authorization: `Bearer ${jwt}`}, {})
      stompClient.send("/app/message/notification", {Authorization: `Bearer ${jwt}`}, {})
    })
  }, [])

  const [collapsed, setCollapsed] = useState(false);

  const [options, setOptions] = useState([]);

  const handlePostScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = postScrollRef.current
    
    if (scrollTop + clientHeight + 20 >= scrollHeight && postScrollLock == false) {
      // console.log(`${scrollTop} ${scrollHeight} ${clientHeight}`)
      // setPostScrollLock(true)
      setPostScrollPage(prev => prev + 1)
    }
  }

  useEffect(() => {
    stompClient.send("/app/post", {Authorization: `Bearer ${jwt}`}, {page: postScrollPage})
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

  const openChatroom = (chatroomUuid) => {
    console.log(chatroomUuid)
  }

  const menus = isLoginValid ? [
    { label: "", key: 'nevent', icon: <BellOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => openFriendshipNotification('您有新的通知', myFriendships)} ,
    { label: "", key: 'nmessage', icon: <MessageOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => openMessageNotification('您有新的通知', myMessages)} ,
    { label: "", key: 'nprofile', icon: <UserOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => handleProfile() } ,
    { label: "", key: 'nlogout', icon: <LogoutOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => handleLogout() } ,
    { label: "", key: 'ndrawer', icon: <MenuOutlined style={{ fontSize: '20px', color: 'white' }} />, onClick: () => setCollapsed(!collapsed)} ,
  ] : [
    { label: "", key: 'nlogin', icon: <LoginOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => handleLogin() } ,
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
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 20px',
        backgroundColor: '#001529',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginRight: '20px' }}>Nekoo</div>
          <AutoComplete
            options={options}
            onSearch={handleSearch}
            style={{ width: 320 }}
          >
            <Search
              placeholder="搜尋貼文標籤"
              allowClear
              style={{ 
                borderRadius: '20px', 
                overflow: 'hidden', 
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            />
          </AutoComplete>
        </div>
        <Menu mode="horizontal" theme="dark" selectable={false} style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          border: 'none', 
          backgroundColor: 'transparent'
        }} items={menus}/>
      </Header>

      { isLoginValid && <Layout>
        <Content style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
          <div style={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            overflowY: 'auto', 
            backgroundColor: '#f0f2f5' 
          }}>
            <div 
              ref={postScrollRef} 
              style={{ 
                width: '100%', 
                maxWidth: '880px',
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
            height: 'calc(100vh - 64px)',
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
                dataSource={myChatrooms}
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