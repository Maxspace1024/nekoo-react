import React, {useState, useEffect, useRef} from 'react';
import { Button, Modal, Form, Avatar, Input, Upload, Spin, Image, message, Progress, List, Space} from 'antd';
import { PlusOutlined , UploadOutlined, EditOutlined, UserOutlined, InboxOutlined, LockOutlined, GlobalOutlined} from '@ant-design/icons';
import xtyle from "./CommonStyle"

import Post from './Post';
import CenterSpin from './CenterSpin';

import axiox from '../axiox';
import { useFriendship } from '../context/FriendshipContext';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { S3HOST } from '../BaseConfig';
import UserAvatar from './UserAvatar';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';

import stompClient from '../StompClient';
import { useProgress } from '../context/ProgressContext';

const checkIsNotBlank = (x) => {
  return !(x === null || "undefined" === x)
}

function NecoEditor({item, open, onClose, onUpdateSuccess}) {
  const {auth, isWsConnected} = useAuth()
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const {s3Progress, setS3Progress} = useProgress()
  const [ec2Progress, setEc2Progress] = useState(0)

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
    formData.append("location", data.location)
    if (data.upload) {
      data.upload.forEach((file) => {
        formData.append('image', file.originFileObj);
      });
    }

    axiox.post("/api/v1/user/profile", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const p = Math.round(progressEvent.progress * 100)
        setEc2Progress(p)
      },
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
    .finally(() => {
      setEc2Progress(0)
      setS3Progress(0)
    })
  }

  const handleCancel = () => {
    onClose()
    setFileList([])
    setEc2Progress(0)
      setS3Progress(0)
  };

  // uploadFile
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  useEffect(() => {
    if (open && item) {
      form.setFieldsValue({
        userName: checkIsNotBlank(item.userName) ? item.userName : '',
        birthday: item.birthday ? new Date(item.birthday).toISOString().split("T")[0] : null,
        gender: checkIsNotBlank(item.gender) ? item.gender : '',
        location: checkIsNotBlank(item.location) ? item.location : '',
        content: checkIsNotBlank(item.content) ? item.content : '',
      });
    }
  }, [item, open, form]);

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
              placeholder='編輯姓名'
            />
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
            <Input 
              placeholder='編輯性別' 
            />
          </Form.Item>
          <Form.Item
            label="所在地"
            name="location"
          >
            <Input 
              placeholder='編輯所在地'
            />
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
          {ec2Progress > 0 && (
            <Progress percent={ec2Progress} />
          )}
        </Form>
      </Modal>
  )
}

function Neco() {
  const {auth, setAuth, isLoginValid, isWsConnected, setIsWsConnected} = useAuth()
  const {userId} = useParams()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileFriendship, setProfileFriendship] = useState(null)
  const [isRecv, setIsRecv] = useState(false)

  const [posts, setPosts] = useState([])
  const [loadingPost, setLoadingPost] = useState(false)
  const postScrollRef = useRef(null)
  const [postScrollLock, setPostScrollLock] = useState(false)
  const [postScrollPage, setPostScrollPage] = useState(0)

  const handleEditorOpen = () => {setIsEditorOpen(true)}
  const handleUpdateSuccess = (data) => {
    setProfile(data)
  }

  useEffect(() => {
    if (userId) {
      setPostScrollPage(0)
      setPostScrollLock(false)
      setPosts([])

      axiox.get(`/api/v1/user/profile/${userId}`)
      .then(res => {
        const data = res.data
        if (res.status == 200 && data.data) {
          setProfile(data.data)
        }
      })
      .catch(e => {
        console.log(e)
      })

      fetchPostPage(0)
    }
  }, [userId])

  useEffect(() => {
    axiox.post("/api/v1/user/auth")
    .then(rex => {
      const authInfo = rex.data.data
      if (JSON.stringify(authInfo) !== "{}" && authInfo) {
        setAuth(authInfo)
      } else {

      }
    })
    .catch(e => {
      console.error(e)
    })
  }, [profile])

  const fetchPostPage = (pageNumber) => {
    setLoadingPost(true)
    axiox.post(`/api/v1/profilePostPage/${userId}`,
      {
        page: pageNumber
      }
    ).then(response => {
      const data = response.data
      const success = data.success
      if (success && data.data) {      
        const {page, totalPages} = data.data
        if (success && pageNumber < totalPages) {
          setPosts(prev => [...prev, ...page])
          setPostScrollLock(false)
        }
      }
    })
    .catch(e => console.error(e))
    .finally(() => {
      setLoadingPost(false)
    })
  }

  const handlePostScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = postScrollRef.current
    if (scrollTop + clientHeight + 20 >= scrollHeight && postScrollLock === false) {
      setPostScrollLock(true)
      setPostScrollPage(prev => prev + 1)
    }
  }

  // page 遞增
  useEffect(() => {
    if (postScrollPage > 0) {
      fetchPostPage(postScrollPage)
    }
  }, [postScrollPage])

  useEffect(() => {
    axiox.post("/api/v1/friendship/findFriendship",
      {
        receiverUserId: userId
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        const pf = data.data
        setProfileFriendship(pf)
        setIsRecv(pf.receiverUserId === auth.userId)
      }
    })
    .catch(e => {
      console.error(e)
    })
  }, [])


  if (!isLoginValid) {
    return <></>
  }


  function handleInvite() {
    console.log("邀請")
    axiox.post("/api/v1/friendship/invite",
      {
        senderUserId: auth.userId,          //登入的帳號
        receiverUserId: userId              //查看的profile userId
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("已送出邀請")
        const pf = data.data
        setProfileFriendship(pf)
        setIsRecv(pf.receiverUserId === auth.userId)
      } else {
        message.success("送出邀請錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("送出邀請錯誤")
    })
  }

  function handleApprove() {
    console.log("接受")
    axiox.post("/api/v1/friendship/approve",
      {
        friendshipId: profileFriendship.friendshipId,
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("已接受邀請")
        const pf = data.data
        setProfileFriendship(pf)
        setIsRecv(pf.receiverUserId === auth.userId)
      } else {
        message.success("接受邀請錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("接受邀請錯誤")
    })
  }

  function handleReject() {
    console.log("拒絕")
    axiox.post("/api/v1/friendship/reject",
      {
        friendshipId: profileFriendship.friendshipId,
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("已拒絕邀請")
        const pf = data.data
        setProfileFriendship(pf)
        setIsRecv(pf.receiverUserId === auth.userId)
      } else {
        message.success("拒絕邀請錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("拒絕邀請錯誤")
    })
  }

  function handleReinvite() {
    console.log("重送邀請")
    axiox.post("/api/v1/friendship/pending",
      {
        friendshipId: profileFriendship.friendshipId,
      }
    ).then(res => {
      const data = res.data
      if (res.status === 200 && data.data) {
        message.success("已重送邀請")
        const pf = data.data
        setProfileFriendship(pf)
        setIsRecv(pf.receiverUserId === auth.userId)
      } else {
        message.success("重送邀請錯誤")
      }
    })
    .catch(e => {
      console.error(e)
      message.success("重送邀請錯誤")
    })
  }

  // const isRecv = item.receiverUserId === userId
  // const userUserId = isRecv ? item.senderUserId : item.receiverUserId
  // const userAvatarPath = isRecv ? item.senderUserAvatarPath : item.receiverUserAvatarPath 
  // const userEmail = isRecv ? item.senderUserEmail : item.receiverUserEmail
  // const userName = isRecv ? item.senderUserName : item.receiverUserName

  return (
    <div
      ref={postScrollRef} 
      style={{ 
        flexGrow: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        height: '100%',
        overflowY: 'scroll',
        ...xtyle.hideScrollbar
      }}
      onScroll={handlePostScroll}
    >
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '800px',
          height: '100%', 
          padding: '0px 16px',
        }}
      >
        {/* profile */}
        { profile && 
          <div style={{
            marginTop: 16,
            marginBottom: 16,
            display: 'flex', 
            justifyContent: 'start', 
            flexDirection: 'row',
            ...xtyle.cardStyle, 
            padding: 32,
            // backgroundColor: '#004469',
            // color: 'lightgray',
            backgroundColor: 'lightsteelblue',
            position: 'relative'
          }}>          
            <div style={{marginRight: 32, flexShrink: 0}}>
              <UserAvatar src={profile.avatarPath} size={256} preview={true} />
            </div>
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
                {/* 姓名 */}
                <div><strong style={xtyle.profileLabel}>姓名：</strong></div>
                <div style={xtyle.profileText}>
                  { checkIsNotBlank(profile.userName) &&
                    `${profile.userName}`
                  }
                </div>
                {/* 好友狀態 */}
                { profileFriendship && auth.userId != userId &&
                  <div><strong style={xtyle.profileLabel}>好友狀態：</strong></div>
                }
                { profileFriendship && auth.userId != userId &&
                  <Space>
                    { profileFriendship.friendshipState === 0 && !isRecv &&  // pending sender
                      <Button color='solid' variant='outlined'>已送出邀請</Button>
                    }
                    { profileFriendship.friendshipState === 0 && isRecv && // pending receiver
                      <Button color='primary' variant='outlined' onClick={handleApprove}>接受</Button>
                    }
                    { profileFriendship.friendshipState === 0 && isRecv && // pending receiver
                      <Button color='danger' variant='solid' onClick={handleReject}>拒絕</Button>
                    }
                    { profileFriendship.friendshipState === 1 && // approved
                      <Button color='solid' variant='outlined'>朋友</Button>
                    }
                    { profileFriendship.friendshipState === 2 && !isRecv &&// rejected sender
                      <Button color='primary' variant='outlined' onClick={handleReinvite}>重新邀請</Button>
                    }
                    { profileFriendship.friendshipState === 2 && isRecv &&// rejected sender
                      <Button color='solid' variant='outlined'>拒絕此邀請</Button>
                    }
                    { profileFriendship.friendshipState === 3 && // none
                      <Button color='primary' variant='outlined' onClick={handleInvite}>邀請</Button>
                    }
                  </Space>   
                }
                {/* 生日 */}
                <div><strong style={xtyle.profileLabel}>生日：</strong></div>
                <div style={xtyle.profileText}>
                  { checkIsNotBlank(profile.birthday) ?
                    `${new Date(profile.birthday).toLocaleDateString()}`
                    : '無'
                  }
                </div>
                {/* 性別 */}
                <div><strong style={xtyle.profileLabel}>性別：</strong></div>
                <div style={xtyle.profileText}>
                  { checkIsNotBlank(profile.gender) ?
                    `${profile.gender}`
                    : '無'
                  }
                </div>
                {/* 所在地 */}
                <div><strong style={xtyle.profileLabel}>所在地：</strong></div>
                <div style={xtyle.profileText}>
                  { checkIsNotBlank(profile.location) ?
                    `${profile.location}`
                    : '無'
                  }
                </div>
                {/* email */}
                <div><strong style={xtyle.profileLabel}>電子郵件：</strong></div>
                <div style={xtyle.profileText}>
                  { checkIsNotBlank(profile.email) ?
                    `${profile.email}`
                    : '無'
                  }
                </div>
              </div>
              {/* 簡介 */}
              <div style={{flex: 2}}>
                <p style={{wordBreak: 'break-word', overflowWrap: 'break-word',textWrap: 'wrap'}}>
                  <strong style={xtyle.profileLabel}>簡介</strong>
                  <span style={{...xtyle.profileText, display: 'block'}}>
                    { checkIsNotBlank(profile.content) ?
                      `${profile.content}`
                      : '無'
                    }
                  </span>
                </p>
              </div>
            </div>
            <div style={{
              position: 'absolute',
              bottom: 4,
              right: 4
            }}>
              {/* 右下編輯按鈕 */}
              { profile && auth.userId === profile.userId &&
                <Button type='text' icon={<EditOutlined style={{ fontSize: '24px' }} onClick={handleEditorOpen}/>} />
              }
            </div>
          </div>
        }

        {/* post list */}
        {posts.map(post => (
          <Post key={`post-${post.postId}`} item={post}/>
        ))}
        { !loadingPost && posts.length === 0 &&
          <h1 style={{textAlign: 'center', margin: 64}}>貼文串似乎是空的...</h1>
        }
        { loadingPost && 
          <CenterSpin />
        }
      </div>
      <NecoEditor 
        item={profile} 
        open={isEditorOpen} 
        onClose={() => 
          setIsEditorOpen(false)
        }
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  )
}

export default Neco