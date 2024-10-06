import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from 'antd';
// import 'antd/dist/antd.css';
import './VideoPlayer.css';  // 自訂的樣式文件

const VideoPlayer = ({src}) => {
  const videoRef = useRef(null);
  const [barrageList, setBarrageList] = useState([]); // 保存彈幕列表
  const [barrageText, setBarrageText] = useState(''); // 輸入的彈幕文字

  // 添加彈幕
  const addBarrage = () => {
    setBarrageList([...barrageList, { text: barrageText, time: videoRef.current.currentTime }]);
    setBarrageText('');
  };

  // 撥放影片時處理彈幕顯示
  useEffect(() => {
    const interval = setInterval(() => {
      setBarrageList(prev => prev.map(barrage => ({
        ...barrage,
        left: barrage.left !== undefined ? barrage.left - 2 : window.innerWidth,
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        // 影片進入全螢幕
        document.querySelector('.barrage-layer').classList.add('fullscreen');
      } else {
        // 影片退出全螢幕
        document.querySelector('.barrage-layer').classList.remove('fullscreen');
      }
    };
  
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="video-container">
      <video ref={videoRef} controls className="video-player">
        <source src={src} />
      </video>

      {/* 彈幕層 */}
      <div className="barrage-layer">
        {barrageList.map((barrage, index) => (
          <div key={index} className="barrage" style={{ left: `${barrage.left}px` }}>
            {barrage.text}
          </div>
        ))}
      </div>

      {/* 彈幕輸入 */}
      <div className="barrage-input">
        <Input
          value={barrageText}
          onChange={(e) => setBarrageText(e.target.value)}
          placeholder="輸入彈幕..."
          style={{ width: '70%' }}
        />
        <Button onClick={addBarrage}>發送</Button>
      </div>
    </div>
  );
};

export default VideoPlayer