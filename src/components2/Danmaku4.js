import React, { useState, useEffect, useReducer, useRef } from 'react';
import { Image, Input, Avatar, Modal, Tooltip, message, Button, Form, ColorPicker, Select, Space } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import DanmakuEditor from './DanmakuEditor';
import './Home.css'

import axiox from '../axiox';
import stompClient from '../StompClient';
import { useAuth } from '../context/AuthContext';
import { S3HOST } from '../BaseConfig';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import { usePost } from '../context/PostContext';

import xtyle from './CommonStyle';

const calTextScale = (x) => {
  return 0.7 + x * 0.3
}

const DanmakuBubble = ({item}) => {
  const navigate = useNavigate()
  const {auth, setAuth} = useAuth() 
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const linkToUserProfile = () => {
    navigate(`/neco/${item.userId}`)
  }

  const handleDeleteDmk = () => {
    axiox.post("/api/v1/danmaku/delete", {
      danmakuId: item.danmakuId
    })
    .then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("彈幕刪除成功")
      } else {
        message.error("彈幕刪除錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.error("彈幕刪除錯誤")
    })
  }

  return (
    <div>
      <span
        style={{
          position: 'absolute',
          left: `${item.posX}%`,
          top: `${item.posY}%`,
          fontWeight: 'bolder',
          borderRadius: '24px',
          padding: '8px 16px',
          border: 'none',
          boxShadow: '10px 5px 5px rgba(0, 0, 0, 0.2)',
          color: `${item.color}`,
          backgroundColor: `${item.backgroundColor}E6`,
          fontSize: `${16 * calTextScale(item.size)}px`,
          minWidth: '20px',
          maxWidth: '300px',
          overflow: 'hidden',
          outline: 'none',
          userSelect: 'none',
          transform: 'scale(0)',
          animation: `bounce 1s ease-in-out forwards`,
          animationDelay: `${0.1 + Math.random()* 1.5}s`
        }}
        onClick={handleClick}
      >
        {item.content}
      </span>

      <Modal
        title={<div style={{fontSize: 20}}>彈幕內容</div>}
        centered
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} >
            <Tooltip title={'個人主頁'}>
              <div onClick={linkToUserProfile}>
                <UserAvatar src={item.userAvatarPath} size={56} />
              </div>
            </Tooltip>
            <Tooltip title={'貼文主頁'}>
              <div style={{ marginLeft: '10px' }}>
                <strong style={{ fontSize: '24px' }} >{item.userName}</strong><br />
                <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString()}</span>
              </div>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center',flex: 1}}>
            { auth && auth.userId === item.userId &&
              <Button type={'text'} danger icon={<DeleteOutlined />} onClick={handleDeleteDmk}/>
            }
          </div>
        </div>
        <div style={{flex:5, display: 'flex', marginTop: 12, justifyContent: 'start'}}>
          <strong>
            <span
              style={{
                textWrap: 'wrap',
                color: `${item.color}`,
                backgroundColor: `${item.backgroundColor}E6`,
                fontSize: `${16 * calTextScale(item.size)}px`,
                padding: '8px 12px',
                borderRadius: 24,
                ...xtyle.wrapBreak,
              }}
              >
              {item.content}
            </span>
          </strong>
        </div>
      </Modal>
    </div>
  )
}

function Danmaku4({ asset, dmkVisible, listOpen, onCancel, onDmkCountChange }) {
  const {auth, setAuth, isWsConnected} = useAuth()
  const {postScrollTop, setPostScrollTop} = usePost()

  const hiddenSpanRef = useRef()

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorProp, setEditorProp] = useState({
    color: '#000000',
    backgroundColor: '#FFFFFF',
    size: 1
  })

  const [dmkInputVisible, setDmkInputVisible] = useState(false)
  const [dmkInput, setDmkInput] = useState(null)

  const [dmks, setDmks] = useState([])

  useEffect(() => {
    stompClient.subscribe(`/topic/danmaku/${asset.id}`, (msgDmk) => {
      setDmks(prev => [...prev, msgDmk])
      onDmkCountChange(1)
    })
    stompClient.subscribe(`/topic/danmaku/delete/${asset.id}`, (msgDmk) => {
      setDmks(prev => prev.filter(dmk => dmk.danmakuId !== msgDmk.danmakuId) )
      onDmkCountChange(-1)
    })

    return () => {
      stompClient.unsubscribe(`/topic/danmaku/${asset.id}`)
      stompClient.unsubscribe(`/topic/danmaku/delete/${asset.id}`)
    }
  }, [isWsConnected])

  useEffect(() => {
    if (asset != null) {
      axiox.post("/api/v1/danmaku/log", 
        {
          assetId: asset.id
        }
      )
      .then(response => {
        const data = response.data
        const success = data.success
        const allDmk = data.data
        if (success) {
          setDmks(allDmk)
        }
      })
      .catch(e => {console.error(e)})
    }
  }, [asset])

  // 點擊圖片時創建新輸入框
  const handleImageClick = (e) => {
    setDmkInputVisible(true)

    const rect = e.target.getBoundingClientRect();
    // console.log(rect)
    // console.log(`${e.clientX} ${e.clientY}`)
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
    const xx = (x/rect.width * 100).toFixed(2)
    const yy = (y/rect.height* 100).toFixed(2)

    setDmkInput({
      x: xx,
      y: yy,
      text: '',
    })
  };

  // 更新文字
  const handleInputChange = (e) => {
    setDmkInput(prev => (
      {
        x: prev.x,
        y: prev.y,
        text: e.target.value
      }
    ))
  };

  const handleKeyEnterDown = (e) => {
    if (e.key === "Escape") {
      setDmkInputVisible(false)
      setDmkInput(null)
      return
    }

    if(e.key === "Enter") {
      if (dmkInput.text.trim() === "") {
        return 
      }

      const formData = new FormData()
      if ( "assetId" !== null )         formData.append("assetId", asset.id)
      if ( "userId" !== null)           formData.append("userId", auth.userId)
      if ( "type" !== null )            formData.append("type", 0)
      if ( "content" !== null )         formData.append("content", dmkInput.text)
      if ( "visible" !== null )         formData.append("visible", 0)
      if ( "posX" !== null )            formData.append("posX", dmkInput.x)
      if ( "posY" !== null )            formData.append("posY", dmkInput.y)
      if ( "color" !== null )           formData.append("color", editorProp.color)
      if ( "backgroundColor" !== null ) formData.append("backgroundColor", editorProp.backgroundColor)
      if ( "size" !== null )            formData.append("size", editorProp.size)
      
      setDmkInputVisible(false)
      setDmkInput(null)

      axiox.post("/api/v1/danmaku", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      .then(res => {
        const data = res.data
        if (res.status === 200 && data.data) {
          message.success("貼訊上傳成功")
        } else {
          message.error("貼訊上傳錯誤")
        }
      })
      .catch(e => {
        console.error(e)
        message.error("貼訊上傳錯誤")
      })
    }
  }

  const  handleDmkClick = () => {
    setIsEditorOpen(true)
  }

  return (
    <div
      id="image-container"
      style={{ position: 'relative', boxShadow: '1px 1px 8px lightgray', borderRadius: 8}}
    >
      <Image
        src={`${S3HOST}${asset.path}`}
        alt="image"
        preview={false}
        style={{ borderRadius: 8, userSelect: 'none', WebkitUserDrag: 'none'}}
        onClick={handleImageClick}
      />
      <div id='dmk-tag-layer' style={{maxWidth: '100%', maxHeight: '100%'}} style={{ visibility: dmkVisible ? 'visible' : 'hidden' }}>
        {dmks.map(dmk => (
          <DanmakuBubble key={dmk.danmakuId} item={dmk}/>
        ))}
      </div>
      <div id='dmk-layer'>
        { dmkInput && dmkInputVisible &&
          <input 
            type="text" 
            onInput={(e) => handleInputChange(e)}
            onKeyDown={(e) => handleKeyEnterDown(e)}
            onClick={() => handleDmkClick()}
            style={{
              display: 'inline-block',
              position: 'absolute',
              left: `${dmkInput.x}%`,
              top: `${dmkInput.y}%`,
              fontWeight: 'bold',
              borderRadius: '20px',
              padding: '8px 16px',
              border: 'none',
              boxShadow: '10px 5px 5px rgba(0, 0, 0, 0.2)',
              color: `${editorProp.color}`,
              backgroundColor: `${editorProp.backgroundColor}E6`,
              fontSize: `${16 * calTextScale(editorProp.size)}px`,
              boxSizing: 'border-box',
              overflow: 'hidden',
              outline: 'none',
              width: '160px'
            }}
          />
        }
      </div>
      <Modal
        title={<div style={{fontSize: 20}}>彈幕清單</div>}
        footer={null}
        open={listOpen}
        onCancel={onCancel}
      >
        <div style={{overflowY: 'auto', maxHeight: 600, padding: '0 8px'}}>
          {dmks.map(item => (
            <div key={`list-danmaku-${item.danmakuId}`} style={{margin: '24px 0px'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{flex:3}}>
                  <Tooltip title={new Date(item.createAt).toLocaleString()}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserAvatar src={item.userAvatarPath} size={48} />
                      <div style={{ marginLeft: '10px' }}>
                        <strong style={{ fontSize: '16px', ...xtyle.wrapBreak }}>{item.userName}</strong><br />
                        <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString('zh-TW', {hour12: true, hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                    </div>
                  </Tooltip>
                </div>
                <div style={{flex:5, display: 'flex', marginTop: 12, justifyContent: 'end'}}>
                  <strong>
                    <span
                      style={{
                        textWrap: 'wrap',
                        color: `${item.color}`,
                        backgroundColor: `${item.backgroundColor}E6`,
                        fontSize: `${16 * calTextScale(item.size)}px`,
                        padding: '8px 12px',
                        borderRadius: 24,
                        ...xtyle.wrapBreak,
                      }}
                      >
                      {item.content}
                    </span>
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
      <DanmakuEditor 
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSetProperties={(x) => {setEditorProp(x)}}
      />
    </div>
  );
}

export default Danmaku4;
