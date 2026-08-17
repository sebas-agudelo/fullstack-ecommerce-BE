import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import { supabaseError, NotFound } from "../../utils/ApiError.js";
const supabase = supabase_config();

export const calculateCartTotals = async (items) => {
    try {
        const product_ids = items.map(i => i.product_id);
 
        let { data: products, error: productsError } = await supabase
            .from('products_duplicate')
            .select('id, price, title, brand')
            .in('id', product_ids)

        if (productsError) {
            throw new supabaseError({
                step: "SELECT_PRODUCTS",
                originalError: productsError
            })
        }

        if (products.length === 0) {
            throw new NotFound()
        }

        const priceMap = new Map(
            products.map(p => [p.id, p])
        )

        const allProducts = items.map((element) => {
            const product = priceMap.get(element.product_id);
   
            return {
                product_id: element.product_id,
                product_title: product.title,
                product_brand: product.brand,
                price: product.price,
                quantity: element.quantity,
                sub_amount: product.price * element.quantity
            }
        })

        const totalPrice = allProducts.reduce((sum, item) => {
            const totalAmount = sum + item.price * item.quantity
            return totalAmount;
        }, 0)

        return {
            products: allProducts,
            total: totalPrice
        }

    } catch (error) {
        throw error
    }
}
