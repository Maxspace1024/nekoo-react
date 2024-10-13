import React, {useState} from "react"
import { Carousel } from "antd";
import carouselData from "./CarouselCats"
import './Home.css'

const Home = () => {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showComments, setShowComments] = useState(true);

  const handleSlideChange = (current) => {
    setShowComments(false); // 隱藏彈幕，準備切換到下一張
    setCurrentSlide(current);
    setTimeout(() => setShowComments(true), 100); // 300ms後顯示彈幕，製造動畫效果
  };

  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 64px)',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        height: 400,
        width: 800,
        backgroundColor: 'lightsteelblue',
        borderRadius: '16px'
      }}/>
      <div
        style={{
          width:800
        }}
      >
        <Carousel
          afterChange={handleSlideChange}
          autoplay
          autoplaySpeed={3000}
          dots
          effect="fade"
          infinite
        >
          {carouselData.map((image, index) => (
            <div key={index}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img 
                  src={`/assets/${image.id}.png`} 
                  alt={`Cat ${index + 1}`} 
                  width={200} 
                  style={{
                    alignSelf: 'center'
                  }}
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>
      <div style={{
        position: 'absolute',
        height: 400,
        width: 800,
      }}>
        { showComments &&
         carouselData[currentSlide].dmks.map((dmk, index) => 
          <span
            key={`dmk-${currentSlide}-${index}`}
            style={{
              position: 'absolute',
              padding: '8px 16px',
              borderRadius: '40px',
              fontWeight: 'bolder',
              boxShadow: '1px 1px 8px gray',

              top: `${ 10 + Math.random() * 70}%`,
              left: `${ Math.random() > 0.5 ? 10 + Math.random() * 20 : 60 + Math.random() * 20 }%`,
              fontSize: `${14 + dmk.size * 2}px`,
              color: `${dmk.color}`,
              backgroundColor: `${dmk.backgroundColor}aa`,
              transform: 'scale(0)',
              animation: `bounce 1s ease-in-out forwards`,
              animationDelay: `${0.1 + Math.random()* 1.5}s`
            }}
          >{dmk.content}</span>
         ) 
        }
      </div>
  </div>
  )
}

export default Home