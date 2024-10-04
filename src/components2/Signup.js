import React, {useState} from 'react';
import { Form, Input, Button, Card, message, } from 'antd';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axiox from '../axiox';
import xtyle from './CommonStyle';

const Signup = ({onCancel}) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

	const handleSignup = (data) => {
    axiox.post("/api/v1/user/signup", data)
    .then(res => {
      console.log(res)
      const data = res.data
      if (data.success) {
        message.success("註冊成功")
        navigate("/login")
      } else {
        setErrorMessage(data.error)
        message.error("註冊失敗")
      }
    })
    .catch(e => {console.error(e)})
  };

  const handleLogin = () => {
    navigate("/login")
  }

  const handleInputChange = () => {
		if (errorMessage) {
			setErrorMessage("");
		}
	};

  return (
    <div style={xtyle.accountInputDiv}>
      <Card
        title="註冊"
        style={xtyle.accountInputCard}
      >
        <Form
          name="signup"
          onFinish={handleSignup}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: '請輸入使用者名稱' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              onChange={handleInputChange}
            />
          </Form.Item>

          <Form.Item
						name="email"
						rules={[
              { required: true, message: '請輸入email' },
              { type: 'email', message: '請輸入有效的email' },
            ]}
					>
						<Input
							prefix={<UserOutlined />}
							placeholder="Email"
              onChange={handleInputChange}
						/>
					</Form.Item>

					<Form.Item
						name="password"
						rules={[{ required: true, message: '請輸入密碼' }]}
					>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              onChange={handleInputChange}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block onClick={handleSignup}>註冊</Button>
            <Button type="link" htmlType="submit" block onClick={handleLogin}>登入</Button>
            <p style={{margin: 0, minHeight: "20px", color: "red", textAlign: "center" }}>{errorMessage}</p>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
