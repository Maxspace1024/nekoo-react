import React, { useState } from 'react';
import { Layout, Menu, Avatar, List, Button, notification, Input } from 'antd';
import {
  BellOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Search } = Input;

const Main = () => {
  const [collapsed, setCollapsed] = useState(false);

  const openNotification = (message) => {
    notification.open({
      message: message,
    });
  };

  const chatRooms = [
    { name: '聊天室 1' },
    { name: '聊天室 2' },
    { name: '聊天室 3' },
    { name: '聊天室 4' },
    { name: '聊天室 5' },
    { name: '聊天室 6' },
    { name: '聊天室 7' },
    { name: '聊天室 8' },
    { name: '聊天室 9' },
    { name: '聊天室 10' },
  ];

  const scrollbarHiddenStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
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
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px', color: 'white' }} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginRight: '20px' }}
          />
          <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginRight: '20px' }}>MyApp</div>
          <Search
            placeholder="搜尋"
            allowClear
            style={{ 
              borderRadius: '20px', 
              overflow: 'hidden', 
              width: 300,
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
          />
        </div>

        <Menu mode="horizontal" theme="dark" selectable={false} style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          border: 'none', 
          backgroundColor: 'transparent'
        }}>
          <Menu.Item key="1" icon={<BellOutlined style={{ fontSize: '20px' }} />} onClick={() => openNotification('您有新的通知')} />
          <Menu.Item key="2" icon={<MessageOutlined style={{ fontSize: '20px' }} />} onClick={() => openNotification('您有新的訊息')} />
          <Menu.Item key="3">
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          </Menu.Item>
          <Menu.Item key="4" icon={<LogoutOutlined style={{ fontSize: '20px' }} />} />
        </Menu>
      </Header>

      <Layout>
        {/* 主內容區域 */}
        <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
          <div style={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            overflowY: 'auto', 
            backgroundColor: '#f0f2f5' 
          }}>
            <div style={{ 
              width: '100%', 
              maxWidth: '800px',
              backgroundColor: '#fff', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', 
              height: '100%', 
              overflowY: 'scroll',
              ...scrollbarHiddenStyle
            }}>
              {[...Array(15)].map((_, index) => (
                <div key={index} style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '10px', color: '#1890ff' }}>貼文 {index + 1}</h3>
                  <p>這是一個貼文的範例，展示了滾動效果...</p>
                </div>
              ))}
            </div>
          </div>
        </Content>

        {/* 右側聊天區域 */}
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
            padding: '20px'
          }}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '20px', color: '#1890ff' }}>聊天室</h3>
            <div style={{ flexGrow: 1, overflowY: 'auto', ...scrollbarHiddenStyle }}>
              <List
                itemLayout="horizontal"
                dataSource={chatRooms}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Button type="link" style={{ padding: '10px', width: '100%', textAlign: 'left', color: '#1890ff' }}>{item.name}</Button>}
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default Main;
