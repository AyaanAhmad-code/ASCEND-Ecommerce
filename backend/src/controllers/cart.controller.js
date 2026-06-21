import mongoose from "mongoose";
import { stockOfVariant } from "../dao/product.dao.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import paymentModel from "../models/payment.model.js";
import { createOrder } from "../services/payment.service.js";
import { getCartDetails } from "../dao/cart.dao.js";
import { config } from "../config/config.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";

export const addToCart = async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity = 1 } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product or variant not found",
      success: false,
    });
  }

  const stock = await stockOfVariant(productId, variantId);

  const cart =
    (await cartModel.findOne({ user: req.user._id })) ||
    (await cartModel.create({ user: req.user._id }));

  const isProductAlreadyInCart = cart.items.some(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.toString() === variantId,
  );

  if (isProductAlreadyInCart) {
    const quantityInCart = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    ).quantity;
    if (quantityInCart + quantity > stock) {
      return res.status(400).json({
        message: `Only ${stock} items left in stock. and you already have ${quantityInCart} items in your cart`,
        success: false,
      });
    }
    await cartModel.findOneAndUpdate(
      {
        user: req.user._id,
        "items.product": productId,
        "items.variant": variantId,
      },
      { $inc: { "items.$.quantity": quantity } },
      { new: true },
    );
    return res.status(200).json({
      message: "Cart updated successfully",
      success: true,
    });
  }

  if (quantity > stock) {
    return res.status(400).json({
      message: `only ${stock} items left in stock`,
      success: false,
    });
  }

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: product.price,
  });

  await cart.save();

  return res.status(200).json({
    message: "Product added to cart successfully",
    success: true,
  });
};

export const getCart = async (req, res) => {
  const user = req.user;

  let cart = await getCartDetails(user._id);

  if (!cart) {
    cart = await cartModel.create({ user: user._id });
  }

  return res.status(200).json({
    message: "Cart fetched successfully",
    success: true,
    cart,
  });
};

export const incrementCartItemQuantity = async (req, res) => {
  const { productId, variantId } = req.params;

  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product or variant not found",
      success: false,
    });
  }

  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      message: " cart not found",
      success: false,
    });
  }

  const stock = await stockOfVariant(productId, variantId);

  const itemQuantityInCart =
    cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    )?.quantity || 0;

  if (itemQuantityInCart + 1 > stock) {
    return res.status(400).json({
      message: `Only ${stock} items left in stock. and you already have ${itemQuantityInCart} items in your cart`,
      success: false,
    });
  }

  await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "items.product": productId,
      "items.variant": variantId,
    },
    { $inc: { "items.$.quantity": 1 } },
    { new: true },
  );

  return res.status(200).json({
    message: "Cart item quantity incremented successfully",
    success: true,
  });
};

export const decrementCartItemQuantity = async (req, res) => {
  const { productId, variantId } = req.params;

  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product or variant not found",
      success: false,
    });
  }

  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      message: " cart not found",
      success: false,
    });
  }

  const itemInCart =
    cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    )?.quantity || 0;

  if (itemInCart - 1 < 1) {
    return res.status(400).json({
      message: "Quantity cannot be less than 1",
      success: false,
    });
  }

  await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "items.product": productId,
      "items.variant": variantId,
    },
    { $inc: { "items.$.quantity": -1 } },
    { new: true },
  );

  return res.status(200).json({
    message: "Cart item quantity decremented successfully",
    success: true,
  });
};

export const removeCartItem = async (req, res) => {
  const { productId, variantId } = req.params;

  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      message: " cart not found",
      success: false,
    });
  }

  await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { items: { product: productId, variant: variantId } } },
    { new: true },
  );

  return res.status(200).json({
    message: "Cart item removed successfully",
    success: true,
  });
};

export const createOrderController = async (req, res) => {
  try {
    const cart = await getCartDetails(req.user._id);

    if (!cart || !cart.items || cart.items.length === 0) {
      console.log("Cart not found or empty for user:", req.user._id);
      return res.status(404).json({
        message: "Cart not found or is empty",
        success: false,
      });
    }

    const order = await createOrder({
      amount: cart.totalPrice,
      currency: cart.currency,
    });

    const payment = await paymentModel.create({
      user: req.user._id,
      razorpay: {
        orderId: order.id,
      },
      price: {
        amount: cart.totalPrice,
        currency: cart.currency,
      },
      orderItems: cart.items.map(item => ({
        title: item.product.title,
        productId: item.product._id,
        variantId: item.variant,
        quantity: item.quantity,
        images: item.product.variants.images || item.product.images,
        description: item.product.description,
        price: {
          amount: item.product.variants.price.amount || item.product.price.amount,
          currency: item.product.variants.price.currency || item.product.price.currency,
        }
      }))
    });

    return res.status(200).json({
      message: "Order created successfully",
      success: true,
      order,
      key: config.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      message: "Error creating order: " + error.message,
      success: false,
    });
  }

}

export const verifyPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await paymentModel.findOne({
      "razorpay.orderId": razorpay_order_id,
      user: req.user._id,
      status: "pending"
    });

    if (!payment) {
      console.log("Payment record not found for order:", razorpay_order_id);
      return res.status(404).json({
        message: "Payment not found",
        success: false,
      });
    }

    const isPaymentValid = validatePaymentVerification({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    }, razorpay_signature, config.RAZORPAY_KEY_SECRET);

    if (!isPaymentValid) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({
        message: "Payment verification failed",
        success: false,
      });
    }

    payment.status = "paid";
    payment.razorpay.paymentId = razorpay_payment_id;
    payment.razorpay.signature = razorpay_signature;
    
    await payment.save();

    await cartModel.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true },
    );

    return res.status(200).json({
      message: "Payment verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      message: "Error verifying payment: " + error.message,
      success: false,
    });
  }
}
