import React, {useState, useEffect, useRef} from 'react';
import { Button, Modal, Form, Avatar, Input, Upload, Tag } from 'antd';
import { PlusCircleOutlined , UploadOutlined} from '@ant-design/icons';
import axiox from '../axiox';

const UploadPost = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

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
    formData.append("privacy", 0)
    data.upload.forEach((file) => {
      formData.append('files', file.originFileObj);
    });
    
    axiox.post("/api/v1/post", formData, {
      headers: {
        // "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
        'Content-Type': 'multipart/form-data',
      }
    })
    .then(res => {
      // if (res.data.success) {
        setIsModalVisible(false);
      // }
    })
    .catch(e => {console.error(e)})
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    setTags([])
    setInputValue(false)
    setInputValue('')
    setFileList([])
    console.log('Modal cancelled');
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
            <Input.TextArea placeholder='寫下什麼吧' style={{height: 240}}/>
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
              multiple
              required
              >
              <Button icon={<UploadOutlined />}>上傳</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: 'lightsteelblue',
        padding: 16,
        boxShadow: '1px 1px 8px lightgray',
        margin: '16px 0px'}}
        onClick={showModal}
        >
        <Avatar icon={<PlusCircleOutlined />} size={32}/>
      </div>
    </>
  )
}

export default UploadPost