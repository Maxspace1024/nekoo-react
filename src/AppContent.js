import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Layout, Menu, AutoComplete, Input, List, Spin, message, notification, Space } from 'antd';
import { HomeOutlined, UserOutlined, SettingOutlined, MenuOutlined, BellOutlined, MessageOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import Login from './components2/Login';

import xtyle from './components2/CommonStyle';
import PublicPost from './components2/PublicPost';
import Signup from './components2/Signup';
import ChatRoomChannelList from './components2/ChatRoomChannelList';
import UserFriend from './components2/UserFriend';
import Xearch from './components2/Xearch';

import { useFriendship } from './context/FriendshipContext';
import { useAuth } from './context/AuthContext';

import stompClient from './StompClient';
import axiox from './axiox';
import Neco from './components2/Neco';
import SinglePost from './components2/SinglePost';
import Xearch2 from './components2/Xearch2';
import Home from './components2/Home';
import { useProgress } from './context/ProgressContext';


const { Header, Content, Sider } = Layout;
const { Search } = Input;

const MainPage = () => {
  const navigate = useNavigate();
  const {auth, setAuth, isLoginValid, setIsLoginValid, isWsConnected, setIsWsConnected} = useAuth()
  const {s3Progress, setS3Progress} = useProgress()
  const {friendshipNotifications, setFriendshipNotifications} = useFriendship()
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true)

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    // check jwt
    const jwtString = localStorage.getItem('jwt')
    if ( jwtString !== "null" || jwtString.trim() !== "" ) {
      axiox.defaults.headers.common['Authorization'] = `Bearer ${jwtString}`;
      axiox.post("/api/v1/user/auth")
      .then(res => {
        const authInfo = res.data.data
        if (JSON.stringify(authInfo) !== "{}") {
          setAuth(authInfo)
          setIsLoginValid(true)
        } else {
          setIsLoginValid(false)
        }
      })
      .catch(e => {
        console.error(e)
        localStorage.removeItem("jwt")
        setIsLoginValid(false)
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setIsLoginValid(false)
    }
  }, [setAuth])

  // stomp
  useEffect(() => {
    if (auth !== null) {
      stompClient.connect({}, (frame) => {
        setIsWsConnected(true)
        console.log('connect time: ' + new Date().toISOString())
      }, (e) => {
        console.log('error time: ' + new Date().toISOString())
        setTimeout(() => {
          console.error(e)
        }, 5000)
      })
    }
  }, [auth])

  useEffect(() => {
    if (isWsConnected) {
      stompClient.subscribe(`/topic/post/progress/${auth.userId}`, (msgProgress) => {
        setS3Progress(Math.round(msgProgress.progress))
      })

      stompClient.subscribe(`/topic/friendship/notification/new/${auth.userId}`, (msgFriendship) => {
        const isRecv = auth.userId === msgFriendship.receiverUserId
        if (isRecv) {
          if (msgFriendship.friendshipState === 0) {
            notification.open({
              message: "通知",
              description: <><strong>{msgFriendship.senderUserName}</strong>{' 邀請你成為朋友'}</>,
              style: { width: 320 }
            })
          } else if (msgFriendship.friendshipState === 1) {
            notification.open({
              message: "通知",
              description: <>{'和 '}<strong>{msgFriendship.senderUserName}</strong>{' 已經成為朋友'}</>,
              style: { width: 320 }
            })  
          }
        } else {
          if (msgFriendship.friendshipState === 1) {
            notification.open({
              message: "通知",
              description: <>{'和 '}<strong>{msgFriendship.receiverUserName}</strong>{' 已經成為朋友'}</>,
              style: { width: 320 }
            })  
          }
        }
        setFriendshipNotifications(prev => {
          const index = prev.findIndex(item => item.friendshipId === msgFriendship.friendshipId);
          if (index !== -1) {
              prev[index] = msgFriendship;
          } else {
              prev.unshift(msgFriendship);
          }
          return prev
        })
      })
    }
  }, [isWsConnected])

  useEffect(() => {
    axiox.post("/api/v1/friendship/searchNotification", {})
    .then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        setFriendshipNotifications(data.data)
      } else {

      }
    })
    .catch(e => {
      console.error(e)
    })
  }, [])

  const onSearch = (value) => {
    if (value || value === "") {
      value = value.replace('>', "").replace('<', "")
      navigate(`/search?q=${encodeURIComponent(value)}`)
    }
  }

  const openFriendshipNotification = (message, data) => {
    api.open({
      message: message,
      description: (
        <List
          itemLayout="horizontal"
          dataSource={data}
          style={{
            overflowY: 'auto',
            height: '30vh',
            ...xtyle.hideScrollbar
          }}
          renderItem={item => (
            <UserFriend item={item} userId={auth.userId}/>
          )}
        />
      ),
      style: { width: 320 },
      onClick: () => {}
    });
  };

  if (loading || !isLoginValid) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#e5e7f0'}}>    
        <Header className="header" style={xtyle.header}>
          <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
            <div style={xtyle.textLogo} 
              onClick={() => {
                if (isLoginValid)
                  navigate("/publicPost")
                else 
                  navigate("/")
              }}
            >
              NEKOO
            </div>
          </div>
          <Space size='large' style={{cursor:'pointer'}}>
            <Space style={{color: 'white', fontSize: 24}} onClick={() => navigate('/login')}>
              <LoginOutlined style={xtyle.menuItem} />
              <p style={xtyle.menuLabel}>登入</p>
            </Space>
          </Space>
        </Header>

        <Layout>
          <Content style={xtyle.content}>
            {loading &&
              <div style={xtyle.contentCenter}>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin></Spin>
                </div>
              </div>
            }

            { !loading &&
             <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            }
          </Content>
        </Layout>
      </Layout>
    )
  }

  if (!isWsConnected) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#e5e7f0'}}>    
        <Header className="header" style={xtyle.header}>
          <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
            <div style={xtyle.textLogo} 
              onClick={() => {
                if (isLoginValid)
                  navigate("/publicPost")
                else 
                  navigate("/")
              }}
            >
              NEKOO
            </div>
          </div>
          <Space size='large' style={{cursor:'pointer'}}>
            <Space style={{color: 'white', fontSize: 24}} onClick={() => navigate('/login')}>
              <LoginOutlined style={xtyle.menuItem} />
              <p style={xtyle.menuLabel}>登入</p>
            </Space>
          </Space>
        </Header>

        <Layout>
          <Content style={xtyle.content}>
            <div style={xtyle.contentCenter}>
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin></Spin>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#e5e7f0'}}>
      <Header className="header" style={xtyle.header}>
        <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
          <div style={xtyle.textLogo} 
            onClick={() => {
              if (isLoginValid)
                navigate("/publicPost")
              else 
                navigate("/")
            }}
          >NEKOO
          </div>
          <Search
            placeholder="搜尋"
            allowClear
            style={xtyle.menuSearch}
            onSearch={onSearch}
          />
        </div>
        <Space size='large' style={{cursor:'pointer'}}>
          {/* user name */}
          <Space style={xtyle.menuItem} onClick={() => navigate(`/neco/${auth.userId}`)}>
            <UserOutlined />
            <span style={{textAlign: "right", ...xtyle.menuLabel}}>{auth ? auth.userName : ''}</span>
          </Space>
          {/* notification */}
          <Space style={xtyle.menuItem}>
            <BellOutlined />
            <div style={{position: 'relative'}} 
              onClick={(e) => {
                e.stopPropagation(); // 防止事件冒泡到父層
                openFriendshipNotification('您有新的通知', friendshipNotifications);
              }}
            >
              {contextHolder}
              <span style={xtyle.menuLabel}>
                通知
              </span>
              {friendshipNotifications.length > 0 && (
                <span style={xtyle.menuCountLabel}>
                  {friendshipNotifications.length}
                </span>
              )}
            </div>
          </Space>
          {/* logout */}
          <Space style={xtyle.menuItem}
            onClick={
              () => {
                localStorage.removeItem('jwt')
                setAuth(null)
                setIsLoginValid(false)
                navigate('/')
              }
            }
          >
            <LogoutOutlined />
            <span style={xtyle.menuLabel}>登出</span>
          </Space>
          {/* collapse */}
          <Space style={xtyle.menuItem} onClick={() => setCollapsed(!collapsed)}>
            <MenuOutlined/>
            <span style={xtyle.menuLabel}>&nbsp;</span>
          </Space>
        </Space>
      </Header>

      <Layout>
        <Content style={xtyle.content}>
          <div style={xtyle.contentCenter}>
            <Content>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Xearch2 />} />
                <Route path="/publicPost" element={<PublicPost />} />
                <Route path="/neco/:userId" element={<Neco />} />
                <Route path="/post/:postId" element={<SinglePost />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Content>
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
          style={{...xtyle.sider, padding: collapsed ? '0px' : '20px', ...xtyle.hideScrollbar}}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ChatRoomChannelList />
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
};

const AppContent = () => (
  <Router>
    <MainPage />
  </Router>
);

export default AppContent;