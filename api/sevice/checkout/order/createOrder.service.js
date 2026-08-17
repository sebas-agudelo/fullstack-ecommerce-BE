import { supabase_config } from "../../../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

import stripe from "stripe";
const stripePay = stripe(process.env.STRIPE_SECRET_KEY);

import { validatePaymentIntent } from "../../../utils/stripe/validatePaymentIntent.js";
import { generateOrderNumber } from "../../../utils/generateOrderNumber.js";

import { createOrderRepository } from "../../../repository/checkout/createOrder.repository.js";
import { createOrderItemsRepository } from "../../../repository/checkout/createOrder.repository.js";
import { Payment_validation, supabaseError } from "../../../utils/ApiError.js";
import { calculateAmountService } from "../stripe/calculateAmount.service.js";
import { findCustomerService } from "../../findCustomer.service.js";

export const createOrderServive = async (orderOwner, items, payment_id, customer_id) => {
    try {
        const calculateResult = await calculateAmountService(items);

        const paymentIntent = await stripePay.paymentIntents.retrieve(
            payment_id
        );

        console.log("payment_id create order: ", payment_id);

        const match = { ...orderOwner };

        if (paymentIntent?.id) {
            match.payment_intent_id = paymentIntent.id;
        }

        let { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, payment_intent_id, payment_status, order_number')
            .match(match)
            .single()


        if (orders) {
            return { order: orders };
        }

        const validateResult = validatePaymentIntent(paymentIntent, calculateResult.totalAmount, customer_id)

        if (!validateResult.ok) {
            throw new Payment_validation(validateResult?.msg)
        };

        const orderNumber = generateOrderNumber();

        const customerData = await findCustomerService(orderOwner)

        const createOrder = await createOrderRepository(
            orderOwner,
            calculateResult.totalAmount,
            customerData,
            paymentIntent,
            orderNumber
        );

        if (!createOrder.data || createOrder.error) {
            throw new supabaseError({
                step: "CHECKOUT_CREATE_ORDER",
                originalError: createOrder.error
            });
        }

        console.log("Created order: ", createOrder);


        // const createOrderItems = await createOrderItemsRepository(
        //     createOrder.data,
        //     calculateResult.products
        // )

        // if (!createOrderItems.data ||
        //     createOrderItems.data.length === 0 ||
        //     createOrderItems.error) {
        //     await supabase
        //         .from("orders")
        //         .delete()
        //         .eq("id", createOrder.data?.id);

        //     throw new supabaseError({
        //         step: "CHECKOUT_CREATE_ORDER_ITEMS",
        //         originalError: createOrderItems.error
        //     });
        // }

        return {
            order: createOrder,
            // orderItems: createOrderItems.data.length
        }

    } catch (error) {
        if (error?.rawType) {
            throw new supabaseError({
                step: "CHECKOUT_CREATE_ORDER_STRIPE",
                originalError: error
            })
        }

        throw error
    }
}