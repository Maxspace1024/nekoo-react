import React, { useRef, useState, useEffect } from 'react';

const DanmakuPlayer = () => {
  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);
  const fullscreenBtnRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9); // Default to 16:9

  useEffect(() => {
    const video = videoRef.current;
    const updateAspectRatio = () => {
      if (video.videoWidth && video.videoHeight) {
        setAspectRatio(video.videoWidth / video.videoHeight);
      }
    };

    video.addEventListener('loadedmetadata', updateAspectRatio);
    return () => video.removeEventListener('loadedmetadata', updateAspectRatio);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if (videoContainerRef.current.mozRequestFullScreen) {
        videoContainerRef.current.mozRequestFullScreen();
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        videoContainerRef.current.webkitRequestFullscreen();
      } else if (videoContainerRef.current.msRequestFullscreen) {
        videoContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  return (
    <div
      ref={videoContainerRef}
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <div style={{
        position: 'relative',
        paddingTop: `${(1 / aspectRatio) * 100}%`,
        backgroundColor: '#000000',
        borderRadius: 8,
        overflow: 'hidden'
        
      }}>
        <video 
          ref={videoRef}
          id="video" 
          controls 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            maxHeight: '600px',
            objectFit: 'contain',
          }}
        >
          {/* <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" /> */}
          <source src={`/elephant.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '10px',
          zIndex: 10
        }}>
          This is an overlay
        </div>
      </div>
      <button 
        ref={fullscreenBtnRef} 
        onClick={handleFullscreen}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          zIndex: 10
        }}
      >
        Fullscreen
      </button>
    </div>
  );
};

export default DanmakuPlayer;