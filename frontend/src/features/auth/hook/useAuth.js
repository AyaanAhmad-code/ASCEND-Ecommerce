import {setError, setLoading, setUser } from "../state/auth.slice.js";
import { register, login, getMe, updateAddress } from "../service/auth.api.js";
import { useDispatch } from "react-redux";

export const useAuth = () => {

    const dispatch = useDispatch()

    async function handleRegister({email, contact, password, fullname, isSeller = false }) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await register({email, contact, password, fullname, isSeller});
            dispatch(setUser(data.user));
            return data.user
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({email, password}){
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await login({email, password});
            dispatch(setUser(data.user));
            return data.user
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await getMe();
            dispatch(setUser(data.user));
        } catch (error) {
            dispatch(setUser(null));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleUpdateAddress(address) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await updateAddress(address);
            dispatch(setUser(data.user));
            return data.user;
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleUpdateAddress,
    }
}