import stripe from 'stripe';
const stripePay = stripe(process.env.STRIPE_SECRET_KEY);

import { supabase_config } from "../../../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

import { NotFound, supabaseError } from '../../../utils/ApiError.js';
import { clearGuestSession } from '../../../helpers/checkout/clearGuestSession.js';
import { clearAuthUserCart } from '../../../helpers/checkout/clearAuthUserCart.js';

export const verifyPaymentController = async (req, res, next) => {
    const { payment_intent } = req.params;
    const guest_id = req?.signedCookies?.cookie_key || null;
    const user_id = req?.user?.id || null;

    try {
        if (!guest_id && !user_id) {
            throw new NotFound("Din session har löpt ut eller kunde inte hittas. Vänligen logga in eller ladda om sidan för att slutföra köpet.")
        }

        const orderOwner = user_id
            ? { user_id: user_id }
            : { guest_id: guest_id }

        const paymentIntent = await stripePay.paymentIntents.retrieve(payment_intent);

        // console.log("Payment verify: ",paymentIntent);

        const match = { ...orderOwner };

        if (paymentIntent?.id) {
            match.payment_intent_id = paymentIntent.id;
        }

        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, payment_intent_id, payment_status, order_number')

            .match(match)
            .single()

        console.log("Orders: ", orders);


        if (!orders || ordersError) {
            throw new supabaseError({
                step: "VERIFY_ORDER",
                originalError: ordersError
            })
        }

        if (paymentIntent?.status !== "succeeded") {
            return res
                .status(200)
                .json({ payment_status: "processing", order_id: orders?.order_number })
        }

        if (orders?.payment_status !== "paid" && paymentIntent.status === "succeeded") {
            await supabase
                .from('orders')
                .update({
                    payment_status: "paid"
                })
                .match({
                    ...orderOwner,
                    payment_intent_id: paymentIntent?.id
                })

            clearGuestSession(res, guest_id)

            const clearCart = await clearAuthUserCart(user_id)
            if (clearCart?.error) {
                throw new supabaseError({
                    step: "VERIFY_DELETE_CART",
                    originalError: clearCart?.error
                })
            }

            return res
                .status(200)
                .json({ payment_status: "paid", order_id: orders?.order_number })
        }

        if (orders?.payment_status === "paid" && paymentIntent.status === "succeeded") {
            clearGuestSession(res, guest_id)

            const clearCart = await clearAuthUserCart(user_id)
            if (clearCart?.error) {
                throw new supabaseError({
                    step: "VERIFY_DELETE_CART",
                    originalError: clearCart?.error
                })
            }

            return res
                .status(200)
                .json({ payment_status: "paid", order_id: orders?.order_number })
        }

    } catch (error) {
        if (error?.rawType) {
            throw new supabaseError({
                step: "VERiFY_PAYMENT",
                originalError: error
            })
        }

        next(error)
    }
}