import React, { useState } from 'react';
import { Avatar, Image, Card, Menu, Dropdown, Button } from 'antd';
import {
  UserOutlined, MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import Danmaku3 from './Danmaku3';

function Post({item}) {
  const handleMenuClick = (e) => {
    if (e.key === 'edit') {
      console.log('編輯貼文');
      // 這裡是編輯貼文的邏輯
    } else if (e.key === 'delete') {
      console.log('刪除貼文');
      // 這裡是刪除貼文的邏輯
    }
  };

  const items = [
    {
      label: '編輯',
      key: 'edit',
      icon: <EditOutlined />
    },
    {
      label: '刪除',
      key: 'delete',
      danger: true,
      icon: <DeleteOutlined />
    },
  ];


  return (
    <Card style={{ marginBottom: '20px', width: '100%', boxShadow: '1px 1px 8px lightgray' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {item.userAvatarPath ? (
            <Avatar size={56} src={item.userAvatarPath} />
          ) : (
            <Avatar size={56} icon={<UserOutlined />} />
          )}
          <div style={{ marginLeft: '10px' }}>
            <strong style={{ fontSize: '24px' }}>{item.userName}</strong><br />
            <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString()}</span>
          </div>
        </div>

        {/* 右上角統計數據和選單按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ marginRight: '20px', fontSize: '24px' }}>{item.totalDanmakuCount} 條彈幕</h2>
          <Dropdown
            menu={{
              items,
              onClick: handleMenuClick,
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<EllipsisOutlined style={{ fontSize: '24px' }}/> } />
          </Dropdown>
        </div>
      </div>

      {/* 內文和tag */}
      <p style={{ fontSize: 20}}>{item.content}</p>
      <div style={{marginBottom: 12}}>
        {item.hashtags.map(hashtag => 
          <Button key={`hashtag-${item.assetId}-${hashtag}`} type={'link'} style={{padding: 4, fontSize: 16}}>#{hashtag}</Button>
        )}
      </div>

      {item.assets.map((asset) => {
        if (asset.type === 0) {
          // image
          return (
            <div key={`asset-${asset.id}`} style={{ width: '100%', borderRadius: 8, display: 'flex', justifyContent: 'center', backgroundColor: 'white' }}>
              <Danmaku3 image={asset} 
                onKeyEnter={() => {}}
                onSubscribe={() => {}}
                onHistory={() => {}}
              />
            </div>
          )
        } else if (asset.type === 1 ) {
          // video
          return (
            <div key={`asset-${asset.id}`} style={{ width: '100%', borderRadius: 8, display: 'flex', justifyContent: 'center', backgroundColor: 'white' }}>
              <video controls width="100%" src={`https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/${asset.path}`} />
            </div>
          )
        }
      }
        
      )}
    </Card>
  )
}

export default Post