import { Spin } from "antd";

function CenterSpin() {
  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',height: 80}}>
      <Spin></Spin>
    </div>
  )
}

export default CenterSpin