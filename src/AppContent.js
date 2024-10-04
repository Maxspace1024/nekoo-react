import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout, Menu, AutoComplete, Input, List, Spin } from 'antd';
import { HomeOutlined, UserOutlined, SettingOutlined, MenuOutlined, BellOutlined, MessageOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import Login from './components2/Login';

import xtyle from './components2/CommonStyle';
import PublicPost from './components2/PublicPost';
import Signup from './components2/Signup';
import ChatRoomChannelList from './components2/ChatRoomChannelList';

import { useAuth } from './context/AuthContext';

import stompClient from './StompClient';
import axiox from './axiox';


const { Header, Content, Sider } = Layout;
const { Search } = Input;

const MainPage = () => {
  const navigate = useNavigate();
  const {auth, setAuth, isLoginValid, setIsLoginValid, isWsConnected, setIsWsConnected} = useAuth()
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // check jwt
    const jwtString = localStorage.getItem('jwt')
    if ( jwtString !== "null" || jwtString.trim() !== "" ) {
      axiox.defaults.headers.common['Authorization'] = `Bearer ${jwtString}`;
      axiox.post("/api/v1/user/auth")
      .then(response => {
        const authInfo = response.data.data
        if (JSON.stringify(authInfo) !== "{}") {
          setAuth(authInfo)
          setIsLoginValid(true)
        }
      })
      .catch(e => console.error(e))
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
      //   // 交友
      //   stompClient.subscribe(`/topic/friendship/${auth.userId}`, (msgFriendships) => {
      //     const dropdwonFriendships = msgFriendships.map((friendship,i) => (
      //       {
      //         value: i,
      //         label: (
      //           <UserFriend key={i} item={friendship} />
      //         ),
      //       }
      //     ))
      //     setOptions(dropdwonFriendships);
      //   })
      //   stompClient.subscribe(`/topic/friendship/new/${auth.userId}`, (msg) => {
      //     console.log(msg)
      //   })
      })
    }
  }, [auth])

  const menus = isLoginValid ? [
    { 
      label: <div style={{textAlign: "right", ...xtyle.menuLabel}}>{auth ? auth.userName : ''}</div>,
      key: 'nprofile', 
      icon: <UserOutlined style={xtyle.menuItem} />, 
      onClick: () => {navigate('/profile')}
    } ,
    { 
      label: <p style={xtyle.menuLabel}>通知</p>, 
      key: 'nevent', 
      icon: <BellOutlined style={xtyle.menuItem} />, 
      onClick: () => {}
    } ,
    { label: <p style={xtyle.menuLabel}>訊息</p>, 
      key: 'nmessage', 
      icon: <MessageOutlined style={xtyle.menuItem} />, 
      onClick: () => {}
    } ,
    { 
      label: <p style={xtyle.menuLabel}>登出</p>, 
      key: 'nlogout', 
      icon: <LogoutOutlined style={xtyle.menuItem} />, 
      onClick: () => {
        localStorage.removeItem('jwt')
        setAuth(null)
        setIsLoginValid(false)
        navigate('/')
      }
    } ,
    { label: <p style={xtyle.menuLabel}>&nbsp;</p>, 
      key: 'ndrawer', 
      icon: <MenuOutlined style={xtyle.menuItem} />,
      onClick: () => setCollapsed(!collapsed)
    } ,
  ] : [
    { 
      label: <p style={xtyle.menuLabel}>登入</p>, 
      key: 'nlogin', 
      icon: <LoginOutlined style={xtyle.menuItem} />, 
      onClick: () => navigate('/login')
    }
  ];

  if (loading) {
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
          { isLoginValid && 
            <Search
            placeholder="搜尋用戶"
            allowClear
            style={xtyle.menuSearch}
            />
          }
        </div>
        <Menu mode="horizontal"  theme="dark" 
          selectable={false}
          style={xtyle.navmenu} 
        items={menus}/>
      </Header>

      <Layout>
        <Content style={xtyle.content}>
          <div style={xtyle.contentCenter}>
            <Content>
              <Routes>
                <Route path="/publicPost" element={<PublicPost />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </Content>
          </div>
        </Content>

        {isLoginValid && <Sider
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
        }
      </Layout>
    </Layout>
  );
};

const AppContent = () => (
  <Router>
    <MainPage />
  </Router>
);

const Profile = () => <div>profile</div>;

export default AppContent;