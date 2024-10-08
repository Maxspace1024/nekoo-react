import React, { useState, useEffect, useRef } from 'react';
import { Layout, Avatar, List, Button, Input, AutoComplete, Card } from 'antd';
import {
  UserOutlined,
  MinusOutlined,
  CloseOutlined
} from '@ant-design/icons';
import xtyle from "./CommonStyle"
import { useAuth } from "../context/AuthContext"

import stompClient from '../StompClient'
import axiox from '../axiox'
import ChatRoomWindow from './ChatRoomWindow';
import { useChatroom } from '../context/ChatroomContext';
import { S3HOST } from '../BaseConfig';
import UserAvatar from './UserAvatar';

const { Search } = Input;

function ChatRoomChannelList() {
  const {auth, setAuth, isLoginValid, isWsConnected, setIsWsConnected} = useAuth()

  const channelScrollRef = useRef(null)
  const [channelScrollLock, setChannelScrollLock] = useState(false)
  const [channelScrollPage, setChannelScrollPage] = useState(0)

  const [channelInfo, setChannelInfo] = useState(null)
  const [isChannelOpen, setIsChannelOpen] = useState(false)

  const [isChannelsInit, setIsChannelsInit] = useState(false)

  const { 
    channels, setChannels, 
    unreadChannels, setUnreadChannels, 
    chatLogs, setChatLogs, 
    newChannel, setNewChannel, 
    newChatLog, setNewChatLog 
  } = useChatroom()
  const [filterText, setFilterText] = useState("")


  useEffect(() => {
    // 聊天室頻道
    stompClient.subscribe(`/topic/chatroom/new/${auth.userId}`, (msgChatroom) => {
      setChannels(prev => [msgChatroom, ...prev])
      setNewChannel(msgChatroom)
    })

    return () => {
      stompClient.unsubscribe(`/topic/chatroom/new/${auth.userId}`)
    }
  }, [isWsConnected])


  function fetchChannelPage() {
    axiox.post("/api/v1/chatroomPage",{page: channelScrollPage})
    .then(response => {
      const data = response.data
      const success = data.success
      if (success && data.data) {      
        const {page, totalPages} = data.data
        setChannels(page)
        setIsChannelsInit(true)
      }
    })
    .catch(e => console.error(e))
  }

  useEffect(() => {
    if (isChannelsInit === true) {  
      for (const channel of channels) {
        stompClient.subscribe(`/topic/chatroom/${channel.chatroomUuid}`, (msg) => {
          // msg.chatlog
          msg.sender = msg.userId === auth.userId ? 'self' : 'other'
          setChatLogs(prev => [...prev, msg])
          setChannels(prev => {
            const index = prev.findIndex(item => item.chatroomId === msg.chatroomId);
            if (index !== -1) {
                prev[index].lastContent = msg.content;
                prev[index].lastUserName = msg.userName;
                prev[index].lastCreateAt = msg.createAt;
                prev[index].lastUserId = msg.userId
                prev[index].readState = 0; // unread
                const temp = prev[index]
                prev.splice(index, 1);
                prev.unshift(temp)
            }
            return prev
          })
        })
      }
    }
  }, [isChannelsInit])

  useEffect(() => {
    fetchChannelPage()
  }, [channelScrollPage])

  useEffect(() => {
    return () => {
      for (const channel of channels) {
        stompClient.unsubscribe(`/topic/chatroom/${channel.chatroomUuid}`)
      }
    }
  }, [channels])

  useEffect(() => {
    if (newChannel !== null) {
      stompClient.subscribe(`/topic/chatroom/${newChannel.chatroomUuid}`, (msg) => {
        msg.sender = msg.userId === auth.userId ? 'self' : 'other'
        setChatLogs(prev => [...prev, msg])
      })
    }
  }, [newChannel])

  const handleSearch = (value) => {
    setFilterText(value)
  }


  if (!isLoginValid) {
    return <></>
  }
  return (
    <>
      <AutoComplete
        onSearch={handleSearch}
        style={{ width: '100%' }}
      >
        <Search
          placeholder="搜尋聊天室"
          allowClear
        />
      </AutoComplete>
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        <List
          itemLayout="horizontal"
          dataSource={channels.filter( c => c.chatroomName.includes(filterText) )}
          renderItem={item => (
            <List.Item 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                cursor: 'pointer',
              }} 
              onClick={() => {
                axiox.post("/api/v1/chat/seen",{chatroomId: item.chatroomId})
                .then(response => {
                  const data = response.data
                  const success = data.success
                  if (success && data.data) {      
                    
                  }
                })
                .catch(e => console.error(e))

                setIsChannelOpen(true)
                setChannelInfo(item)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                <div>
                  <UserAvatar src={item.chatroomAvatarPath} size={48} />
                </div>
                <div style={{ marginLeft: '10px' }}>
                  <strong style={{ wordBreak: 'break-word', overflowWrap: 'break-word',textWrap: 'wrap'}}>
                    {item.chatroomName}
                  </strong>
                  { item.lastContent && 
                    <div style={{ color: 'gray', fontSize: '12px' }}>{item.lastUserName}:&nbsp;{item.lastContent.substring(0,8) + "..."}</div>
                  }
                </div>
              </div>
              {item.lastCreateAt && 
                <div style={{ height: '72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', color: 'gray', fontSize: '12px' }}>
                  <span>{new Date(item.lastCreateAt).toLocaleDateString()}</span>
                  <span>{new Date(item.lastCreateAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
              }
            </List.Item>
          )}
        />
      </div>
      {isChannelOpen &&
        <ChatRoomWindow 
          item={channelInfo}
          onClose={() => {
            console.log(channelInfo)
            setIsChannelOpen(false)
            setChannelInfo(null)
          }}
        />
      }
    </>
  )
}

export default ChatRoomChannelList