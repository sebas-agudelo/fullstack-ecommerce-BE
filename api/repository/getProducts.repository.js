import { supabase_config } from "../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

export const getProductsRepository = async (product_ids) => {
    let { data, error } = await supabase
        .from('products_duplicate')
        .select('id, price, title, brand')
        .in('id', product_ids)

    return { data, error }
}