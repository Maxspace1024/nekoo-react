import React, { useState, useEffect } from 'react';
import { Image, Input, Avatar, Modal, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import axiox from '../axiox';
import stompClient from '../StompClient';
import userEvent from '@testing-library/user-event';

const DanmakuBubble = ({item}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {item.userAvatarPath ? (
              <Avatar size={56} src={item.userAvatarPath} />
            ) : (
              <Avatar size={56} icon={<UserOutlined />} />
            )}
            <div style={{ marginLeft: '10px' }}>
              <strong style={{ fontSize: '20px' }}>{item.userName}</strong><br />
              <span style={{ color: '#888' }}>{new Date(item.createAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <h3>{item.content}</h3>
      </Modal>
    </div>
  )
}

function Danmaku3({ asset, dmkVisible, listOpen, onCancel }) {
  const [inputs, setInputs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedInput, setDraggedInput] = useState(null);
  const [dmks, setDmks] = useState([])

  useEffect(() => {
    stompClient.subscribe(`/topic/asset/${asset.id}`, (msgDmk) => {
      setDmks(prev => [...prev, msgDmk])
    })
    stompClient.subscribe(`/topic/asset/delete/${asset.id}`, (msgDmk) => {
      // setDmks(prev => [...prev, msgDmk])
    })

    return () => stompClient.unsubscribe(`/topic/asset/${asset.id}`)
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
          setDmks(data.data)
        }
      })
      .catch(e => {console.error(e)})
    }
  }, [asset])

  // 點擊圖片時創建新輸入框
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
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
      console.log(rect)
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
      const xx = (x/rect.width * 100).toFixed(2)
      const yy = (y/rect.height* 100).toFixed(2)

      // console.log(`${x} ${e.clientY}`)
      // console.log(`${xx} ${yy}`)

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
      const rect = document.getElementById('image-container').getBoundingClientRect();
      const xx = (data.x/rect.width * 100).toFixed(2)
      const yy = (data.y/rect.height* 100).toFixed(2)
      const formData = new FormData()
      if ( "assetId" !== null )         formData.append("assetId", asset.id)
      if ( "userId" !== null)           formData.append("userId", localStorage.getItem("userId"))
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
        // console.log(res)
      })
      .catch(e => {console.error(e)})

      setInputs([])
    }
  }

  const  handleDmkDoubleClick = () => {
    console.log("dmk editor")
  }

  return (
    <div
      id="image-container"
      onMouseMove={(e) => handleMouseMove(e, null)}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative', boxShadow: '1px 1px 8px lightgray'}}
    >
      <Image
        src={`https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/${asset.path}`}
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
            onDoubleClick={() => handleDmkDoubleClick()}
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
                      <Avatar size={56} src={item.userAvatarPath} />
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
