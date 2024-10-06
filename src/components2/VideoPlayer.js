import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from 'antd';
import './VideoPlayer.css';  // 自訂的樣式文件

const VideoPlayer = ({src}) => {
  const videoRef = useRef(null);
  const [barrageList, setBarrageList] = useState([]); // 保存彈幕列表
  const [barrageText, setBarrageText] = useState(''); // 輸入的彈幕文字

  let videox;
  const updateTime = () => {
      console.log('Current time:', videox.currentTime);
  };

  // 添加彈幕
  const addBarrage = () => {
    setBarrageList([...barrageList, { text: barrageText, time: videoRef.current.currentTime, top: Math.random()*100 }]);
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

    // videox = document.getElementById('videox');
    // // 设置一个短时间间隔来检查视频播放时间
    // const intervalId = setInterval(updateTime, 50); // 每 100 毫秒更新一次
    
    // // 在视频暂停或结束时停止 interval
    // videox.addEventListener('pause', () => clearInterval(intervalId));
    // videox.addEventListener('ended', () => clearInterval(intervalId));

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="video-container">
      <video ref={videoRef} id="videox" controls className="video-player">
        <source src={src} />
      </video>

      {/* 彈幕層 */}
      <div className="barrage-layer">
        {barrageList.map((barrage, index) => (
          <div key={index} className="barrage" style={{ left: `${barrage.left}px`, top: `${barrage.top}%`}}>
            <span style={{color: 'red', fontWeight: 'bolder'}}>{barrage.text}</span>
          </div>
        ))}
      </div>

      {/* 彈幕輸入 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'left'
        }}
      >
        <Input
          value={barrageText}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              addBarrage()
            }
          }}
          onChange={(e) => setBarrageText(e.target.value)}
          placeholder="輸入彈幕..."
        />
        <Button onClick={addBarrage}>發送</Button>
      </div>
    </div>
  );
};

export default VideoPlayer