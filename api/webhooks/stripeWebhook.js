import stripe from "stripe";

import { supabase_config } from "../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

const endpointSecret = 'whsec_1fe94d4dc2fcaa30c31839dba3c9cd8d3fd0ad5c0d1c65d4a82bfec1a7445e5e';

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const body = req.body;

    let event = null;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        res.status(400).end();
        return;
    }

    let intent = null;

    switch (event['type']) {
        case 'payment_intent.succeeded':
            intent = event.data.object;
            console.log("Succeeded:", intent.id);
            // const orderIdFromStripe = intent.metadata.order_id;
            const payment_intent_id = intent.id;
            await supabase
                .from('orders')
                .update({
                    payment_status: "paid"
                })
                .eq('payment_intent_id', payment_intent_id)

            break;
        case 'payment_intent.payment_failed':
            intent = event.data.object;
            const message = intent.last_payment_error && intent.last_payment_error.message;
            console.log('Failed:', intent.id, message);
            break;
    }

    res.sendStatus(200);
}