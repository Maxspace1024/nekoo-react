import React, { useState, useEffect } from 'react';
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

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axiox from './axiox';


const { Header, Content, Sider } = Layout;
const { Search } = Input;

const chatLogs = [
  { chatLogId: 1, chatroomId: "asdf", userAvatarPath: "https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg", content: "你好！", sender: "other", createAt: "2024-09-28T04:10:42.417Z" },
  { chatLogId: 2, chatroomId: "asdf", userAvatarPath: "https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg", content: "嗨，最近如何？", sender: "self", createAt: "2024-09-28T04:11:42.417Z" },
];

const scrollbarHiddenStyle = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none'
};

const Main = () => {
  const [userName, setUserName] = useState(localStorage.getItem("userName"))
  const [userId, setUserId] = useState(localStorage.getItem("userId"))
  const [jwt, setJwt] = useState(localStorage.getItem("jwt"))
  const [isLoginValid, setIsLoginValid] = useState(false)

  const [posts, setPosts] = useState([])
  const [myFriendships, setMyFriendships] = useState([])
  const [myMessages, setMyMessages] = useState([])
  const [myChatrooms, setMyChatrooms] = useState([])
  const [userChatLogs, setUserChatLogs] = useState(chatLogs)

  const [stompClient, setStompClient] = useState(null)
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
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    const userId = localStorage.getItem("userId")
    const jwt = localStorage.getItem("jwt")
    client.connect({}, (frame) => {
      // 貼文
      client.subscribe(`/topic/post`, (msg) => {
        const msgPosts = JSON.parse(msg.body)
        setPosts(msgPosts)
      })
      client.subscribe(`/topic/post/new`, (msg) => {
        const msgPost = JSON.parse(msg.body)
        setPosts(prev => [msgPost, ...prev])
      })
      client.subscribe(`/topic/post/delete`, (msg) => {
        const msgPost = JSON.parse(msg.body)
        // delete
      })

      // 聊天室頻道
      client.subscribe(`/topic/myChatroom/${userId}`, (msg) => {
        const msgChatrooms = JSON.parse(msg.body)
        setMyChatrooms(msgChatrooms)
      })
      client.subscribe(`/topic/myChatroom/new/${userId}`, (msg) => {
        console.log(msg)
      })

      // 交友
      client.subscribe(`/topic/friendship/${userId}`, (msg) => {
        const msgFriendships = JSON.parse(msg.body)
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
      client.subscribe(`/topic/friendship/new/${userId}`, (msg) => {
        console.log(msg)
      })

      // 交友通知(page)
      client.subscribe(`/topic/friendship/notification/${userId}`, (msg) => {
        const msgFriendships = JSON.parse(msg.body)
        setMyFriendships(msgFriendships)
      })
      // 新加入的交友通知
      client.subscribe(`/topic/friendship/notification/new/${userId}`, (msg) => {
        const msgFriendship = JSON.parse(msg.body)
        console.log(msgFriendship)
      })

      // 未讀訊息(page)
      client.subscribe(`/topic/message/notification/${userId}`, (msg) => {
        const msgMessages = JSON.parse(msg.body)
        console.log(msgMessages)
        setMyMessages(msgMessages)
      })
      client.subscribe(`/topic/message/notification/new/${userId}`, (msg) => {
        const msgMessage = JSON.parse(msg.body)
        console.log(msgMessage)
      })

      client.send("/app/post", {Authorization: `Bearer ${jwt}`}, "{}")
      client.send("/app/myChatroom", {Authorization: `Bearer ${jwt}`}, "{}")
      client.send("/app/friendship/notification", {Authorization: `Bearer ${jwt}`}, "{}")
      client.send("/app/message/notification", {Authorization: `Bearer ${jwt}`}, "{}")

      setStompClient(client)
    })
  }, [])

  const [collapsed, setCollapsed] = useState(false);

  const [options, setOptions] = useState([]);

  const handleSearch = (value) => {
    // 模擬搜尋邏輯，可以替換為你的 API 請求
    if (!value) {
      setOptions([]);
    } else {
      stompClient.send("/app/friendship", {Authorization: `Bearer ${jwt}`}, JSON.stringify({searchName: value}))
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
            onSelect={() => {}}
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
            <div style={{ 
              width: '100%', 
              maxWidth: '880px',
              height: '100%', 
              overflowY: 'scroll',
              padding: '0px 16px',
              ...scrollbarHiddenStyle
            }}>
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
                  <ChatRoomChannel item={item} onClick={() => openChatroom(item)}/>
                )}
              />
            </div>
          </div>
        </Sider>
        <ChatRoomModal visible={true} messagesx={userChatLogs}/>
      </Layout>
      }
      {!isLoginValid && <Login />}
    </Layout>
  );
};

export default Main;