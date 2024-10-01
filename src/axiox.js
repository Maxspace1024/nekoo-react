import axios from 'axios';

const axiox = axios.create({
	baseURL: 'http://localhost:8080',
	// baseURL: 'https://nekoo.xyz',
	timeout: 10000, 
	headers: {
		'Content-Type': 'application/json',
	},
	// withCredentials: true
});

export default axiox;
