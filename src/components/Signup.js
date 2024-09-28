import React, {useState} from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'
import axiox from '../axiox';

const Signup = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const onHandleLogin = () => {
    navigate("/login")
	}

	const onHandleSignup = (data) => {
    console.log('Received values of form: ', data);
    axiox.post("/api/v1/user/signup", data)
    .then(res => {
      const data = res.data
      if (data.success) {
        navigate("/login")
      } else {
        setErrorMessage(data.error)
      }
    })
    .catch(e => {console.error(e)})
  };

  const handleInputChange = () => {
		if (errorMessage) {
			setErrorMessage("");
		}
	};

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card
        title="註冊"
        style={{ width: 300, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
      >
        <Form
          name="signup"
          onFinish={onHandleSignup}
        >
          <Form.Item
            name="username"
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
						rules={[{ required: true, message: '請輸入email' }]}
					>
						<Input
							prefix={<UserOutlined />}
							placeholder="email"
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
            <Button type="primary" htmlType="submit" block onClick={onHandleSignup}>
              註冊
            </Button>
            <Button type="link" block onClick={onHandleLogin}>
              登入
            </Button>
            <p style={{margin: 0, minHeight: "20px", color: "red", textAlign: "center" }}>{errorMessage}</p>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
