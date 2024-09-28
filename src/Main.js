import React, { useState, useEffect } from 'react';
import { Layout, Menu, List, Avatar, notification, Input, AutoComplete } from 'antd';
import {
  BellOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  LoginOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';
import User from './components/User';
import UserFriend from './components/UserFriend';
import NewMessage from './components/NewMessage';
import Post from './components/Post';
import ChatRoom from './components/ChatRoom';
import Login from './components/Login';

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axiox from './axiox';
import UploadPost from './components/UploadPost';

const { Header, Content, Sider } = Layout;
const { Search } = Input;


const posts = [
  {
    postId: "9442-asdf",
    userId: 1,
    userName: "asdf", 
    userAvatarPath: "https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg",
    privacy: 0,
    content: '這是一個貼文的範例，展示了滾動效果...',
    hashtags: ['馬路', '亂七八糟'],
    assets: [
      {
        id: 'x', 
        type: 0, //static
        path: "cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg"
      }
    ],
    totalDanmakuCount: 1234,
    createAt: '2023/08/23 21:32:00', 
  },
]

const messages = [
  { id: 1, text: "你好！", sender: "other", time: "10:00" },
  { id: 2, text: "嗨，最近如何？", sender: "self", time: "10:01" },
];

const chatRooms = [
  {"chatroomId":7,"chatroomUuid":"d42edfd5-a850-4d29-9a46-59efa65a2277","chatroomName":"qwer","chatroomAvatarPath": "https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg","lastContent":"晚安沒大腦","lastCreateAt":"2024-09-28T04:10:42.417Z"}
]

const newMessages = [
  { name: '用戶 A', message: '這是用戶 A 的最新訊息', createAt: '週日' },
  { name: '用戶 B', message: '這是用戶 B 的最新訊息', createAt: '週日' },
  { name: '用戶 C', message: '這是用戶 C 的最新訊息', createAt: '週日' },
]

const newEvents = [
  { name: '用戶 A', message: '這是用戶 A 的最新訊息', createAt: '週日' },
  { name: '用戶 B', message: '這是用戶 B 的最新訊息', createAt: '週日' },
  { name: '用戶 C', message: '這是用戶 C 的最新訊息', createAt: '週日' },
  { name: '用戶 C', message: '這是用戶 C 的最新訊息', createAt: '週日' },
]

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
  const [chatrooms, setChatrooms] = useState([])
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
      console.log(frame)

      client.subscribe(`/topic/post`, (msg) => {
        const msgPosts = JSON.parse(msg.body)
        setPosts(msgPosts)
      })
      client.subscribe(`/topic/post/new`, (msg) => {
        const msgPost = JSON.parse(msg.body)
        setPosts(prev => [msgPost, ...prev])
      })

      client.subscribe(`/topic/myChatroom/${userId}`, (msg) => {
        const msgChatrooms = JSON.parse(msg.body)
        setChatrooms(msgChatrooms)
      })
      client.subscribe(`/topic/myChatroom/new/${userId}`, (msg) => {
        console.log(msg)
      })
      client.send("/app/post", {Authorization: `Bearer ${jwt}`}, "{}")
      client.send("/app/myChatroom", {Authorization: `Bearer ${jwt}`}, "{}")

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
      setOptions([
        {
          value: '1',
          label: (
            <UserFriend />
          ),
        }
      ]);
    }
  };

  const handleProfile = () => {
    console.log('個人主頁面')
  }

  const handleLogout = () => {
    console.log('登出')
    localStorage.setItem("jwt", null)
    window.location.href = '/'
  }

  const handleLogin = () => {
    console.log('登入')
  }

  const menus = isLoginValid ? [
    { label: "", key: 'nevent', icon: <BellOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => openEventNotification('您有新的通知', newEvents)} ,
    { label: "", key: 'nmessage', icon: <MessageOutlined style={{ fontSize: '20px', color:'white' }} />, onClick: () => openMessageNotification('您有新的通知', newMessages)} ,
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
            <NewMessage item={item} />
          )}
        />
      ),
      style: { width: 320 },
    });
  };

  const openEventNotification = (message, data) => {
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

  const openChatroom = (chatroomUuid) => {
    console.log(chatroomUuid)
  }

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
            <div style={{ 
              width: '100%', 
              maxWidth: '880px',
              height: '100%', 
              overflowY: 'scroll',
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
                dataSource={chatrooms}
                renderItem={item => (
                  <User item={item} onClick={() => openChatroom(item)}/>
                )}
              />
            </div>
          </div>
        </Sider>
        <ChatRoom visible={true} messagesx={messages}/>
      </Layout>
      }
      {!isLoginValid && <Login />}
    </Layout>
  );
};

export default Main;