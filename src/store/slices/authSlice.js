import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from 'services/MongoService';

// Helper function: Check token expiration
const isTokenValid = () => {
	const token = localStorage.getItem('AUTH_TOKEN');
	const expiresAt = localStorage.getItem('TOKEN_EXPIRES_AT');
	if (token && expiresAt && new Date().getTime() < parseInt(expiresAt, 10)) {
		return token;
	}
	// Remove expired token if found
	localStorage.removeItem('AUTH_TOKEN');
	localStorage.removeItem('TOKEN_EXPIRES_AT');
	return null;
};

export const initialState = {
	loading: false,
	message: '',
	showMessage: false,
	redirect: '',
	token: isTokenValid(),
};

// Sign-in action (using MongoDB API for login)
export const signIn = createAsyncThunk('auth/signIn', async (data, { rejectWithValue }) => {
	const { email, password } = data;
	try {
		const response = await api.post('/api/auth/login', { email, password });
		if (response.data) {
			const token = response.data.token;
			// Set token expiration time (1 hour from now)
			const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
			localStorage.setItem('AUTH_TOKEN', token);
			localStorage.setItem('TOKEN_EXPIRES_AT', expiresAt.toString());
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
	try {
		const response = await api.post('/api/auth/register', { email, password });
		if (response.data) {
			const token = response.data.token;
			// Set token expiration time (1 hour from now)
			const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
			localStorage.setItem('AUTH_TOKEN', token);
			localStorage.setItem('TOKEN_EXPIRES_AT', expiresAt.toString());
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
		// Remove token and expiration before API call
		localStorage.removeItem('AUTH_TOKEN');
		localStorage.removeItem('TOKEN_EXPIRES_AT');
		const response = await api.post('/api/auth/signOut', { token });
		return response.data;
	} catch (error) {
		return rejectWithValue(error.message || 'Error signing out');
	}
});

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

// ------------------------------
// Automatic Token Expiration Check
// ------------------------------
const checkTokenExpiration = () => {
	const expiresAt = localStorage.getItem('TOKEN_EXPIRES_AT');
	if (expiresAt && new Date().getTime() > parseInt(expiresAt, 10)) {
		localStorage.removeItem('AUTH_TOKEN');
		localStorage.removeItem('TOKEN_EXPIRES_AT');
		// Optional: reload the page to update app state
		window.location.reload();
	}
};

// Check token expiration every minute
setInterval(checkTokenExpiration, 60 * 60 * 1000);
