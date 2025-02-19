import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { AUTH_TOKEN } from 'constants/AuthConstant';
import api from 'services/MongoService';

export const initialState = {
	loading: false,
	message: '',
	showMessage: false,
	redirect: '',
	token: localStorage.getItem('AUTH_TOKEN') || null,
};

// Sign-in action (using MongoDB API for login)
export const signIn = createAsyncThunk('auth/signIn', async (data, { rejectWithValue }) => {
	const { email, password } = data;
	console.log(data);
	try {
		const response = await api.post('/api/auth/login', { email, password });

		console.log(response);
		if (response.data) {
			const token = response.data.token;  // Use the first element if the array exists
			localStorage.setItem('AUTH_TOKEN', token);
			return token;
		} else {
			return rejectWithValue("Invalid email/password");
		}
	} catch (err) {
		return rejectWithValue('Invalid email/password');
	}
});

// Sign-up action (using MongoDB API for registration)
export const signUp = createAsyncThunk('auth/signUp', async (data, { rejectWithValue }) => {
	const { email, password } = data;
	console.log(data);

	try {
		const response = await api.post('/api/auth/register', { email, password });  // MongoDB API register

		console.log(response.data);
		if (response.data) {
			const token = response.data.token;  // Adjust according to your MongoDB API response
			localStorage.setItem('AUTH_TOKEN', token);
			return token;
		} else {
			return rejectWithValue(response.message || 'Registration failed');
		}
	} catch (err) {
		return rejectWithValue(err.message || 'Error signing up');
	}
});

// Sign-out action (removes the token from localStorage)
export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('AUTH_TOKEN');
		if (!token) return { message: "No token found" };

		// Remove token from localStorage BEFORE API call
		localStorage.removeItem('AUTH_TOKEN');

		const response = await api.post('/api/auth/signOut', { token }); // Fix: Send as an object

		return response.data;
	} catch (error) {
		return rejectWithValue(error.message || 'Error signing out');
	}
});

// export const addToken = createAsyncThunk('/auth/token', async (addToken, { rejectWithValue }) => {
// 	try {
// 		const response = fetch(`${api}/${endpoint}`)
// 	} catch (error) {
// 		return rejectWithValue(error.message);
// 	}
// })



// Reducer slice for authentication logic
export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		authenticated: (state, action) => {
			state.loading = false;
			state.redirect = '/';
			state.token = action.payload;
		},
		showAuthMessage: (state, action) => {
			state.message = action.payload;
			state.showMessage = true;
			state.loading = false;
		},
		hideAuthMessage: (state) => {
			state.message = '';
			state.showMessage = false;
		},
		signOutSuccess: (state) => {
			state.loading = false;
			state.token = null;
			state.redirect = '/';
		},
		showLoading: (state) => {
			state.loading = true;
		},
		signInSuccess: (state, action) => {
			state.loading = false;
			state.token = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(signIn.pending, (state) => {
				state.loading = true;
			})
			.addCase(signIn.fulfilled, (state, action) => {
				state.loading = false;
				state.redirect = '/';
				state.token = action.payload;
			})
			.addCase(signIn.rejected, (state, action) => {
				state.message = action.payload;
				state.showMessage = true;
				state.loading = false;
			})
			.addCase(signOut.fulfilled, (state) => {
				state.loading = false;
				state.token = null;
				state.redirect = '/';
			})
			.addCase(signOut.rejected, (state) => {
				state.loading = false;
				state.token = null;
				state.redirect = '/';
			})
			.addCase(signUp.pending, (state) => {
				state.loading = true;
			})
			.addCase(signUp.fulfilled, (state, action) => {
				state.loading = false;
				state.redirect = '/';
				state.token = action.payload;
			})
			.addCase(signUp.rejected, (state, action) => {
				state.message = action.payload;
				state.showMessage = true;
				state.loading = false;
			});
	},
});

export const {
	authenticated,
	showAuthMessage,
	hideAuthMessage,
	signOutSuccess,
	showLoading,
	signInSuccess
} = authSlice.actions;

export default authSlice.reducer;
