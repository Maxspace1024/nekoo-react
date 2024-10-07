import React, { useState, useEffect } from 'react';
import { Image, Input, Avatar, Modal, Tooltip, message, Button } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';

import axiox from '../axiox';
import stompClient from '../StompClient';
import { useAuth } from '../context/AuthContext';
import { S3HOST } from '../BaseConfig';
import { useNavigate } from 'react-router-dom';

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

  const linkToSignlePost = () => {
    // navigate(`/post/${item.assetId}`)
  }

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
          borderRadius: '20px',
          padding: '8px 16px',
          border: 'none',
          boxShadow: '10px 5px 5px rgba(0, 0, 0, 0.2)',
          background: 'rgba(255, 255, 255, 0.9)',
          minWidth: '20px',
          maxWidth: '300px',
          overflow: 'hidden',
          outline: 'none',
          userSelect: 'none',
        }}
        onClick={handleClick}
      >
        {item.content}
      </span>

      <Modal
        title={<div style={{fontSize: 24}}>彈幕內容</div>}
        centered
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} >
            <Tooltip title={'個人主頁'}>
              <div onClick={linkToUserProfile}>
                  {item.userAvatarPath ? (
                    <Avatar size={56} src={S3HOST+item.userAvatarPath} />
                  ) : (
                    <Avatar size={56} icon={<UserOutlined />} />
                  )}
              </div>
            </Tooltip>
            <Tooltip title={'貼文主頁'}>
              <div style={{ marginLeft: '10px' }} onClick={linkToSignlePost}>
                <strong style={{ fontSize: '24px' }} >{item.userName}</strong><br />
                <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString()}</span>
              </div>
            </Tooltip>
          </div>
          {/* <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div>
              {item.userAvatarPath ? (
                <Avatar size={56} src={S3HOST + item.userAvatarPath} />
              ) : (
                <Avatar size={56} icon={<UserOutlined />} />
              )}
            </div>
            <div style={{ marginLeft: '10px' }}>
              <strong style={{ fontSize: '20px', wordBreak: 'break-word', overflowWrap: 'break-word',textWrap: 'wrap'}}>
                {item.userName}
              </strong><br />
              <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString()}</span>
            </div>
          </div> */}
          <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center',flex: 1}}>
            { auth && auth.userId === item.userId &&
              <Button type={'text'} danger icon={<DeleteOutlined />} onClick={handleDeleteDmk}/>
            }
          </div>
        </div>
        <h3>{item.content}</h3>
      </Modal>
    </div>
  )
}

function Danmaku3({ asset, dmkVisible, listOpen, onCancel, onDmkCountChange }) {
  const {auth, setAuth} = useAuth()

  const [inputs, setInputs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedInput, setDraggedInput] = useState(null);
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
  }, [stompClient.isConnected])

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
    const rect = e.target.getBoundingClientRect();
    console.log(rect)
    console.log(`${e.clientX} ${e.clientY}`)
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
    const xx = (x/rect.width * 100).toFixed(2)
    const yy = (y/rect.height* 100).toFixed(2)

    setInputs([
      ...inputs,
      { id: Date.now(), x, y, text: '' }
    ]);
  };

  // 當點擊某個輸入框時開始拖動
  const handleMouseDown = (id) => {
    setIsDragging(true);
    setDraggedInput(id);
  };

  // 拖動輸入框
  const handleMouseMove = (e, input) => {
    if (isDragging && draggedInput !== null) {
      const rect = document.getElementById('image-container').getBoundingClientRect();
      // console.log(rect)
      // console.log(`${e.clientX} ${e.clientY}`)
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
      const xx = (x/rect.width * 100).toFixed(2)
      const yy = (y/rect.height* 100).toFixed(2)

      setInputs(inputs.map(input =>
        input.id === draggedInput ? { ...input, x, y } : input
      ));
    }
  };

  // 停止拖動
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedInput(null);
  };

  // 更新文字
  const handleInputChange = (id, text) => {
    setInputs(inputs.map(input =>
      input.id === id ? { ...input, text } : input
    ));
  };

  const handleKeyEnterDown = (e, data) => {
    if(e.key === "Enter") {
      if (data.text.trim() === "") {
        return 
      }
      const rect = document.getElementById('image-container').getBoundingClientRect();
      const xx = (data.x/rect.width * 100).toFixed(2)
      const yy = (data.y/rect.height* 100).toFixed(2)
      const formData = new FormData()
      if ( "assetId" !== null )         formData.append("assetId", asset.id)
      if ( "userId" !== null)           formData.append("userId", auth.userId)
      if ( "type" !== null )            formData.append("type", 0)
      if ( "content" !== null )         formData.append("content", data.text)
      // if ( "color" !== null )           formData.append("color", null)
      // if ( "backgroundColor" !== null ) formData.append("backgroundColor", null)
      if ( "visible" !== null )         formData.append("visible", 0)
      if ( "size" !== null )            formData.append("size", 1)
      if ( "posX" !== null )            formData.append("posX", xx)
      if ( "posY" !== null )            formData.append("posY", yy)
      // if ( "appearAt" !== null )        formData.append("appearAt", null)
      // if ( "image" !== null )           formData.append("image", null)
      
      axiox.post("/api/v1/danmaku", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      .then(res => {
        const data = res.data
        if (res.status === 200 && data.data) {
          message.success("彈幕上傳成功")
        } else {
          message.error("彈幕上傳錯誤")
        }
      })
      .catch(e => {
        console.error(e)
        message.error("彈幕上傳錯誤")
      })

      setInputs([])
    }
  }

  const  handleDmkClick = () => {
    console.log("dmk editor")
  }

  return (
    <div
      id="image-container"
      onMouseMove={(e) => handleMouseMove(e, null)}
      onMouseUp={handleMouseUp}
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
        {inputs.map(input => (
          <input
            key={input.id}
            value={input.text}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            onKeyDown={(e) => handleKeyEnterDown(e, input)}
            onMouseDown={() => handleMouseDown(input.id)}
            onClick={() => handleDmkClick()}
            style={{
							position: 'absolute',
              left: `${input.x}px`,
              top: `${input.y}px`,
              fontWeight: 'bold',
              borderRadius: '20px',
              padding: '8px 16px',
              border: 'none',
							boxShadow: '10px 5px 5px rgba(0, 0, 0, 0.2)',
              background: 'rgba(255, 255, 255, 0.9)',
              minWidth: '20px',
              maxWidth: '240px',
              fontSize: '16px',
              boxSizing: 'border-box',
              overflow: 'hidden',
							outline: 'none', 
            }}
          />
        ))}
      </div>
      <Modal
        title={<div style={{fontSize: 24}}>彈幕清單</div>}
        footer={null}
        open={listOpen}
        onCancel={onCancel}
      >
        <div style={{overflowY: 'auto', maxHeight: 600}}>
          {dmks.map(item => (
            <div key={`list-danmaku-${item.danmakuId}`} style={{margin: '24px 0px'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tooltip title={new Date(item.createAt).toLocaleString()}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {item.userAvatarPath ? (
                      <Avatar size={56} src={S3HOST + item.userAvatarPath} />
                    ) : (
                      <Avatar size={56} icon={<UserOutlined />} />
                    )}
                    <div style={{ marginLeft: '10px' }}>
                      <strong style={{ fontSize: '20px' }}>{item.userName}</strong><br />
                      <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString('zh-TW', {hour12: true, hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                  </div>
                </Tooltip>
                <h3 style={{textWrap: 'wrap'}}>{item.content}</h3>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default Danmaku3;
