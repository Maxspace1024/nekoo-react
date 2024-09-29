import React, { useState } from 'react';
import { Layout, Avatar, List, Button } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';

function ChatRoomChannel({item, onClick}) {

  return (
    <List.Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => onClick()}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {item.chatroomAvatarPath ? (
          <Avatar size={48} src={item.chatroomAvatarPath} />
        ) : (
          <Avatar size={48} icon={<UserOutlined />} />
        )}
        <div style={{ marginLeft: '10px' }}>
          <strong>{item.chatroomName}</strong>
          <div style={{ color: 'gray', fontSize: '12px' }}>{item.lastContent}</div>
        </div>
      </div>
      {item.lastCreateAt && 
        <div style={{ height: '72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', color: 'gray', fontSize: '12px' }}>
          <span>{new Date(item.lastCreateAt).toLocaleDateString()}</span>
          <span>{new Date(item.lastCreateAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
        </div>
      }
    </List.Item>
  )
}

export default ChatRoomChannel