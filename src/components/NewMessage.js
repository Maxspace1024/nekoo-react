import { Avatar, List } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';
function NewMessage({item}) {
  return (
    <List.Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* <Avatar icon={<UserOutlined />} size={40} /> */}
        <Avatar src={`https://nekoo-s3.s3.ap-northeast-1.amazonaws.com/cbb9848a-9514-49f5-8d10-0186aa9ce538.jpg`} size={48} />
        <div style={{ marginLeft: '10px' }}>
          <strong>使用者 1</strong>
          <div style={{ color: 'gray', fontSize: '12px' }}>上次訊息</div>
        </div>
      </div>
      <div style={{ height: '72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'gray', fontSize: '12px' }}>
        10:30 AM
      </div>
    </List.Item>
  )
}

export default NewMessage