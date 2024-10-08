import React, { useState } from 'react';
import { Layout, Avatar, List, Button } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';

import axiox from '../axiox';
import { useAuth } from '../AuthContext';

function UserFriend({item}) {
  const {auth, setAuth} = useAuth()

  function handleInvite() {
    console.log("邀請")
    axiox.post("/api/v1/friendship/invite",
      {
        senderUserId: localStorage.getItem("userId"),
        receiverUserId: item.receiverUserId
      }
    ).then(response => {
      console.log(response.data)
    })
    .catch(e => console.error(e))
  }

  function handleApprove() {
    console.log("接受")
    axiox.post("/api/v1/friendship/approve",
      {
        friendshipId: item.friendshipId,
      }
    ).then(response => {
      console.log(response.data)
    })
    .catch(e => console.error(e))
  }

  function handleReject() {
    console.log("拒絕")
    axiox.post("/api/v1/friendship/reject",
      {
        friendshipId: item.friendshipId,
      }
    ).then(response => {
      console.log(response.data)
    })
    .catch(e => console.error(e))
  }

  function handleReinvite() {
    console.log("重送邀請")
    axiox.post("/api/v1/friendship/pending",
      {
        friendshipId: item.friendshipId,
      }
    ).then(response => {
      console.log(response.data)
    })
    .catch(e => console.error(e))
  }

  const userId = auth.userId

  return (
    <List.Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {item.receiverUserAvatarPath &&
          <UserAvatar src={item.receiverUserAvatarPath} size={48} />
        }
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
        { item.friendshipState === 2 && item.receiverUserId === userId &&// rejected sender
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