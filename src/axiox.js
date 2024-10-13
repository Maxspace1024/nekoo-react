import {HOST} from './BaseConfig';
import axios from 'axios';

const axiox = axios.create({
	baseURL: HOST,
	timeout: 10000 * 12, 
	headers: {
		'Content-Type': 'application/json',
	},
});

export default axiox;
