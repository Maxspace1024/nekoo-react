import React, {useState, useEffect, useRef} from 'react';
import { Button, Modal, Form, Avatar, Input, Upload, Spin, Image, message} from 'antd';
import { PlusOutlined , UploadOutlined, EditOutlined, UserOutlined, InboxOutlined, LockOutlined, GlobalOutlined} from '@ant-design/icons';
import xtyle from "./CommonStyle"

import axiox from '../axiox';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { S3HOST } from '../BaseConfig';

function NecoEditor({open, onClose, onUpdateSuccess}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const handleOk = () => {
    form.submit()
  };

  const onFormFinish = (data) => {
    const formData = new FormData()
    if (data.birthday) {
      formData.append("birthday", new Date(data.birthday).toISOString())
    }
    formData.append("content", data.content)
    formData.append("gender", data.gender)
    formData.append("userName", data.userName )
    formData.append("location", data.locatioin)
    if (data.upload) {
      data.upload.forEach((file) => {
        formData.append('image', file.originFileObj);
      });
    }

    axiox.post("/api/v1/user/profile", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    .then(res => {
      const data = res.data
      if (res.status == 200 && data.data) {
        message.success("編輯資料成功")
        onUpdateSuccess(data.data)
        onClose()
      } else {
        message.success("編輯資料失敗")
      }
    })
    .catch(e => {
      console.log(e)
      message.error("編輯資料失敗")
    })
  }

  const handleCancel = () => {
    onClose()
    setFileList([])
  };

  // uploadFile
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };


  return (
    <Modal
        title="編輯個人簡介"
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
            label="姓名"
            name="userName"
            rules={[{ required: true, message: '必填' }]}
          >
            <Input
              placeholder='編輯姓名'/>
          </Form.Item>
          <Form.Item
            label="生日"
            name="birthday"
          >
            <Input type={'date'} />
          </Form.Item>
          <Form.Item
            label="性別"
            name="gender"
          >
            <Input placeholder='編輯性別' />
          </Form.Item>
          <Form.Item
            label="所在地"
            name="location"
          >
            <Input placeholder='編輯所在地' />
          </Form.Item>
          <Form.Item label="簡介" name="content">
            <Input.TextArea 
              placeholder='寫下什麼吧'
              style={{...xtyle.hideScrollbar}} 
              autoSize={{ minRows: 4, maxRows: 4 }}
            />
          </Form.Item>
          <Form.Item
            name="upload"
            label="大頭照上傳"
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

function Neco() {
  const {auth, setAuth} = useAuth()
  const {userId} = useParams()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [profile, setProfile] = useState({})

  const checkIsNotBlank = (x) => {
    return !(x === null || "undefined" === x)
  }

  const handleEditorOpen = () => {setIsEditorOpen(true)}
  const handleUpdateSuccess = (data) => {
    setProfile(data)
  }

  useEffect(() => {
    if (userId) {
      axiox.get(`/api/v1/user/profile/${userId}`)
      .then(res => {
        const data = res.data
        if (res.status == 200 && data.data) {
          setProfile(data.data)
        } else {
        }
      })
      .catch(e => {
        console.log(e)
      })
    }
  }, [setAuth])

  useEffect(() => {
    axiox.post("/api/v1/user/auth")
    .then(rex => {
      const authInfo = rex.data.data
      if (JSON.stringify(authInfo) !== "{}") {
        setAuth(authInfo)
      } else {

      }
    })
    .catch(e => {
      console.error(e)
    })
  }, [profile])

  return (
    <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', height: '100%'}}>
      <div 
        // ref={postScrollRef} 
        style={{ 
          width: '100%', 
          maxWidth: '800px',
          height: '100%', 
          overflowY: 'scroll',
          padding: '0px 16px',
          ...xtyle.hideScrollbar
        }}
        // onScroll={handlePostScroll}
      >
        <div style={{
          marginTop: 16,
          display: 'flex', 
          justifyContent: 'start', 
          flexDirection: 'row', 
          borderRadius: 8, 
          padding: 32,
          // backgroundColor: '#004469',
          // color: 'lightgray',
          backgroundColor: 'lightsteelblue',
          boxShadow: '1px 1px 8px lightgray',
          position: 'relative'
        }}>          
          {checkIsNotBlank(profile.avatarPath) ? (
            <Avatar icon={<Image src={S3HOST + profile.avatarPath} />} size={256} style={{marginRight: 32, flexShrink: 0}}/>
          ) : (
            <Avatar icon={<UserOutlined />} size={256} style={{marginRight: 32, flexShrink: 0}}/>
          )}
          <div style={{
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            flexGrow: 1,
          }}>
            <div style={{
              flex: 3,
              display: 'grid', 
              gridTemplateColumns: '100px auto',  // 定義兩個欄位，左邊固定寬度，右邊自動適應
              gap: '10px 20px', // 間隔設定
              alignItems: 'center' // 垂直居中對齊
            }}>
              <div><strong style={{ fontSize: 16 }}>姓名：</strong></div><div>
                { checkIsNotBlank(profile.userName) &&
                  `${profile.userName}`
                }
                </div>              
              <div><strong style={{ fontSize: 16 }}>生日：</strong></div><div>
                { checkIsNotBlank(profile.birthday) ?
                  `${new Date(profile.birthday).toLocaleDateString()}`
                  : '無'
                }
              </div>
              <div><strong style={{ fontSize: 16 }}>性別：</strong></div><div>
                { checkIsNotBlank(profile.gender) ?
                  `${profile.gender}`
                  : '無'
                }
              </div>
              <div><strong style={{ fontSize: 16 }}>所在地：</strong></div><div>
                { checkIsNotBlank(profile.location) ?
                  `${profile.locatioin}`
                  : '無'
                }
              </div>
              <div><strong style={{ fontSize: 16 }}>電子郵件：</strong></div><div>
                { checkIsNotBlank(profile.email) ?
                  `${profile.email}`
                  : '無'
                }
              </div>
            </div>
            <div style={{flex: 2}}>
              <p style={{wordBreak: 'break-word', overflowWrap: 'break-word',textWrap: 'wrap'}}>
                <strong style={{fontSize: 16}}>簡介</strong><br/>
                { checkIsNotBlank(profile.content) ?
                  `${profile.content}` 
                  : '無'
                }
              </p>
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12
          }}>
            { auth.userId === profile.userId &&
              <Button type='text' icon={<EditOutlined style={{ fontSize: '32px'}} onClick={handleEditorOpen}/>} />
            }
          </div>
        </div>
      </div>
      <NecoEditor open={isEditorOpen} onClose={() => setIsEditorOpen(false)} onUpdateSuccess={handleUpdateSuccess}/>
    </div>
  )
}

export default Neco