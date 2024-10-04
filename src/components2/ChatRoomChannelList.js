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
import ChatRoomModal from './ChatRoomModal';
import ChatRoomWindow from './ChatRoomWindow';

const { Search } = Input;

function ChatRoomChannelList() {
  const {auth, setAuth, isLoginValid, isWsConnected, setIsWsConnected} = useAuth()

  const channelScrollRef = useRef(null)
  const [channelScrollLock, setChannelScrollLock] = useState(false)
  const [channelScrollPage, setChannelScrollPage] = useState(0)

  const [channelInfo, setChannelInfo] = useState(null)
  const [isChannelOpen, setIsChannelOpen] = useState(false)

  const [channels, setChannels] = useState([])
  const [newChannel, setNewChannel] = useState(null)
  const [filterText, setFilterText] = useState("")


  useEffect(() => {
    // 聊天室頻道
    stompClient.subscribe(`/topic/chatroom/new/${auth.userId}`, (msgChatroom) => {
      setChannels(prev => [msgChatroom, ...prev])
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
      if (data.data != null) {      
        const {page, totalPages} = data.data
        setChannels(page)
        for (const channel of page) {
          stompClient.subscribe(`/topic/chatroom/${channel.chatroomUuid}`, (msg) => {
    
          })
        }
      }
    })
    .catch(e => console.error(e))
  }

  // const handleChannelScroll = (e) => {
  //   const { scrollTop, scrollHeight, clientHeight } = channelScrollRef.current
  //   if (scrollTop + clientHeight + 20 >= scrollHeight && channelScrollLock == false) {
  //     setChannelScrollLock(true)
  //     setChannelScrollPage(prev => prev + 1)
  //   }
  // }

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
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => {
                setIsChannelOpen(true)
                setChannelInfo(item)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {item.chatroomAvatarPath ? (
                  <Avatar size={48} src={item.chatroomAvatarPath} />
                ) : (
                  <Avatar size={48} icon={<UserOutlined />} />
                )}
                <div style={{ marginLeft: '10px' }}>
                  <strong>{item.chatroomName}</strong>
                  <div style={{ color: 'gray', fontSize: '12px' }}>{item.userName}:&nbsp;{item.lastContent.substring(0,8) + "..."}</div>
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
            setIsChannelOpen(false)
            setChannelInfo(null)
          }}
        />
      }
    </>
  )
}

export default ChatRoomChannelList