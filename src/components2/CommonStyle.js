const xtyle = {
  wrapBreak: {
    flexWrap: 'wrap', wordBreak: 'break-word', overflowWrap: 'break-word',textWrap: 'wrap'
  },
  cardStyle: {
    borderRadius: 8,
    boxShadow: '1px 1px 8px lightgray'
  },

  // header
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: 'steelblue',
    height: 64,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  textLogo: { 
    color: 'white', 
    fontSize: '28px', 
    fontWeight: 'bold', 
    marginRight: '20px'
  },
  navmenu:{ 
    display: 'flex', 
    justifyContent: 'end', 
    alignItems: 'center',
    height: '100%',
    border: 'none', 
    backgroundColor: 'transparent',
    width: 600
  },
  menuLabel: {
    fontSize: '20px',
    // fontWeight: 'bold',
    color: 'white'
  },
  menuItem: {
    fontSize: '28px', 
    color:'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
    
  },
  menuSearch: { 
    borderRadius: '32px', 
    overflow: 'hidden', 
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 240
  },
  menuCountLabel: {
    position: 'absolute',
    top: 12,
    right: -8,
    backgroundColor: 'red',
    color: 'white',
    fontWeight: 'bolder',
    borderRadius: '50%',
    padding: '4px',
    width: '20px', // 固定寬度讓其呈現圓形
    height: '20px', // 固定高度也設為圓形
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
  }, 
  
  // content
  content: { 
    display: 'flex', 
    flexDirection: 'column', 
    height: 'calc(100vh - 64px)', 
    backgroundColor: '#e5e7f0' 
  },
  contentCenter: { 
    flexGrow: 1, 
    display: 'flex', 
    justifyContent: 'center', 
    overflowY: 'auto',
  },

  sider: { 
    backgroundColor: '#fff',
    boxShadow: '-1px 0 3px rgba(0,0,0,0.1)',
    height: 'calc(100vh - 64px)',
    overflow: 'auto',
  },

  hideScrollbar: {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },

  // UploadPost
  uploadPostContent: {
    display: 'flex',
    justifyContent: 'start',
    borderRadius: 8,
    backgroundColor: 'steelblue',
    padding: '16px',
    boxShadow: '1px 1px 8px lightgray',
    margin: '16px 0px', 
    userSelect: 'none'
  },
  uploadPostHintInput: { 
    display: 'flex', 
    justifyContent:'start', 
    alignItems:'center', 
    margin: '0 16px', 
    padding: '0 16px',
    backgroundColor: 'lightsteelblue',
    fontSize: 20,
    borderRadius: 32,
    border: '1px solid cornflowerblue',
    width: '90%'
  },

  // post
  postToolbarIcon: {
    fontSize: 20
  },

  // login & signup
  accountInputDiv: { 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 64px)', 
  },
  accountInputCard: { 
    width: 300, 
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' 
  },

  // xearch
  xearchPage: {
    display: 'flex', 
    justifyContent:'center', 
    flexDirection: 'row', 
    gap: 16, 
    padding: 16, 
    height: 'calc(100vh - 64px)'
  },
  xearchCol: {
    display: 'flex', 
    justifyContent:'start', 
    flexDirection: 'column',
    flex: 1 , 
    gap: 8, 
    padding: 8,
    height: 'auto', 
    overflowY: 'scroll',
  },
  xearchTopLable: {
    borderRadius: 8, 
    backgroundColor: 'steelblue' ,
    boxShadow: '1px 1px 8px lightgray', 
    color: 'white', 
    textAlign: 'center'
  },

  // profile
  profileLabel : { 
    fontSize: 20 
  }, 
  profileText : {
    fontSize: 20 
  }
}

export default xtyle