import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Avatar, Tooltip, Modal, message} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import './DanmakuPlayer.css';  // 自訂的樣式文件

import axiox from '../axiox';
import xtyle from './CommonStyle';
import { S3HOST } from '../BaseConfig';
import UserAvatar from './UserAvatar';
import DanmakuPlayerEditor from './DanmakuPlayerEditor';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const calTextScale = (x) => {
  return 0.7 + x * 0.3
}

const DanmakuPlayerBubble = ({item}) => {
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
    <div className="barrage" 
      style={{ 
        position: 'absolute', 
        left: `${item.posX}%`, 
        top: `${item.posY}%`,
      }}
      onClick={handleClick}
    >
      <span 
        style={{ 
          backgroundColor: 'transparent', 
          fontWeight: 'bolder', 
          color: `${item.color}`,
          textShadow: `1px 1px 0 ${item.backgroundColor}, -1px -1px 0 ${item.backgroundColor}, -1px 1px 0 ${item.backgroundColor}, 1px -1px 0 ${item.backgroundColor}`,
            fontSize: `${16 * calTextScale(item.size)}px`,
        }}
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

const DanmakuPlayer2 = ({asset, dmkVisible, listOpen, onCancel, onDmkCountChange }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0)
  const [duration, setDuration] = useState(0);
  const animationFrameRef = useRef(null);

  const [barrageList, setBarrageList] = useState([]); // 保存彈幕列表
  const [barrageText, setBarrageText] = useState(''); // 輸入的彈幕文字

  // api debounce
  const [ulock, setUlock] = useState(false)

  // 儲存api彈幕資訊
  const dmkIndexRef = useRef(0)
  const dmksRef = useRef([])

  // 編輯器
  const [dmkStyleProps, setDmkStyleProps] = useState({
    color: '#FFFFFF',
    backgroundColor: '#000000',
    size: 1
  })
  const [isDmkStyleEditorOpen, setIsDmkStyleEditorOpen] = useState(false)

  const putDmk = (dmk) => {
    setBarrageList(prev => [...prev, dmk]);
  }

  // 添加彈幕
  const addBarrage = () => {
    if(barrageText === "" || ulock === true) {
      return
    }

    const posY = Math.random()*100

    const formData = new FormData()
    if ( "assetId" !== null)          formData.append("assetId", asset.id)
    if ( "type" !== null)             formData.append("type", 1)
    if ( "content" !== null )         formData.append("content", barrageText)
    if ( "color" !== null )           formData.append("color", dmkStyleProps.color)
    if ( "backgroundColor" !== null ) formData.append("backgroundColor", dmkStyleProps.backgroundColor)
    if ( "size" !== null )            formData.append("size", dmkStyleProps.size)
    if ( "posX" !== null )            formData.append("posX", 0)
    if ( "posY" !== null )            formData.append("posY", posY)
    if ( "appearAt" !== null )        formData.append("appearAt", videoRef.current.currentTime)
  
    setUlock(true)
    axiox.post("/api/v1/danmaku", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    .then(res => {
      const data = res.data
      if (res.status && data.data) {
        // console.log('彈幕傳送成功')
        const cindex = dmksRef.current.findIndex(dmk => dmk.appearAt >= videoRef.current.currentTime);
        if (cindex !== -1) {
          dmksRef.current.splice(cindex, 0, data.data)
        } else {
          dmksRef.current.push(data.data)
        }
        onDmkCountChange(1)
      }
    })
    .catch(e => {
      console.error(e)
    })
    .finally(() => {
      setUlock(false)
      setBarrageText('');
    })
  };

  useEffect(() => {
    axiox.post('/api/v1/danmaku/log', {
      assetId: asset.id
    })
      .then(res => {
        const data = res.data
      if (res.status && data.data) {
        const comments = data.data
        dmksRef.current = comments.sort((a,b) => a.appearAt - b.appearAt)
      }
    })
    .catch(e => {
      console.error(e)
    })
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  const updateTime = () => {
    if (videoRef.current) {
      currentTimeRef.current = videoRef.current.currentTime
      while(dmkIndexRef.current !== -1 && dmkIndexRef.current < dmksRef.current.length) {
        const dmk = dmksRef.current[dmkIndexRef.current]
        if (dmk.appearAt <= currentTimeRef.current) {
          putDmk(dmk)
          dmkIndexRef.current += 1
        } else {
          break;
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  const onPlaying = (e) => {
    dmkIndexRef.current = dmksRef.current.findIndex(dmk => dmk.appearAt >= videoRef.current.currentTime);
    setBarrageList([])
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }

  const onPause = (e) => {
    cancelAnimationFrame(animationFrameRef.current);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="video-container" style={{ position: 'relative', width: '100%', height: 'auto', padding: 0, margin: 0 }}>
        <video 
          ref={videoRef} 
          id="videox" 
          controls 
          controlsList="nofullscreen nodownload" 
          className="video-player"
          style={{ width: '100%', height: '100%', ...xtyle.cardStyle, borderRadius: '8px 8px 0 0' }}
          onPlaying={onPlaying}
          onPause={onPause}
        >
          <source src={`${S3HOST}${asset.path}`} />
        </video>

        {/* 彈幕層 */}
        <div 
          className="barrage-layer" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none',
            visibility: dmkVisible ? 'visible' : 'hidden',
          }}
        >
          {barrageList.map((barrage, index) => (
            <DanmakuPlayerBubble key={barrage.danmakuId} item={barrage} />
          ))}
        </div>
      </div>

      {/* 彈幕輸入 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'left',
          marginTop: 0,
        }}
      >
        <Button 
          color="primary"
          variant="filled"
          style={{ borderRadius: '0 0 0 8px' }}
          onClick={() => {setIsDmkStyleEditorOpen(true)}}
        >
          設定樣式
        </Button>
        <Input
          value={barrageText}
          onPressEnter={() => {addBarrage()}}
          onChange={(e) => setBarrageText(e.target.value)}
          style={{ borderRadius: 0 }}
          placeholder="輸入彈幕..."
        />
        <Button 
          type='primary' 
          onClick={addBarrage} 
          style={{ borderRadius: '0 0 8px 0' }}
        >
          發送
        </Button>
      </div>
      <Modal
        title={<div style={{fontSize: 20}}>彈幕清單</div>}
        footer={null}
        open={listOpen}
        onCancel={onCancel}
      >
        <div style={{overflowY: 'auto', maxHeight: 600}}>
          {dmksRef.current.map(item => (
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
                        textShadow: `1px 1px 0 ${item.backgroundColor}, -1px -1px 0 ${item.backgroundColor}, -1px 1px 0 ${item.backgroundColor}, 1px -1px 0 ${item.backgroundColor}` ,
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
      <DanmakuPlayerEditor 
        open={isDmkStyleEditorOpen}
        onClose={() => setIsDmkStyleEditorOpen(false)}
        onSetProperties={(x) => {setDmkStyleProps(x)}}
      />
    </div>
  )
};

export default DanmakuPlayer2