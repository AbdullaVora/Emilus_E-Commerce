import { createAsyncThunk } from "@reduxjs/toolkit";

export const addToken = createAsyncThunk('/auth/token', async (addToken, { rejectWithValue }) => {
    try {

    } catch (error) {
        return rejectWithValue(error.message);
    }
})

