import { combineReducers } from 'redux'
import theme from './slices/themeSlice'
import auth from './slices/authSlice'
import ecommerce from './slices/ProductSlice'
import variants from './slices/VariantCartesianSlice'

const rootReducer = (asyncReducers) => (state, action) => {
    const combinedReducer = combineReducers({
        theme,
        auth,
        ecommerce,
        variants,
        ...asyncReducers,
    })
    return combinedReducer(state, action)
}
  
export default rootReducer
