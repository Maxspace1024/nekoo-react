import React, { useState, useEffect } from 'react';
import { Avatar, Image, Card, Menu, Dropdown, Button, Tooltip, message } from 'antd';
import {
  UserOutlined, MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  EllipsisOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  UnorderedListOutlined,
  BookOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import DanmakuPlayer from './DanmakuPlayer';
import Danmaku3 from './Danmaku3';

import axiox from '../axiox';
import { useAuth } from '../context/AuthContext';
import PostEditor from './PostEditor';
import { useNavigate } from 'react-router-dom';
import { S3HOST } from '../BaseConfig';
import xtyle from './CommonStyle';
import UserAvatar from './UserAvatar';


const colors = [
  '#EE0000', // red
  '#EE7F00', // orange
  '#FF9912', // yellow
  '#00EE00', // green
  // '#0000EE', // blue
  'steelblue', // blue
  '#4B0082', // indigo
  '#9400D3'  // violet
];
function rainbowTable(x) {
  if (x === 0)
    return 'black'

  let log = Math.floor(Math.log2(x))
  if (log > 6) {
    log = 6
  }
  return colors[log]
}


function Post({item}) {
  const navigate = useNavigate()
  const {auth, setAuth} = useAuth()
  const [items, setItems] = useState(null)

  const [toggleDmkVisible, setToggleDmkVisible] = useState(true)
  const [isListOpen, setIsListOpen] = useState(false)
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false)

  const [localDmkCount, setLocalDmkCount] = useState(0)
  const [privacy, setPrivacy] = useState(item.privacy)

  function deletePost() {
    axiox.post("/api/v1/post/delete", 
      { postId: item.postId }
    )
    .then(res => {
      const data = res.data
      if ( res.status === 200 && data.data) {
        message.success("刪除貼文成功")
      } else {
        message.success("刪除貼文錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("刪除貼文錯誤")
    })
  }

  const handleMenuClick = (e) => {
    if (e.key === 'edit') {
      // 這裡是編輯貼文的邏輯
      console.log('編輯貼文');
      setIsPostEditorOpen(true)
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

  const handleDmkCountChange = (x) => {
    setLocalDmkCount(prev => prev + x)
  }

  const linkToSignlePost = () => {
    navigate(`/post/${item.postId}`)
  }

  const linkToUserProfile = () => {
    navigate(`/neco/${item.userId}`)
  }

  const updatePrivacy = (p) => {
    const formData = new FormData()
    formData.append("postId", item.postId)
    formData.append("privacy", p)

    if (item.userId === auth.userId) {
      axiox.post("/api/v1/post/update", formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      )
      .then(res => {
        const data = res.data
        if (res.status === 200 && data.data) {
          const p = data.data.privacy
          setPrivacy(p)
          setLocalDmkCount(0)
          message.success("已修改貼文隱私權限")
        } else {
          message.success("修改貼文隱私權限錯誤")
        }
      })
      .catch(e => {
        console.error(e)
        message.success("修改貼文隱私權限錯誤")
      })
    }
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
    <Card style={{ marginBottom: '20px', width: '100%', ...xtyle.cardStyle, userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <PostEditor item={item} open={isPostEditorOpen} onClose={() => {setIsPostEditorOpen(false)}}/>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} >
          <Tooltip title={'個人主頁'}>
            <div onClick={linkToUserProfile}>
              <UserAvatar src={item.userAvatarPath} size={48} />
            </div>
          </Tooltip>
          <Tooltip title={'貼文主頁'}>
            <div style={{ marginLeft: '10px' }} onClick={linkToSignlePost}>
              <strong style={{ fontSize: '24px' }} >{item.userName}</strong><br />
              <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString()}</span>
            </div>
          </Tooltip>
        </div>

        {/* 右上角統計數據和選單按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ marginRight: '20px', cursor: 'pointer', ...xtyle.postToolbarIcon }}>
            <Tooltip title={'清單閱覽模式'} onClick={handleOpenList}>
              <span style={{color: rainbowTable(item.totalDanmakuCount + localDmkCount)}}>{item.totalDanmakuCount + localDmkCount}</span>
              {item.totalDanmakuCount + localDmkCount === 5 ? ' 條幕': ' 條彈幕'}
            </Tooltip>
          </h2>
          <div style={{display: 'flex', gap: 8}}>
            { privacy === 0 &&
              <Tooltip title={'隱私:公開'}>
                <Button type="text" icon={<GlobalOutlined style={xtyle.postToolbarIcon} /> } onClick={() => {updatePrivacy(1)}}/>
              </Tooltip>
            }
            { privacy === 1 &&
              <Tooltip title={'隱私:朋友'}>
                <Button type="text" icon={<LockOutlined style={xtyle.postToolbarIcon} /> } onClick={() => {updatePrivacy(0)}}/>
              </Tooltip>
            }
            {
              toggleDmkVisible ? 
              <Tooltip title={'彈幕開啟'}>
                  <Button type="text" icon={<EyeOutlined style={xtyle.postToolbarIcon} onClick={handleDmkVisble}/> } />
                </Tooltip>
              : 
              <Tooltip title={'彈幕關閉'}>
                  <Button type="text" icon={<EyeInvisibleOutlined style={xtyle.postToolbarIcon} onClick={handleDmkVisble}/> } />
                </Tooltip>
            }
            <Dropdown
              menu={{
                items,
                onClick: handleMenuClick,
              }}
              trigger={['click']}
              >
              <Button type="text" icon={<EllipsisOutlined style={xtyle.postToolbarIcon}/> } />
            </Dropdown>
          </div>
        </div>
      </div>

      {/* 內文和tag */}
      <div style={{padding: '0 8px'}}>
        <p style={{ 
          fontSize: 28, 
          width: '100%', 
          wordBreak: 'break-word',    // 這行確保長單字會換行
          overflowWrap: 'break-word', // 這行是更好的兼容性確保
          textWrap: 'wrap',
          whiteSpace: 'pre-wrap'
        }}>
          {item.content}
        </p>
        <div style={{marginBottom: 12}}>
          {item.hashtags.map(hashtag => 
            <Button 
              key={`hashtag-${item.assetId}-${hashtag}`}
              type={'link'}
              style={{padding: 4, fontSize: 20}}
              onClick={() => {
                navigate(`/search?q=${hashtag}&queryAt=${new Date()}`)
              }}
            >
              #{hashtag}
            </Button>
          )}
        </div>
      </div>

      {
        item.assets.map((asset) => {
          if (asset.type === 0) {
            // image
            return (
              <div key={`asset-${asset.id}`} style={{ width: '100%', borderRadius: 8, display: 'flex', justifyContent: 'center', backgroundColor: 'white' }}>
                <Danmaku3 
                  asset={asset} 
                  dmkVisible={toggleDmkVisible} 
                  listOpen={isListOpen} 
                  onCancel={handleCloseList}
                  onDmkCountChange={handleDmkCountChange}
                />
              </div>
            )
          } else if (asset.type === 1 ) {
            // video
            return (
              <div key={`asset-${asset.id}`} style={{ width: '100%', borderRadius: 8, display: 'flex', justifyContent: 'center', backgroundColor: 'white' }}>
                <DanmakuPlayer 
                  asset={asset} 
                  dmkVisible={toggleDmkVisible} 
                  listOpen={isListOpen} 
                  onCancel={handleCloseList}
                  onDmkCountChange={handleDmkCountChange}
                />
              </div>
            )
          }
        })
      }
    </Card>
  )
}

export default Post