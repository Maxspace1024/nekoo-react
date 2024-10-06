import React, {useState, useRef} from 'react';
import { Button, Modal, Form, Input, Upload, Tag, message} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axiox from '../axiox';
import { useAuth } from '../context/AuthContext';
import xtyle from './CommonStyle';

const {Dragger} = Upload

function PostEditor({item, open, onClose}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const [tags, setTags] = useState(item.hashtags);
  const [content, setContent] = useState(item.content)
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState(item.content);
  const inputRef = useRef(null);

  const handleOk = () => {
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
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    onClose()
    setInputVisible(false)
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

  const onFinish = (values) => {
    console.log('Submitted tags:', tags);
  };

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
          <div style={{ border: '1px solid #d9d9d9', borderRadius: '2px', padding: '4px', minHeight: '32px', display: 'flex', justifyContent:'start', alignContent: 'center' }}>
            {tags.map((tag, index) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleClose(tag)}
                style={{ marginBottom: '4px', fontSize: 16 }}
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
      </Form>
    </Modal>
  )
}

export default PostEditor