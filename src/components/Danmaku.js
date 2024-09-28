import React, { useState, useEffect, useRef } from 'react';
import { Image, Input, Modal, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const DanmakuBubble = ({item}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDoubleClick = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <div style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center' }}>
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
          onDoubleClick={handleDoubleClick}
        >
          {item.content}
        </span>
      </div>

      <Modal
        title="彈幕內容"
        centered
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
        <p>{item.content}</p>
      </Modal>
    </>
  )
}

const Danmaku = ({src}) => {
  const [inputs, setInputs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedInput, setDraggedInput] = useState(null);
  const [dmks, setDmks] = useState([
    {
      danmakuId: 'asdfas',
      userId: 1,
      userName: "asdf", 
      userAvatarPath: "https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg",
      posX: 10,
      posY: 60,
      content: "你好你好",
      createAt: "2024/09/23 22:30:22"
    },
  ])

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
  const handleMouseMove = (e) => {
    if (isDragging && draggedInput !== null) {
      const rect = document.getElementById('image-container').getBoundingClientRect();
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
      const dmkData = {
        assetId: "",
        content: data.text,
        posX: data.x,
        posY: data.y
      }
      // onKeyEnter(dmkData)
      setInputs([])
    }
  }

  return (
    <div
      id='image-container'
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative' }}
    >
      <Image
        src={src} 
        preview={false}
        style={{
          borderRadius: 8,
          userSelect: 'none',
          WebkitUserDrag: 'none'
        }}
        onClick={handleImageClick}
      />
      <div id='dmk-tag-layer'>
        {dmks.map(item => (
          <DanmakuBubble key={item.danmakuId} item={item}/>
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
            style={{
							position: 'absolute',
              left: `${input.x}%`,
              top: `${input.y}%`,
              borderRadius: '5px',
              padding: '5px',
              border: 'none',
							boxShadow: '10px 5px 5px rgba(0, 0, 0, 0.2)',
              background: 'rgba(255, 255, 255, 0.9)',
              minWidth: '20px',
              maxWidth: '300px',
              overflow: 'hidden',
							outline: 'none', 
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Danmaku