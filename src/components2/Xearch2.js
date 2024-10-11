import React, {useEffect, useRef, useState} from 'react'
import { useLocation } from "react-router-dom";
import { List, Space, Tabs } from "antd";
import UserFriend from './UserFriend';

import { useAuth } from '../context/AuthContext';
import { useFriendship } from '../context/FriendshipContext';

import axiox from '../axiox';
import { FileTextOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';
import Post from './Post';
import CenterSpin from './CenterSpin';
import { usePost } from '../context/PostContext';

function UserTab() {
  const {auth, setAuth} = useAuth()
  const {searchFriendships, setSearchFriendships} = useFriendship()

  return (
    <> 
    { searchFriendships &&
      <List
        itemLayout="horizontal"
        dataSource={searchFriendships}
        style={{backgroundColor: "white", padding: '0 24px', borderRadius: 8}}
        renderItem={item => (
          <UserFriend item={item} userId={auth.userId}/>
        )}
      />
    }
    </>
  )
}

function FriendTab() {
  const {auth, setAuth} = useAuth()
  const {searchFriendships, setSearchFriendships} = useFriendship()

  return (
    <> 
    { searchFriendships &&
      <List
        itemLayout="horizontal"
        dataSource={searchFriendships}
        style={{backgroundColor: "white", padding: '0 24px', borderRadius: 8}}
        renderItem={item => (
          <UserFriend item={item} userId={auth.userId}/>
        )}
      />
    }
    </>
  )
}

function PostTab({items, loading}) {
  return (
    <>
      { items.map(post => (
        <Post key={`post-${post.postId}`} item={post}/>
      ))}
      { !loading && items.length === 0 &&
        <h1 style={{textAlign: 'center'}}>未找到貼文</h1>
      }
      { loading && 
        <CenterSpin />
      }
    </>
  )
}

function TagTab({items, loading}) {
  return (
    <>
      { items.map(post => (
        <Post key={`post-${post.postId}`} item={post}/>
      ))}
      { !loading && items.length === 0 &&
        <h1 style={{textAlign: 'center'}}>未找到貼文</h1>
      }
      { loading && 
        <CenterSpin />
      }
    </>
  )
}

const { TabPane } = Tabs;

function Xearch2() {
  const {auth, setAuth} = useAuth()
  const {searchFriendships, setSearchFriendships} = useFriendship()
  const {postScrollTop, setPostScrollTop} = usePost()
  const location = useLocation();
  const [query, setQuery] = useState("")
  const [queryAt, setQueryAt] = useState("")
  const [activeTabKey, setActiveTabKey] = useState("1");

  const [posts, setPosts] = useState([])
  const scrollRef = useRef(null)
  const [loadingPost, setLoadingPost] = useState(false)
  const [scrollLock, setScrollLock] = useState(false)
  const [scrollPage, setScrollPage] = useState(0)

  const fetchDataForTab = (q, qAt, tabKey) => {
    setLoadingPost(true)
    if (tabKey === "1") {
      // console.log("用戶分頁被選中");
      axiox.post(`/api/v1/friendship/searchNotMyFriends`, {
          searchName: q
        })
        .then(res => {
          const data = res.data
          if (res.status === 200 && data.data) {
            setSearchFriendships(data.data)
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setScrollLock(false)
          setLoadingPost(false)
        });
    } else if (tabKey === "2") {
      // console.log("朋友分頁被選中");
      axiox.post(`/api/v1/friendship/searchMyFriends`, {
          searchName: q
        })
        .then(res => {
          const data = res.data
          if (res.status === 200 && data.data) {
            setSearchFriendships(data.data)
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setScrollLock(false)
          setLoadingPost(false)
        });
    } else if (tabKey === "3") {
      // console.log("貼文分頁被選中");
      axiox.post(`/api/v1/post/searchContent`, {
        page: scrollPage,
        query: q,
        queryAt: qAt
      })
      .then(res => {
        const data = res.data
        if (res.status === 200 && data.data) {
          const {page, totalPages} = data.data
          if (page.length > 0) {
            setPosts(prev => [...prev, ...page])
            setScrollLock(false)
          }
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoadingPost(false)
      });
    } else if (tabKey === "4") {
      // console.log("標籤分頁被選中");
      axiox.post(`/api/v1/post/searchTag`, {
        page: scrollPage,
        query: q,
        queryAt: qAt
      })
      .then(res => {
        const data = res.data
        if (res.status === 200 && data.data) {
          const {page, totalPages} = data.data
          if (page.length > 0) {
            setPosts(prev => [...prev, ...page])
            setScrollLock(false)
          }
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoadingPost(false)
      });
    }
  };

  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  const handlePostScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setPostScrollTop(scrollTop)
    if (scrollTop + clientHeight + 20 >= scrollHeight && scrollLock === false) {
      setScrollLock(true)
      setScrollPage(prev => prev + 1)
    }
  }

  useEffect(() => {
    setPostScrollTop(0)
  }, [setPostScrollTop])

  useEffect(() => {
    console.log('tab change')
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    const now = new Date().toISOString()

    setScrollLock(false)
    setScrollPage(0)
    setPosts([])

    setQuery(q)
    setQueryAt(now)
  }, [location.search, activeTabKey])

  useEffect(() => {
    if (posts.length === 0) {
      fetchDataForTab(query, queryAt, activeTabKey)
    }
  }, [posts])

  useEffect(() => {
    if (scrollPage > 0 && (activeTabKey === "3" || activeTabKey === "4")) {
      fetchDataForTab(query, queryAt, activeTabKey)
    }
  }, [scrollPage])

  return (
    <div
      ref={scrollRef} 
      style={{ 
        flexGrow: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        height: '100%',
        overflowY: 'scroll',
        // ...xtyle.hideScrollbar
      }}
      onScroll={handlePostScroll}
    >
      <Space 
        direction='vertical' 
        style={{
          width: '100%', 
          maxWidth: '800px',
          height: '100%', 
          padding: '0px 16px',
        }}
      >
        <Tabs defaultActiveKey="1" onChange={handleTabChange}>
          <TabPane tab={<div><UserOutlined style={{marginRight: 8}}/>用戶</div>} key="1">
            <UserTab />
          </TabPane>
          <TabPane tab={<div><UserOutlined style={{marginRight: 8}}/>朋友</div>} key="2">
            <UserTab />
          </TabPane>
          <TabPane tab={<div><FileTextOutlined style={{marginRight: 8}}/>貼文(公開)</div>} key="3">
            <PostTab items={posts} loading={loadingPost}/>
          </TabPane>
          <TabPane tab={<div><TagOutlined style={{marginRight: 8}}/>標籤(公開)</div>} key="4">
            <TagTab items={posts} loading={loadingPost}/>
          </TabPane>
        </Tabs>
      </Space>
    </div>
  )
}

export default Xearch2