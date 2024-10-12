import React from 'react';
import { Modal, Form, ColorPicker, Select, Space } from 'antd';

const { Option } = Select;

function DanmakuEditor({open, onClose, onSetProperties}) {
  const [form] = Form.useForm();

  const handleCancel = () => {
    let props = form.getFieldsValue()
    const color = props.color
    const bgColor = props.backgroundColor
    if (typeof(color) !== "string") {
      props.color = color.metaColor.toHexString()
    }
    if (typeof(bgColor) !== "string") {
      props.backgroundColor = bgColor.metaColor.toHexString()
    }
    onSetProperties(props)
    onClose()
  };

  return (
    <Modal
        title="設定樣式"
        footer={null}
        centered
        open={open}
        onCancel={handleCancel}
      >
      <Form 
        form={form}
        layout="vertical" 
        name="form_in_modal"
        initialValues={{
          color: '#000000', // 設定初始字體顏色
          backgroundColor: '#FFFFFF', // 設定初始背景顏色
          size: 1 // 設定初始字體大小
        }}
        >
          <Space >
            <Form.Item
              label='字體顏色'
              name="color"
              >
              <ColorPicker />
            </Form.Item>
            <Form.Item
              label='背景顏色'
              name="backgroundColor"
              >
              <ColorPicker/>
            </Form.Item>
            <Form.Item
              label='字體大小'
              name="size"
              >
              <Select>
                <Option value={0}>小</Option>
                <Option value={1}>中</Option>
                <Option value={2}>大</Option>
              </Select>
            </Form.Item>
          </Space>
      </Form>
    </Modal>
  )
}

export default DanmakuEditor