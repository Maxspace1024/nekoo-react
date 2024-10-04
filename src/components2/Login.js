import React, {useState, useEffect} from 'react';
import { Form, Input, Button, Card, Modal, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from "../context/AuthContext";
import axiox from '../axiox';
import { useNavigate } from 'react-router-dom';
import xtyle from './CommonStyle';

const Login = () => {
	const navigate = useNavigate();
	const { auth, setAuth } = useAuth();
	const [errorMessage, setErrorMessage] = useState("");

	const onHandleLogin = (data) => {
		axiox.post("/api/v1/user/signin", data)
			.then(res => {
				const isSuccess = res.data.success
				const data = res.data.data
				if (isSuccess) {
					localStorage.setItem("jwt", data.jwt)
					setAuth(data)
					message.success("登入成功")
					window.location.href = "/publicPost"
				} else {
					setErrorMessage(res.data.error)
					message.error("登入失敗")
				}
			})
			.catch(e => {
				console.error(e)
				message.error("登入失敗，伺服器異常")
			})
	};

	const onHandleSignup = () => {
		navigate("/signup")
	}

	const handleInputChange = () => {
		if (errorMessage) {
			setErrorMessage("");
		}
	};

	return (
		<div style={xtyle.accountInputDiv}>
			<Card
				title="登入"
				style={xtyle.accountInputCard}
			>
				<Form
					name="login"
					onFinish={onHandleLogin}
				>
					<Form.Item
						name="email"
						rules={[
							{ required: true, message: '請輸入email' },
							{ type: 'email', message: '請輸入有效的email' },
						]}
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
						<p style={{margin: 0, minHeight: "20px", color: "red", textAlign: "center" }}>{errorMessage}</p>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default Login;
