import { useEffect, useState } from "react"
import Post from "./Post"
import { useParams } from "react-router-dom"

import axiox from "../axiox"
import CenterSpin from "./CenterSpin"
import CenterContainer from "./CenterContainer"

function SinglePost() {
  const {postId} = useParams()
  const [loading, setLoading] = useState(false)
  const [post, setPost] = useState(null)

  useEffect(() => {
    setLoading(true)
    axiox.get(`/api/v1/post/${postId}`)
    .then(res => {
      const data = res.data
      if (res.status == 200 && data.data) {
        setPost(data.data)
      } else {
      }
    })
    .catch(e => {
      console.log(e)
    })
    .finally(() => {
      setLoading(false)
    })
  }, [])

  return (
    <CenterContainer>
      { loading &&
        <CenterSpin />
      }
      { post &&
        <Post item={post}/>
      }
    </CenterContainer>
  )
}

export default SinglePost