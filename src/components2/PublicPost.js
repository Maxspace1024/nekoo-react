import React, {useState, useEffect, useRef} from 'react'
import UploadPost from "./UploadPost"
import xtyle from "./CommonStyle"
import { useAuth } from "../context/AuthContext"
import Post from '../components2/Post'

import stompClient from '../StompClient'
import axiox from '../axiox'

function PublicPost() {
  const {auth, setAuth, isLoginValid, isWsConnected, setIsWsConnected} = useAuth()
  const [posts, setPosts] = useState([])

  const postScrollRef = useRef(null)
  const [postScrollLock, setPostScrollLock] = useState(false)
  const [postScrollPage, setPostScrollPage] = useState(0)

  useEffect(() => {
    // 貼文
    stompClient.subscribe(`/topic/post/new`, (msgPost) => {
      setPosts(prev => [msgPost, ...prev])
    })
    stompClient.subscribe(`/topic/post/delete`, (msgPost) => {
      setPosts(prev => 
        prev.filter( p => p.postId !== msgPost.postId)
      )
    })
    stompClient.subscribe(`/topic/post/update`, (msgPost) => {
      setPosts(prev => 
        prev.map( p => p.postId === msgPost.postId ? msgPost : p)
      )
    })

    return () => {
      stompClient.unsubscribe(`/topic/post/new`)
      stompClient.unsubscribe(`/topic/post/delete`)
    }
  }, [isWsConnected])

  const fetchPostPage = () => {
    axiox.post("/api/v1/postPage",
      {
        page: postScrollPage
      }
    ).then(response => {
      const data = response.data
      const success = data.success
      if (data.data != null) {      
        const {page, totalPages} = data.data
        if (success && postScrollPage < totalPages) {
          setPosts(prev => [...prev, ...page])
        }
        if (page.length !== 0) {
          setPostScrollLock(false)
        }
      }
    })
    .catch(e => console.error(e))
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
    fetchPostPage()
  }, [postScrollPage])



  if (!isLoginValid) {
    return <></>
  }
  return (
    <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', height: '100%'}}>
      <div 
        ref={postScrollRef} 
        style={{ 
          width: '100%', 
          maxWidth: '800px',
          height: '100%', 
          overflowY: 'scroll',
          padding: '0px 16px',
          ...xtyle.hideScrollbar
        }}
        onScroll={handlePostScroll}
      >
        <UploadPost />
        {posts.map(post => (
          <Post key={`post-${post.postId}`} item={post}/>
        ))}
      </div>
    </div>
  )
}

export default PublicPost