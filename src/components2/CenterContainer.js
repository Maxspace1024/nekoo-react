import xtyle from "./CommonStyle"

function CenterContainer({children}) {
  return (
    <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', marginTop: 16}}>
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '800px',
          height: '100%', 
          // overflowY: 'scroll',
          padding: '0px 16px',
          ...xtyle.hideScrollbar
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default CenterContainer