import React, {useState, useRef, useEffect} from 'react';
import { Button, Modal, Form, Input, Upload, Tag, message, Progress} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axiox from '../axiox';
import { useAuth } from '../context/AuthContext';
import xtyle from './CommonStyle';

import stompClient from '../StompClient';

const {Dragger} = Upload

function PostEditor({item, open, onClose}) {
  const {auth, setAuth, isWsConnected} = useAuth()
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const [tags, setTags] = useState(item.hashtags);
  const [content, setContent] = useState(item.content)
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState(item.content);
  const inputRef = useRef(null);

  const [ulock, setUlock] = useState(false)

  const [s3Progress, setS3Progress] = useState(0)

  useEffect(() => {
    stompClient.subscribe(`/topic/post/progress/${auth.userId}`, (msgProgress) => {
      setS3Progress(Math.round(msgProgress.progress))
    })

    return () => {
      stompClient.unsubscribe(`/topic/post/progress/${auth.userId}`)
    }
  }, [isWsConnected])

  const handleOk = () => {
    if (ulock === true) {
      return
    }
    setUlock(true)
    form.submit()
  };

  const onFormFinish = (data) => {
    const formData = new FormData()

    formData.append("postId", item.postId)
    formData.append("content", content)
    formData.append("hashtags", tags)
    if (data.upload) {
      data.upload.forEach((file) => {
        formData.append('files', file.originFileObj);
      });
    }
    
    axiox.post("/api/v1/post/update", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    .then(res => {
      const data = res.data
      if (res.status == 200 && data.data) {
        onClose()
        message.success("編輯貼文成功")
      } else {
        message.success("編輯貼文失敗")
      }
    })
    .catch(e => {
      console.log(e)
      message.error("編輯貼文失敗")
    })
    .finally(() => {
      setUlock(false)
      setFileList([])
      form.setFieldsValue({
        upload: []
      });
      setS3Progress(0)
    })
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    onClose()
    setInputVisible(false)
    setFileList([])
    form.setFieldsValue({
      content: '',
      upload: []
    });
    setS3Progress(0)
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

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

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

  useEffect(() => {
    if (open && item) {
      form.setFieldsValue({
        content: content,
      });
    }
  }, [item, open, form]);

  // const onFinish = (values) => {
  //   console.log('Submitted tags:', tags);
  // };

  return (
    <Modal
      title="編輯貼文"
      centered
      open={open}
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
            onChange={handleContentChange} 
            value={content}
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
                style={{ marginBottom: '4px', fontSize: 16, display: 'flex', alignItems: 'center' }}
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
        {s3Progress > 0 && (
          <Progress percent={s3Progress} />
        )}
      </Form>
    </Modal>
  )
}

export default PostEditor