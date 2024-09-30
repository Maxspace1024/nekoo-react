import React, { useEffect, useState } from 'react';
import { Modal, Input, Button, Upload, message, Avatar } from 'antd';
import { SendOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';

import stompClient from '../StompClient';

const chatLogs = [
  { chatLogId: 1, chatroomId: "asdf", userAvatarPath: "https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg", content: "你好！", sender: "other", createAt: "2024-09-28T04:10:42.417Z" },
  { chatLogId: 2, chatroomId: "asdf", userAvatarPath: "https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg", content: "嗨，最近如何？", sender: "self", createAt: "2024-09-28T04:11:42.417Z" },
];

const ChatBubble = ({item}) => {
  return (
    //   <div>
    //   {item.userAvatarPath ? (
    //     <Avatar size={48} src={item.userAvatarPath} />
    //   ) : (
    //     <Avatar size={48} icon={<UserOutlined />} />
    //   )}
    // </div>
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
          {item.content}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          {new Date(item.createAt).toLocaleString()}
        </div>
      </div>
  )
}

const ChatRoomModal = ({config}) => {
  const [messages, setMessages] = useState(chatLogs);
  const [inputText, setInputText] = useState("");
  const [isChatRoomOpen, setChatRoomOpen] = useState(false)

  const hanleModalCancel = () => {
    setChatRoomOpen(false)
  }

  useEffect(() => {
    console.log(config)
    setChatRoomOpen(true)
    stompClient.subscribe(`/topic/chatroom/${config.chatroomUuid}`, (msg) => {
      console.log(JSON.parse(msg.body))
    })
  }, [config])

  const handleSend = () => {
    if (inputText.trim()) {
      // setMessages([...messages, {
      //   id: messages.length + 1,
      //   text: inputText,
      //   sender: "self",
      //   time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      // }]);
      stompClient.send(`/chatroom`, {Authorization: `Bearer ${localStorage.getItem("jwt")}`}, 
        {
          chatroomId: config.chatroomId,
          content: inputText
        }
      )
      setInputText("");
    }
  };

  const handleFileUpload = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上傳成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上傳失敗`);
    }
  };

  return (
    <Modal
      title={<div style={{ textAlign: 'left' }}>聊天室</div>}
      centered
      open={isChatRoomOpen}
      footer={null}
      onCancel={hanleModalCancel}
      width={600}
    >
      <div style={{ height: 400, overflowY: 'auto', marginBottom: 16, scrollbarWidth: 'none', msOverflowStyle: 'none'}} onScroll={(e) => {console.log(e)}}>
        {messages.map(msg => (
          <ChatBubble key={msg.chatLogId} item={msg} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* <Upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          onChange={handleFileUpload}
        >
          <Button icon={<UploadOutlined />} />
        </Upload> */}
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onPressEnter={handleSend}
          style={{ flex: 1, margin: '0 8px' }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
          發送
        </Button>
      </div>
    </Modal>
  );
};

export default ChatRoomModal;