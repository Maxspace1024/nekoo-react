import React, { useState } from 'react';
import { Layout, Avatar, List, Button } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';

function UserFriend({item}) {

  return (
    <List.Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* <Avatar icon={<UserOutlined />} size={40} /> */}
        <Avatar src={`https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg`} size={48} />
        <div style={{ marginLeft: '10px' }}>
          <strong>使用者 1</strong>
        </div>
      </div>
      <div style={{ height: '72px', display:'flex', flexDirection: 'column', justifyContent: 'center', gap: 4}}>
        {/* <Button color='primary' variant='outlined'>邀請</Button> */}
        <Button color='primary' variant='outlined' disabled>已送出邀請</Button>
        {/* <Button color='primary' variant='outlined'>接受</Button> */}
        {/* <Button color='danger' variant='solid'>拒絕</Button> */}
      </div>
    </List.Item>
  )
}

export default UserFriend