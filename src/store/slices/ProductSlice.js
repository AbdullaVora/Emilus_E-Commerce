import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from 'services/MongoService';

const initialState = {
    loading: false,
    data: [],
    error: null,
}

export const addProduct = createAsyncThunk('ecommerce/addProduct', async (data, { rejectWithValue }) => {
    console.log("data:", data);
    try {
        const response = await api.post('/api/ecommerce/add-product', data);

        if (response) {
            return response.data;
        } else {
            return rejectWithValue(response.message?.replace('Mongo: ', ''));
        }
    } catch (error) {
        return rejectWithValue(error.message || 'Error creating product');
    }
})

export const getProducts = createAsyncThunk('ecommerce/product-list', async (_, { rejectWithValue }) => {
    try {
        console.log("Fetching products");
        const response = await api.get('/api/ecommerce/product-list');
        console.log(response.data);

        if (response) {
            return response.data;
        } else {
            return rejectWithValue(response.message?.replace('Mongo: ', ''));
        }
    } catch (error) {
        return rejectWithValue(error.message || 'Error fetching products');
    }
})

export const updateProduct = createAsyncThunk('ecommerce/updateProduct', async (productData, { rejectWithValue }) => {
    try {
        // console.log("data:", productData);
        const response = await api.put(`/api/ecommerce/edit-product/${productData._id}`, productData);
        console.log(response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Error updating product');
    }
})

export const deleteProduct = createAsyncThunk('ecommerce/deleteProduct', async (id, { rejectWithValue }) => {
    try {
        console.log(id);

        const response = await api.delete(`/api/ecommerce/delete-product/${id}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Error deleting product');
    }
})



export const productSlice = createSlice({
    name: 'ecommerce',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addProduct.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(addProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        });
        builder.addCase(addProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(getProducts.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getProducts.fulfilled, (state, action) => {
            state.loading = false;
            console.log(action.payload);
            state.data = action.payload;
        });
        builder.addCase(updateProduct.pending, (state, action) => {
            state.loading = true;
        });
        builder.addCase(updateProduct.fulfilled, (state, action) => {
            state.loading = false;
            console.log(action.payload);
        });
        builder.addCase(updateProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(deleteProduct.pending, (state, action) => {
            state.loading = true;
        });
        builder.addCase(deleteProduct.fulfilled, (state, action) => {
            state.loading = false;
            console.log(action.payload);
        });
    }
})

export default productSlice.reducer;