import React, { useEffect, useRef, useState } from 'react';
import { Modal, Input, Button, Upload, message, Avatar, Tooltip, Card, Spin } from 'antd';
import { SendOutlined, UploadOutlined, UserOutlined,  MinusOutlined, CloseOutlined} from '@ant-design/icons';

import axiox from '../axiox';
import stompClient from '../StompClient';
import { useChatroom } from '../context/ChatroomContext';
import { useAuth } from '../context/AuthContext';

const ChatBubble = ({item}) => {
  return (
      <div
        key={`chatLog-${item.chatLogId}`}
        style={{
          textAlign: item.sender === 'self' ? 'right' : 'left',
          marginBottom: 8
        }}
      >
        <div
          style={{
            display: 'inline-block',
            maxWidth: '70%',
            padding: 8,
            borderRadius: 8,
            backgroundColor: item.sender === 'self' ? '#1890ff' : '#f0f0f0',
            color: item.sender === 'self' ? 'white' : 'black',
            textAlign: 'left',
            wordBreak: 'break-word',    // 這行確保長單字會換行
            overflowWrap: 'break-word', // 這行是更好的兼容性確保
            textWrap: 'wrap'
          }}
        >
          <Tooltip title={new Date(item.createAt).toLocaleString('zh-TW', { hour12: false })}>
            <div style={{ 
              cursor: 'pointer' // 讓使用者知道此區域可以互動
            }}>
              {item.content}
            </div>
          </Tooltip>
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          {new Date(item.createAt).toLocaleString('zh-TW', { hour12: true, hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
  )
}

function ChatRoomWindow({item, onClose}) {
  const {auth, setAuth, isWsConnected} = useAuth()
  const {
    channels, setChannels,
    unreadChannels, setUnreadChannels, 
    chatLogs, setChatLogs, 
    newChannel, setNewChannel, 
    newChatLog, setNewChatLog
  } = useChatroom()

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false)

  const messageScrollRef = useRef()

  const handleSend = () => {
    if (inputText.trim()) {
      const formData = new FormData()
      if ( "chatroomId" !== null )      formData.append("chatroomId", item.chatroomId)
      if ( "chatroomUuid" !== null )    formData.append("chatroomUuid", item.chatroomUuid)
      if ( "content" !== null )         formData.append("content", inputText)
      
      axiox.post("/api/v1/chat", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      .then(res => {
        console.log(res)
      })
      .catch(e => {console.error(e)})
      setInputText("");
    }
  }

  const fetchChatLog = () => {
    setLoading(true)
    axiox.post("/api/v1/chat/log",{chatroomId: item.chatroomId})
    .then(response => {
      const data = response.data
      const success = data.success
      if (success) {
        const logs = data.data
        const userId = auth.userId
        for(let chatLog of logs) {
          chatLog.sender = chatLog.userId === userId ? 'self' : 'other'
        }
        setMessages(logs)
      }
    })
    .catch(e => console.error(e))
    .finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    if (item !== null) {
      fetchChatLog()
    }
  }, [item])

  useEffect(() => {
    if (setChatLogs) {
      setChatLogs(messages)
    }
  }, [messages, setChatLogs])

  useEffect(() => {
    messageScrollRef.current.lastElementChild?.scrollIntoView({ block: 'end' });
  }, [chatLogs])

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            { false ? (
                <Avatar style={{marginRight: 8}}/>
              ) : (
                <Avatar icon={<UserOutlined />} />
              )
            }
            <span style={{marginLeft: 8, fontSize: 20}}>{item.chatroomName}</span>
          </div>
          <Button 
            type='text'
            icon={<CloseOutlined />} 
            onClick={() => onClose()} 
          />
        </div>
      }
      style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: '10vw', 
        width: 360, 
        display: 'block', 
        boxShadow: '1px 1px 8px lightgray',
      }}
      headStyle={{ padding: 8 }}
      bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: 8 }}
    >
      <div 
        ref={messageScrollRef}
        style={{ 
          height: 400, 
          overflowY: 'scroll', 
          marginBottom: 16, 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
      >
        { loading ?
          <div style={{display: 'flex', justifyContent:'center', alignItems: 'center', height: '100%'}}>
            <Spin></Spin>
          </div>
          :
          chatLogs.map(msg => (
            <ChatBubble key={msg.chatLogId} item={msg} />
          ))
        }
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onPressEnter={handleSend}
          style={{ flex: 1, borderRadius: '5px 0 0 5px'}}
        />
        <Button type="primary" icon={<SendOutlined /> } style={{ borderRadius: '0 5px 5px 0'}} onClick={handleSend}>
          發送
        </Button>
      </div>
    </Card>
  )
}

export default ChatRoomWindow