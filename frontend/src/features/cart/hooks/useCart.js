import { addItem, getCart, incrementCartItem, decrementCartItem, removeCartItem, createCartOrder, verifyCartOrder } from "../service/cart.api.js"
import { useDispatch } from "react-redux"
import { setCart } from "../state/cart.slice"

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({productId,variantId}){
        const data = await addItem({productId,variantId})
        await handleGetCart()
        return data
    }

    async function handleGetCart(){
        const data = await getCart()
        dispatch(setCart(data.cart))
    }

    async function handleIncrementCartItem({productId,variantId}){
        await incrementCartItem({productId, variantId})
        await handleGetCart()
    }

    async function handleDecrementCartItem({productId,variantId}){
        await decrementCartItem({productId, variantId})
        await handleGetCart()
    }

    async function handleRemoveCartItem({productId,variantId}){
        await removeCartItem({productId, variantId})
        await handleGetCart()
    }

    async function handleCreateCartOrder(){
        try {
            const data = await createCartOrder()
            if (!data || !data.order) {
                throw new Error("Invalid order response from server");
            }
            return data.order
        } catch (error) {
            console.error("Create order error:", error);
            throw error;
        }
    }

    async function handleVerifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature}){
        try {
            const data = await verifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature})
            if (!data) {
                throw new Error("Invalid verification response from server");
            }
            return data.success
        } catch (error) {
            console.error("Verify order error:", error);
            throw error;
        }
    }

    return { handleAddItem, handleGetCart, handleIncrementCartItem, handleDecrementCartItem, handleRemoveCartItem, handleCreateCartOrder, handleVerifyCartOrder }
}