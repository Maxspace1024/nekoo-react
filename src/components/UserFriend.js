import React, { useState } from 'react';
import { Layout, Avatar, List, Button } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';

import stompClient from '../StompClient';

function UserFriend({item}) {
  function handleInvite() {
    console.log("邀請")
    stompClient.send("/app/friendship/invite", {Authorization: `Bearer ${localStorage.getItem("jwt")}`}, 
      {
        receiverUserId: item.receiverUserId
      }
    )
  }

  function handleApprove() {
    console.log("接受")
    stompClient.send("/app/friendship/update", {Authorization: `Bearer ${localStorage.getItem("jwt")}`}, 
      {
        friendshipId: item.friendshipId,
        state: 1
      }
    )
  }

  function handleReject() {
    console.log("拒絕")
    stompClient.send("/app/friendship/update", {Authorization: `Bearer ${localStorage.getItem("jwt")}`}, 
      {
        friendshipId: item.friendshipId,
        state: 2
      }
    )
  }

  function handleReinvite() {
    console.log("重送邀請")
    stompClient.send("/app/friendship/update", {Authorization: `Bearer ${localStorage.getItem("jwt")}`}, 
      {
        friendshipId: item.friendshipId,
        state: 0
      }
    )
  }

  const userId = parseInt(localStorage.getItem("userId"))

  return (
    <List.Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {item.receiverUserAvatarPath ? (
          <Avatar size={48} src={item.receiverUserAvatarPath} />
        ) : (
          <Avatar size={48} icon={<UserOutlined />} />
        )}
        <div style={{ marginLeft: '10px' }}>
          <strong>{item.receiverUserName}</strong>
        </div>
      </div>
      <div style={{ height: '72px', display:'flex', flexDirection: 'column', justifyContent: 'center', gap: 4}}>
        { item.friendshipState === 0 && item.senderUserId === userId &&  // pending sender
          <Button color='solid' variant='outlined'>已送出邀請</Button>
        }
        { item.friendshipState === 0 && item.receiverUserId === userId && // pending receiver
          <Button color='primary' variant='outlined' onClick={handleApprove}>接受</Button>
        }
        { item.friendshipState === 0 && item.receiverUserId === userId && // pending receiver
          <Button color='danger' variant='solid' onClick={handleReject}>拒絕</Button>
        }
        { item.friendshipState === 1 && // approved
          <Button color='solid' variant='outlined'>朋友</Button>
        }
        { item.friendshipState === 2 && item.senderUserId === userId &&// rejected sender
          <Button color='solid' variant='outlined' onClick={handleReinvite}>重新邀請</Button>
        }
        { item.friendshipState === 3 && // none
          <Button color='primary' variant='outlined' onClick={handleInvite}>邀請</Button>
        }
        
      </div>
    </List.Item>
  )
}

export default UserFriend