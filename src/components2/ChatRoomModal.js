import React, { useEffect, useRef, useState } from 'react';
import { Modal, Input, Button, Upload, message, Avatar, Tooltip } from 'antd';
import { SendOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';

import axiox from '../axiox';
import stompClient from '../StompClient';
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

const ChatRoomModal = ({config}) => {
  const {auth, setAuth} = useAuth()

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isChatRoomOpen, setChatRoomOpen] = useState(false)

  const hanleModalCancel = () => {
    setChatRoomOpen(false)
  }

  useEffect(() => {
    setChatRoomOpen(true)
    stompClient.subscribe(`/topic/chatroom/${config.chatroomUuid}`, (msgChatLog) => {
      const userId = auth.userId
      msgChatLog.sender = msgChatLog.userId === userId ? 'self' : 'other'
      setMessages(prev => [...prev, msgChatLog])
    })

    if (config.chatroomId) {
      axiox.post("/api/v1/chat/log",{chatroomId: config.chatroomId})
      .then(response => {
        const data = response.data
        const success = data.success
        if (success) {
          const chatLogs = data.data
          const userId = auth.userId
          for(let chatLog of chatLogs) {
            chatLog.sender = chatLog.userId === userId ? 'self' : 'other'
          }
          setMessages(chatLogs)
        }
      })
      .catch(e => console.error(e))
    }

    return () => stompClient.unsubscribe(`/topic/chatroom/${config.chatroomUuid}`)
  }, [config])
  
  useEffect(() => {
    const messageScroll = document.getElementById("messageScroll")
    if (messageScroll) {
      messageScroll.lastElementChild?.scrollIntoView({  block: 'end' });
    }
  }, [messages])

  const handleSend = () => {
    if (inputText.trim()) {
      const formData = new FormData()
      if ( "chatroomId" !== null )      formData.append("chatroomId", config.chatroomId)
      if ( "chatroomUuid" !== null )    formData.append("chatroomUuid", config.chatroomUuid)
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
  };


  return (
    <div>
    <Modal
      title={
        <div style={{ fontSize: 16, textAlign: 'left' }}>
          { config.chatroomAvatarPath ? (
              <Avatar src={config.chatroomAvatarPath} style={{marginRight: 8}}/>
            ) : (
              <Avatar icon={<UserOutlined />} />
            )
          }
          {config.chatroomName}
        </div>
      }
      centered
      open={isChatRoomOpen}
      footer={null}
      onCancel={hanleModalCancel}
      width={480}
    >
      <div id="messageScroll"
      style={{ 
        height: 400, 
        overflowY: 'scroll', 
        marginBottom: 16, 
        border: '1px solid rgba(0,0,0,0.3)', 
        borderRadius: 8, 
        padding: 8, 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none'
        }}
      >
        {messages.map(msg => (
          <ChatBubble key={msg.chatLogId} item={msg} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onPressEnter={handleSend}
          style={{ flex: 1}}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
          發送
        </Button>
      </div>
    </Modal>
    </div>
  );
};

export default ChatRoomModal;