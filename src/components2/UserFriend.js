import React, { useState } from 'react';
import { Layout, Avatar, List, Button, message } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';

import axiox from '../axiox';
import { useFriendship } from '../context/FriendshipContext';

function UserFriend({item, userId}) {
  const {friendshipNotifications, setFriendshipNotifications, searchFriendships, setSearchFriendships} = useFriendship()

  function updateSearchFriendships(msgFriendship) {
    setSearchFriendships(prev => prev.map (f => 
      f.receiverUserId === msgFriendship.receiverUserId ? msgFriendship
      : f
    ))
  }

  function handleInvite() {
    console.log("邀請")
    axiox.post("/api/v1/friendship/invite",
      {
        senderUserId: localStorage.getItem("userId"),
        receiverUserId: item.receiverUserId
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("已送出邀請")
        updateSearchFriendships(data.data)
      } else {
        message.success("送出邀請錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("送出邀請錯誤")
    })
  }

  function handleApprove() {
    console.log("接受")
    axiox.post("/api/v1/friendship/approve",
      {
        friendshipId: item.friendshipId,
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("已接受邀請")
        updateSearchFriendships(data.data)
      } else {
        message.success("接受邀請錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("接受邀請錯誤")
    })
  }

  function handleReject() {
    console.log("拒絕")
    axiox.post("/api/v1/friendship/reject",
      {
        friendshipId: item.friendshipId,
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("已拒絕邀請")
        updateSearchFriendships(data.data)
      } else {
        message.success("拒絕邀請錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("拒絕邀請錯誤")
    })
  }

  function handleReinvite() {
    console.log("重送邀請")
    axiox.post("/api/v1/friendship/pending",
      {
        friendshipId: item.friendshipId,
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("已重送邀請")
        updateSearchFriendships(data.data)
      } else {
        message.success("重送邀請錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("重送邀請錯誤")
    })
  }

  const isRecv = item.receiverUserId === userId
  const userAvatarPath = isRecv ? item.senderUserAvatarPath : item.receiverUserAvatarPath 
  const userName = isRecv ? item.senderUserName : item.receiverUserName

  return (
    <List.Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {userAvatarPath ? (
          <Avatar size={48} src={userAvatarPath} />
        ) : (
          <Avatar size={48} icon={<UserOutlined />} />
        )}
        <div style={{ marginLeft: '10px' }}>
          <strong>{userName}</strong>
        </div>
      </div>
      <div style={{ height: '72px', display:'flex', flexDirection: 'column', justifyContent: 'center', gap: 4}}>
        { item.friendshipState === 0 && !isRecv &&  // pending sender
          <Button color='solid' variant='outlined'>已送出邀請</Button>
        }
        { item.friendshipState === 0 && isRecv && // pending receiver
          <Button color='primary' variant='outlined' onClick={handleApprove}>接受</Button>
        }
        { item.friendshipState === 0 && isRecv && // pending receiver
          <Button color='danger' variant='solid' onClick={handleReject}>拒絕</Button>
        }
        { item.friendshipState === 1 && // approved
          <Button color='solid' variant='outlined'>朋友</Button>
        }
        { item.friendshipState === 2 && !isRecv &&// rejected sender
          <Button color='primary' variant='outlined' onClick={handleReinvite}>重新邀請</Button>
        }
        { item.friendshipState === 2 && isRecv &&// rejected sender
          <Button color='solid' variant='outlined'>拒絕此邀請</Button>
        }
        { item.friendshipState === 3 && // none
          <Button color='primary' variant='outlined' onClick={handleInvite}>邀請</Button>
        }
      </div>
    </List.Item>
  )
}

export default UserFriend