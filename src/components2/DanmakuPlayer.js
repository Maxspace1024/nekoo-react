import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Avatar, Tooltip, Modal} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './DanmakuPlayer.css';  // 自訂的樣式文件

import axiox from '../axiox';
import xtyle from './CommonStyle';
import { S3HOST } from '../BaseConfig';
import UserAvatar from './UserAvatar';
import DanmakuPlayerEditor from './DanmakuPlayerEditor';

const DanmakuPlayer = ({asset, dmkVisible, listOpen, onCancel, onDmkCountChange }) => {
  const videoRef = useRef(null);
  const [barrageList, setBarrageList] = useState([]); // 保存彈幕列表
  const [barrageText, setBarrageText] = useState(''); // 輸入的彈幕文字

  const [dmks, setDmks] = useState([])
  
  const [ulock, setUlock] = useState(false)

  const [dmkStyleProps, setDmkStyleProps] = useState({
    color: '#FFFFFF',
    backgroundColor: '#000000',
    size: 1
  })
  const [isDmkStyleEditorOpen, setIsDmkStyleEditorOpen] = useState(false)

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
    // if ( "visible" !== null )         formData.append("visible", barrageText)
    if ( "posX" !== null )            formData.append("posX", 0)
    if ( "posY" !== null )            formData.append("posY", posY)
    if ( "appearAt" !== null )        formData.append("appearAt", videoRef.current.currentTime)
    
    setBarrageList([
      ...barrageList, 
      { 
        // type: 1,
        color: dmkStyleProps.color,
        backgroundColor: dmkStyleProps.backgroundColor,
        size: dmkStyleProps.size,
        content: barrageText, 
        appearAt: videoRef.current.currentTime, 
        posX: 0,
        posY: posY 
      }
    ]);

    setUlock(true)
    axiox.post("/api/v1/danmaku", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    .then(res => {
      const data = res.data
      if (res.status && data.data) {
        console.log('彈幕傳送成功')
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

  const sendBarrage = (dmk) => {
    setBarrageList(prev => [
      ...prev, 
      {
        color: dmk.color,
        backgroundColor: dmk.backgroundColor,
        content: dmk.content, 
        appearAt: dmk.appearAt, 
        size: dmk.size,
        posX: 0,
        posY: dmk.posY
      }
    ]);
  }

  const [reqLogFlag, setReqLogFlag] = useState(false)

  useEffect(() => {
    axiox.post('/api/v1/danmaku/log', {
        assetId: asset.id
      })
      .then(res => {
        const data = res.data
      if (res.status && data.data) {
        setDmks(data.data)
        setReqLogFlag(true)
      }
    })
    .catch(e => {
      console.error(e)
    })
  }, [])

  // 撥放影片時處理彈幕顯示
  useEffect(() => {      
    console.log('不錯喔')
    if (dmks.length > 0) {
      videoRef.current.addEventListener("playing", () => {
        let dmkIndex = 0
        let dmk = null
        setBarrageList([])
        setInterval(() => {
          try{
            dmk = dmks[dmkIndex]
            if (dmk && dmk.appearAt <= videoRef.current.currentTime) {
              sendBarrage(dmk)
              dmkIndex++
            }
          } catch(e) {

          }
        }, 50)
      })
    }

    // return () => {
    //   videoRef.current.removeEventListener("playing", () => {})
    // }
  }, [dmks]);


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
            visibility: dmkVisible ? 'visible' : 'hidden'
          }}
        >
          {barrageList.map((barrage, index) => (
            <div key={index} className="barrage" 
              style={{ 
                position: 'absolute', 
                left: `${barrage.posX}%`, 
                top: `${barrage.posY}%`,
              }}
            >
              <span style={{ 
                  color: `${barrage.color}`,
                  backgroundColor: 'transparent', 
                  fontWeight: 'bolder', 
                  textShadow: '1px 1px 0 black, -1px -1px 0 black, -1px 1px 0 black, 1px -1px 0 black' 
                }}
              >
                {barrage.content}
              </span>
            </div>
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
                    <UserAvatar src={item.userAvatarPath} size={40} />
                    <div style={{ marginLeft: '10px' }}>
                      <strong style={{ fontSize: '16px' }}>{item.userName}</strong><br />
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
      <DanmakuPlayerEditor 
        open={isDmkStyleEditorOpen}
        onClose={() => setIsDmkStyleEditorOpen(false)}
        onSetProperties={(x) => {setDmkStyleProps(x)}}
      />
    </div>
  )
};

export default DanmakuPlayer