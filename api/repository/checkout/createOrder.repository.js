import { supabase_config } from "../../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

export const createOrderRepository = async (
    orderOwner,
    totalAmount,
    blablaResult,
    paymentIntent,
    orderNumber
) => {
    let { data, error } = await supabase
        .from('orders')
        .insert({
            ...orderOwner,
            total_amount: totalAmount,
            payment_status: "pending",
            email: blablaResult?.email,
            payment_intent_id: paymentIntent?.id,
            order_number: orderNumber
        })
        .select()
        .single()

    return { data, error }
}

export const createOrderItemsRepository = async (
    order,
    products
) => {
    let { data, error } = await supabase
        .from('items_order_duplicate')
        .insert(
            products.map((product) => {
                return {
                    order_id: order?.id,
                    product_id: product.product_id,
                    quantity: product.quantity,
                    unit_price: product.price,
                    total_amount: product.sub_amount,
                    product_title: product.product_title,
                }
            })
        )
        .select()

    return { data, error }
}
