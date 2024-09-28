import React, { useState, useEffect } from 'react';
import { Image, Input } from 'antd';

function Danmaku2({ image, onKeyEnter, onSubscribe, onHistory }) {
  const [inputs, setInputs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedInput, setDraggedInput] = useState(null);
  const [dmks, setDmks] = useState([])

  useEffect(() => {
    onSubscribe(image.id, 
      (msg) => {
        const dmk = JSON.parse(msg.body)
        setDmks(prev => [...prev, dmk])
      },
      (msg) => {
        const dmks = JSON.parse(msg.body)
        setDmks(dmks)
      }
    )
    onHistory(image.id)
  }, [])

  // 點擊圖片時創建新輸入框
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
        imageId: image.id,
        content: data.text,
        posX: Math.round(data.x),
        posY: Math.round(data.y)
      }
      onKeyEnter(dmkData)
      setInputs([])
    }
  }

  return (
    <div
      id="image-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative' }}
    >
      <Image
        src={`https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/${image.path}`}
        alt="image"
        preview={false}
        style={{ maxHeight: '500px', borderRadius: 5, userSelect: 'none', WebkitUserDrag: 'none'}}
        onClick={handleImageClick}
      />
      <div id='dmk-tag-layer'>
        {dmks.map((dmk, index) => (
          <span
            key={`dmk-${dmk.id}`}
            style={{
							position: 'absolute',
              left: `${dmk.posX}px`,
              top: `${dmk.posY}px`,
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
          >
            {dmk.content}
          </span>
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
              left: `${input.x}px`,
              top: `${input.y}px`,
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
  );
}

export default Danmaku2;
