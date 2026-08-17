import { supabase_config } from "../../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

export const findProductById = async (product_id) => {
    let { data, error } = await supabase
        .from("products_duplicate")
        .select("id, title, price")
        .eq("id", product_id)
        .single()

    return { data, error }
}

export const findCartItem = async (user_id, product) => {
    let { data, error } = await supabase
        .from('shopping_cart_duplicate')
        .select('id, product_title, unit_price, total_price, quantity, product_id')
        .eq("user_id", user_id)
        .eq('product_id', product?.id)
        .maybeSingle()

    return { data, error }
}

export const updateCartQuantity = async (user_id, existingData, quantity) => {
    let { data, error } = await supabase
        .from('shopping_cart_duplicate')
        .update({
            quantity: quantity,
            total_price: existingData.unit_price * quantity
        })
        .eq("user_id", user_id)
        .eq('product_id', existingData?.product_id)

    return { data, error }
}