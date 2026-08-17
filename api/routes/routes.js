import express from 'express';
import { checkUserSession, authMiddleware, updateUserData, addUserInfo } from '../controllers/auth/authService.js'
import { validate } from '../middlewares/zodMiddleware.js';
import { CheckoutCustomerSchema, PreparePaymentData, signUser } from '../zod/customerSchema.js';
import { getCustomerData } from '../controllers/auth/getCustomerData.controller.js';
import { getCart } from '../controllers/cart/getCart.js';
import { signInController } from '../controllers/auth/signIn.controller.js';
import { verifySession } from '../middlewares/auth/verifySession.js';
import { addCartItemController } from '../controllers/cart/addCartItem.controller.js';
import { updateCartQtyController } from '../controllers/cart/updateCartQty.controller.js';
import { verifyPaymentController } from '../controllers/checkout/stripe/verifyPayment.controller.js';
import { SignOut } from '../controllers/auth/signOut.controller.js';
import { createGuestController } from '../controllers/checkout/guest/createGuest.controller.js';
import { createOrderController } from '../controllers/checkout/order/createOrder.controller.js';
import { preparePaymentController } from '../controllers/checkout/stripe/preparePayment.controller.js';
import { getOrderDetailsController } from '../controllers/checkout/stripe/getOrderDetails.controller.js';


export const routes = express.Router();

/* ALL AUTH ROUTES */
routes.post('/api/auth/signin', validate(signUser), signInController);
routes.post('/api/auth/signout', SignOut);


routes.get('/api/auth/session', checkUserSession);
routes.put('/auth/user/update', authMiddleware, updateUserData);
routes.post('/auth/user/add-info', authMiddleware, addUserInfo);


routes.get('/api/cart', verifySession, getCart);
routes.post('/api/cart/items', verifySession, addCartItemController);
routes.put('/api/cart/qty', verifySession, updateCartQtyController);


// CHECKOUT ROUTES
routes.post('/api/checkout/guest', validate(CheckoutCustomerSchema), createGuestController);
routes.post('/api/checkout/payment', validate(PreparePaymentData), verifySession, preparePaymentController);
routes.post('/api/checkout/create-order', verifySession, createOrderController);
routes.get('/api/checkout/order/:order_number', authMiddleware, getOrderDetailsController)
routes.get('/api/customer', authMiddleware, getCustomerData);
routes.get('/api/payment/status/:payment_intent', authMiddleware, verifyPaymentController);


