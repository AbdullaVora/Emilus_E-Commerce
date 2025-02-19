import fetch from 'auth/FetchInterceptor';
import { AUTH_TOKEN } from 'constants/AuthConstant';

const AuthService = {};

AuthService.login = function (data) {
	return fetch({
		url: '/auth/login',
		method: 'post',
		data: data
	}).then(response => {
		if (response.token) {
			localStorage.setItem(AUTH_TOKEN, response.token);
		} else {
			console.error('Token not found in login response:', response);
		}
		return response;
	}).catch(error => {
		console.error('Login failed:', error);
		return Promise.reject(error);
	});
};

AuthService.register = function (data) {
	return fetch({
		url: '/auth/register',
		method: 'post',
		data: data
	});
};

export default AuthService;
