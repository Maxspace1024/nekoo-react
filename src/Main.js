import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, List, Avatar, notification, Input, AutoComplete, Spin, Alert } from 'antd';
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
import { useAuth } from "./AuthContext";
import axiox from './axiox';
import stompClient from './StompClient'

const { Header, Content, Sider } = Layout;
const { Search } = Input;

const scrollbarHiddenStyle = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none'
};

const Main = () => {
  const { auth, setAuth } = useAuth();
  const [loading, setLoading] = useState(true);

  const postScrollRef = useRef(null)
  const [postScrollLock, setPostScrollLock] = useState(false)
  const [postScrollPage, setPostScrollPage] = useState(0)

  const channelScrollRef = useRef(null)
  const [channelScrollLock, setChannelScrollLock] = useState(false)
  const [channelScrollPage, setChannelScrollPage] = useState(0)

  const [channelConfig, setChannelConfig] = useState({})

  const [isLoginValid, setIsLoginValid] = useState(false)

  const [posts, setPosts] = useState([])
  const [myFriendships, setMyFriendships] = useState([])
  const [myMessages, setMyMessages] = useState([])
  const [chatroomChannels, setChatroomChannels] = useState([])

  useEffect(() => {
    // check jwt
    const jwtString = localStorage.getItem('jwt')
    if ( jwtString !== "null" || jwtString.trim() !== "" ) {
      axiox.defaults.headers.common['Authorization'] = `Bearer ${jwtString}`;
      axiox.post("/api/v1/user/auth")
      .then(response => {
        const authInfo = response.data.data
        if (JSON.stringify(authInfo) !== "{}") {
          // authInfo.userId = String(authInfo.userId)
          setAuth(authInfo)
          setIsLoginValid(true)
        }
      })
      .catch(e => console.error(e))
      .finally(() => {
        setLoading(false)
      })
    }
  }, [setAuth])

  // stomp
  useEffect(() => {
    if (auth !== null) {
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
        stompClient.subscribe(`/topic/chatroom/new/${auth.userId}`, (msgChatroom) => {
          setChatroomChannels(prev => [msgChatroom, ...prev])
        })

        // 交友
        stompClient.subscribe(`/topic/friendship/${auth.userId}`, (msgFriendships) => {
          const dropdwonFriendships = msgFriendships.map((friendship,i) => (
            {
              value: i,
              label: (
                <UserFriend key={i} item={friendship} />
              ),
            }
          ))
          setOptions(dropdwonFriendships);
        })
        stompClient.subscribe(`/topic/friendship/new/${auth.userId}`, (msg) => {
          console.log(msg)
        })

        // 交友通知(page)
        stompClient.subscribe(`/topic/friendship/notification/${auth.userId}`, (msgFriendships) => {
          setMyFriendships(msgFriendships)
        })
        // 新加入的交友通知
        stompClient.subscribe(`/topic/friendship/notification/new/${auth.userId}`, (msgFriendship) => {
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
        stompClient.subscribe(`/topic/message/notification/${auth.userId}`, (msgMessages) => {
          console.log(msgMessages)
          setMyMessages(msgMessages)
        })
        stompClient.subscribe(`/topic/message/notification/new/${auth.userId}`, (msgMessage) => {
          console.log(msgMessage)
        })
        
        fetchChannelPage()
        stompClient.send("/app/friendship/notification", {Authorization: `Bearer ${auth.jwt}`}, {})
        stompClient.send("/app/message/notification", {Authorization: `Bearer ${auth.jwt}`}, {})
      })
    }
  }, [auth])

  function fetchPostPage() {
    axiox.post("/api/v1/postPage",
      {
        page: postScrollPage
      }
    ).then(response => {
      const data = response.data
      const success = data.success
      if (data.data != null) {      
        const {page, totalPages} = data.data
        if (success && postScrollPage < totalPages) {
          setPosts(prev => [...prev, ...page])
        }
        setPostScrollLock(false)
      }
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
      if (data.data != null) {      
        const {page, totalPages} = data.data
        if (success && channelScrollPage < totalPages) {
          setChatroomChannels(prev => [...prev, ...page])
        }
        console.log(data)
        // setChannelScrollLock(false)
      }
    })
    .catch(e => console.error(e))
  }

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
      stompClient.send("/app/friendship", {Authorization: `Bearer ${auth.jwt}`}, {searchName: value})
    }
  };

  const handleKeyDown = (e) => {
    if (e.code === "Enter") {
      console.log(e)
    }
  }

  const handleProfile = () => {
    console.log('個人主頁面')
  }

  const handleLogout = () => {
    console.log('登出')
    setAuth({})
    localStorage.removeItem('jwt')
    setIsLoginValid(false)
    window.location.href = '/'
  }

  const handleLogin = () => {
    console.log('登入')
  }

  const menus = isLoginValid ? [
    { label: <div style={{textAlign: "right"}}>{auth.userName}</div>, key: 'nprofile', 
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

  // body
  // 如果還在載入中，顯示載入提示
  if (loading) {
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
          <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginRight: '20px' }}>NEKOO</div>
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
          }} 
          items={menus}/>
        </Header>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          {loading && <Spin tip="Loading..."></Spin>}
        </div>
      </Layout>
    )
  }

  // 如果 auth 仍然是 null，表示登入失敗或無法取得資料
  if (!auth || !isLoginValid) {
    // return <div>No user data available.</div>;
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
          <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginRight: '20px'}}>NEKOO</div>
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
          }} 
          items={menus}/>
        </Header>
        <Login />
      </Layout>
    )
  }

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
        <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginRight: '20px' }}>NEKOO</div>
          { isLoginValid && 
            <AutoComplete
              options={options}
              onSearch={handleSearch}
              onInputKeyDown={handleKeyDown}
              style={{ width: 280 }}
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
          width: 600
        }} 
        items={menus}/>
      </Header>

      <Layout>
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
    </Layout>
  );
};

export default Main;