import { Avatar, List } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';
function NewEvent({item}) {
  return (
    <List.Item style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '100%', cursor: 'pointer' }}>
      {/* 第一行: Avatar 和使用者名稱靠左，時間靠右 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} />
          <strong style={{ paddingLeft: '12px', fontSize: '16px' }}>{item.name}</strong>
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          {item.createAt}
        </div>
      </div>

      {/* 第二行: 顯示最後傳送的訊息 */}
      <div style={{ marginTop: '8px', fontSize: '14px', color: '#555' }}>
        {item.message}
      </div>
    </List.Item>
  )
}

export default NewEvent