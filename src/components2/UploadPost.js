import React, {useState, useEffect, useRef} from 'react';
import { Button, Modal, Form, Avatar, Input, Upload, Tag, Spin, message, Tooltip} from 'antd';
import { PlusOutlined , UploadOutlined, UserOutlined, InboxOutlined, LockOutlined, GlobalOutlined} from '@ant-design/icons';
import axiox from '../axiox';
import { useAuth } from '../context/AuthContext';
import xtyle from './CommonStyle';
import { S3HOST } from '../BaseConfig';

const UploadPost = () => {
  const {auth, setAuth} = useAuth()

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const [privacy, setPrivacy] = useState(0)
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit()
  };

  const onFormFinish = (data) => {
    const formData = new FormData()

    formData.append("content", data.content)
    formData.append("hashtags", tags)
    formData.append("privacy", privacy)
    if (data.upload) {
      data.upload.forEach((file) => {
        formData.append('files', file.originFileObj);
      });
    }
    axiox.post("/api/v1/post", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    .then(res => {
      const data = res.data
      if (res.status == 200 && data.data) {
        setIsModalVisible(false);
        message.success("上傳貼文成功")
      } else {
        message.success("上傳貼文失敗")
      }
    })
    .catch(e => {
      console.log(e)
      message.error("上傳貼文失敗")
    })
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    setTags([])
    setInputValue(false)
    setInputValue('')
    setFileList([])
  };

  // uploadFile
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // hashtags
  const handleClose = (removedTag) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputConfirm();
    }
  };

  const updatePrivacy = (x) => {
    setPrivacy(x)
  }

  const onFinish = (values) => {
    console.log('Submitted tags:', tags);
  };

  return (
    <>
      <Modal
        title="上傳貼文"
        centered
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form 
          form={form}
          layout="vertical" 
          name="form_in_modal"
          onFinish={onFormFinish}
          >
          <Form.Item
            name="content"
            rules={[{ required: true, message: '文字訊息' }]}
          >
            <Input.TextArea 
              placeholder='寫下什麼吧'
              style={{...xtyle.hideScrollbar}} 
              autoSize={{ minRows: 12, maxRows: 12 }}
            />
          </Form.Item>
          <Form.Item label="標籤" name="tags">
            <div style={{ border: '1px solid #d9d9d9', borderRadius: '2px', padding: '4px', minHeight: '32px', display: 'flex', justifyContent:'start', alignContent: 'center', flexWrap: 'wrap' ,wordBreak: 'break-word', overflowWrap: 'break-word',textWrap: 'wrap' }}>
              {tags.map((tag, index) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleClose(tag)}
                  style={{ marginBottom: '4px', fontSize: 16, display: 'flex', alignItems: 'center'}}
                >
                  {tag}
                </Tag>
              ))}
              {inputVisible && (
                <Input
                  ref={inputRef}
                  type="text"
                  size="small"
                  style={{ width: 78 }}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                  onKeyDown={handleInputKeyDown}
                  styles={{border: 'none', outline: 'none'}}
                />
              )}
              {!inputVisible && (
                <Tag onClick={showInput} style={{ background: '#fff', borderStyle: 'dashed', display: 'flex', alignItems: 'center' }}>
                  + 新標籤
                </Tag>
              )}
            </div>
          </Form.Item>
          <Form.Item label="隱私">
              { privacy === 0 &&
                <Tooltip title={'隱私:公開'}>
                  <Button type="text" icon={<GlobalOutlined style={{ fontSize: '24px' }} /> } onClick={() => {updatePrivacy(1)}}/>
                </Tooltip>
              }
              { privacy === 1 &&
                <Tooltip title={'隱私:朋友'}>
                  <Button type="text" icon={<LockOutlined style={{ fontSize: '24px' }} /> } onClick={() => {updatePrivacy(0)}}/>
                </Tooltip>
              }
            </Form.Item>
          <Form.Item
            name="upload"
            label="文件上傳"
            valuePropName="fileList"
            getValueFromEvent={(e) => e && e.fileList}
          >
            <Upload 
              beforeUpload={() => false}  
              fileList={fileList}
              onChange={handleFileChange}
              listType={'picture-card'}
              showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
              required
              >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上傳</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <div style={xtyle.uploadPostContent}
        onClick={showModal}
      >
        <div style={{width: 'auto'}}>
          { auth && auth.userAvatarPath ? (
              <Avatar size={48} src={S3HOST + auth.userAvatarPath} />
            ) : (
              <Avatar size={48} icon={<UserOutlined />} />
            )
          }
        </div>
        
        <div style={xtyle.uploadPostHintInput}>
          { auth && `${auth.userName}，你在想什麼呀~`}
        </div>
      </div>
    </>
  )
}

export default UploadPost