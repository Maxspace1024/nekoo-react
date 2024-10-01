import React, {useState} from 'react';
import { Form, Input, Button, Card, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axiox from '../axiox';
import Signup from './Signup';

const Login = () => {
	const [errorMessage, setErrorMessage] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false)

	const onHandleLogin = (data) => {
		axiox.post("/api/v1/user/signin", data)
			.then(res => {
				const isSuccess = res.data.success
				const data = res.data.data
				if (isSuccess) {
					localStorage.setItem("jwt", data.jwt)
					localStorage.setItem("userId", data.userId)
					localStorage.setItem("userName", data.userName)
					localStorage.setItem("userAvatarPath", data.userAvatarPath)
					localStorage.setItem("email", data.email)
					window.location.href = "/"
				} else {
					setErrorMessage(res.data.error)
				}
			})
			.catch(e => {console.error(e)})
	};

	const onHandleSignup = () => {
		setIsModalOpen(true)
	}

	const handleInputChange = () => {
		if (errorMessage) {
			setErrorMessage("");
		}
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)', }}>
			<Card
				title="登入"
				style={{ width: 300, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
			>
				<Form
					name="login"
					onFinish={onHandleLogin}
				>
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
						<Button type="primary" htmlType="submit" block>
							登入
						</Button>
						<Button type="link" block onClick={onHandleSignup}>
							註冊
						</Button>
						{/* <Button type="link" block>
							忘記密碼?
						</Button> */}
						<p style={{margin: 0, minHeight: "20px", color: "red", textAlign: "center" }}>{errorMessage}</p>
					</Form.Item>
				</Form>
			</Card>
			<Modal
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				centered
			>
				<Signup onCancel={() => setIsModalOpen(false)}/>
			</Modal>
		</div>
	);
};

export default Login;
