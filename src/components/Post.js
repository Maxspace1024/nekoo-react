import React, { useState, useEffect } from 'react';
import { Avatar, Image, Card, Menu, Dropdown, Button, Tooltip } from 'antd';
import {
  UserOutlined, MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  EllipsisOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  UnorderedListOutlined,
  BookOutlined
} from '@ant-design/icons';
import Danmaku3 from './Danmaku3';

import axiox from '../axiox';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from './VideoPlayer';

function Post({item}) {
  const {auth, setAuth} = useAuth()
  const [items, setItems] = useState(null)

  const [toggleDmkVisible, setToggleDmkVisible] = useState(true)
  const [isListOpen, setIsListOpen] = useState(false)

  function deletePost() {
    axiox.post("/api/v1/post/delete", 
      { postId: item.postId }
    )
    .then(res => {
      console.log(res.data)
    })
    .catch(e => {console.error(e)})
  }

  const handleMenuClick = (e) => {
    if (e.key === 'edit') {
      // 這裡是編輯貼文的邏輯
      console.log('編輯貼文');
    } else if (e.key === 'delete') {
      // 這裡是刪除貼文的邏輯
      console.log('刪除貼文');
      deletePost()      
    }
  };

  const handleDmkVisble = (e) => {
    setToggleDmkVisible(prev => !prev)
  }

  const handleOpenList = (e) => {
    setIsListOpen(true)
  }

  const handleCloseList = (e) => {
    setIsListOpen(false)
  }
 

  useEffect(() => {
    if (auth != null || Object.keys(auth).length !== 0) {
      setItems(item.userId === auth.userId ? [
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
        ] : []
      );
    }
  }, [setAuth])

  return (
    <Card style={{ marginBottom: '20px', width: '100%', boxShadow: '1px 1px 8px lightgray', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { item.userAvatarPath &&
            <UserAvatar src={item.userAvatarPath} size={52} />
          }
          <div style={{ marginLeft: '10px' }}>
            <strong style={{ fontSize: '24px' }}>{item.userName}</strong><br />
            <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString()}</span>
          </div>
        </div>

        {/* 右上角統計數據和選單按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ marginRight: '20px', fontSize: '24px' }}>{item.totalDanmakuCount} 條彈幕</h2>
          <div style={{display: 'flex', gap: 8}}>
            <Tooltip title={'清單閱覽模式'}>
              <Button type="text" icon={<UnorderedListOutlined style={{ fontSize: '24px' }} /> } onClick={handleOpenList}/>
            </Tooltip>
            {
              toggleDmkVisible ? 
              <Tooltip title={'彈幕開啟'}>
                  <Button type="text" icon={<EyeOutlined style={{ fontSize: '24px' }} onClick={handleDmkVisble}/> } />
                </Tooltip>
              : 
              <Tooltip title={'彈幕關閉'}>
                  <Button type="text" icon={<EyeInvisibleOutlined style={{ fontSize: '24px' }} onClick={handleDmkVisble}/> } />
                </Tooltip>
            }
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
              <Danmaku3 asset={asset} dmkVisible={toggleDmkVisible} listOpen={isListOpen} onCancel={handleCloseList} />
            </div>
          )
        } else if (asset.type === 1 ) {
          // video
          return (
            <div key={`asset-${asset.id}`} style={{ width: '100%', borderRadius: 8, display: 'flex', justifyContent: 'center', backgroundColor: 'white' }}>
              {/* <video controls width="100%" src={`https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/${asset.path}`} /> */}
              <VideoPlayer src={`https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/${asset.path}`} />
            </div>
          )
        }
      }
      )}
    </Card>
  )
}

export default Post