import { S3HOST } from "../BaseConfig"
import { Avatar, Image} from 'antd';
import { SendOutlined, UploadOutlined, UserOutlined,  MinusOutlined, CloseOutlined} from '@ant-design/icons';

function UserAvatar({src, size, preview=false}) {
  return (
    <div style={{border: '1px solid lightgray', borderRadius: '50%'}}>
      { src ? (
        // <Avatar size={size} icon={<Image src={`${S3HOST}${src}`} preview={preview} style={{backgroundColor: 'white', objectFit: 'cover'}}/>} />
        <Image src={`${S3HOST}${src}`} preview={preview} style={{backgroundColor: 'white', borderRadius: '50%', width: size, height: size, objectFit: 'cover'}}/>
      ) : (
        <Avatar size={size} icon={<UserOutlined />} />
      )}
    </div>
  )
}

export default UserAvatar