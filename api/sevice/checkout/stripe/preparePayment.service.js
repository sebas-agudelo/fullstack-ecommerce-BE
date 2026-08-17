import stripe from "stripe";
const stripePay = stripe(process.env.STRIPE_SECRET_KEY);

import { supabase_config } from "../../../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

import { supabaseError } from "../../../utils/ApiError.js";
import { calculateAmountService } from "./calculateAmount.service.js";
import { findCustomerService } from "../../findCustomer.service.js";

export const preparePaymentService = async (
    items,
    orderOwner
) => {
    try {
        const calculateResult = await calculateAmountService(items);

        const customerData = await findCustomerService(orderOwner)

        const customer = await stripePay.customers.create({
            name: customerData.fullname,
            email: customerData.email,
            phone: customerData.phone
        });

        const description = calculateResult.products
            .map((item) => {
                return `
            ${item.title}, 
            Pris: ${item.price}
            `;
            })
            .join("; ");

        console.log("Descripcion: ", description);

        const paymentIntent = await stripePay.paymentIntents.create({
            amount: calculateResult.totalAmount * 100,
            currency: "sek",
            customer: customer.id,
            payment_method_types: ["card"],
            description: description,

        });

        return {
            clientSecret: paymentIntent.client_secret,
            payment_id: paymentIntent.id,
            customer_id: customer.id
        }

    } catch (error) {
        if (error?.rawType) {
            throw new supabaseError({
                step: "CHECKOUT_CREATE_PAYMENT_INTENT",
                originalError: error
            })
        }

        throw error
    }
}