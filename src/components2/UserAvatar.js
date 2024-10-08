import { S3HOST } from "../BaseConfig"
import { Modal, Input, Button, Upload, message, Avatar, Tooltip, Card, Spin } from 'antd';
import { SendOutlined, UploadOutlined, UserOutlined,  MinusOutlined, CloseOutlined} from '@ant-design/icons';

function UserAvatar({src, size}) {
  return (
    <>
      { src ? (
        <Avatar size={size} src={`${S3HOST}${src}`} />
      ) : (
        <Avatar size={size} icon={<UserOutlined />} />
      )}
    </>
  )
}

export default UserAvatar