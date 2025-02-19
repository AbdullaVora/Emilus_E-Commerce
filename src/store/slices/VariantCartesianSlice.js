import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from 'services/MongoService';

const initialState = {
    loading: false,
    variants: [],
    parents: [],
    error: null,
}

export const addVariants = createAsyncThunk('ecommerce/add-variants', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/ecommerce/add-variants', data);
        return response;
    } catch (error) {
        return rejectWithValue(error.message || "Error creating variant cartesian");
    }
})

export const fetchVariants = createAsyncThunk('ecommerce/fetch-variants', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('api/ecommerce/get-variants');
        console.log(response.data);

        return response.data;
    } catch (error) {
        return rejectWithValue(error.message || "Error fetching variants")
    }
})

export const updateVariants = createAsyncThunk(
    'ecommerce/update-variants',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            console.log(data);

            // Corrected API call
            const response = await api.put(`api/ecommerce/update-variants/${id}`, data);

            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || "Error updating variants");
        }
    });

export const deleteVariant = createAsyncThunk('ecommerce/delete-variant', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(`api/ecommerce/delete-variant/${id}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Error deleting variant');
    }
})

export const addParents = createAsyncThunk('ecommerce/add-parents', async (data,{rejectWithValue}) => {
    try {
        const response = await api.post('api/ecommerce/add-parents', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Error adding parents')
    }
})

// Example Redux slice
const variantSlice = createSlice({
    name: 'variants',
    initialState: {
        variants: [],
        loading: false,
    },
    reducers: {
        // Your reducers here
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVariants.fulfilled, (state, action) => {
                state.variants = action.payload;
                state.loading = false;
            })
            .addCase(updateVariants.fulfilled, (state, action) => {
                const updatedVariant = action.payload;
                state.variants = state.variants.map(variant =>
                    variant._id === updatedVariant._id ? updatedVariant : variant
                );
            })
            .addCase(deleteVariant.fulfilled, (state, action) => {
                state.variants = state.variants.filter(v => v._id !== action.payload);
            })
            .addCase(addParents.fulfilled, (state, action) => {
                state.parents.push(action.payload);
            })
    },
});

export default variantSlice.reducer
