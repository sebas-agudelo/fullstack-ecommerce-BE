import { findCartItem, findProductById, updateCartQuantity } from "../../repository/shopping_cart/cart.repository.js";
import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import { supabaseError } from "../../utils/ApiError.js";
const supabase = supabase_config();

export const addCartItemService = async (user_id, product_id, quantity) => {
    try {
        const { data: product, error: productError } = await findProductById(product_id)

        if (productError) {
            throw new supabaseError(
                {
                    step: "FETCH_PRODUCT_FOR_CART",
                    originalError: productError
                }
            )
        }

        const { data: existingData, error: existingError } = await findCartItem(user_id, product)

        if (existingError) {
            throw new supabaseError(
                {
                    step: "FETCH_EXINTING_CART",
                    originalError: existingError
                }
            )
        }

        if (existingData) {
            quantity = existingData.quantity + quantity

            const { data: update, error: updateError } = await updateCartQuantity(user_id, existingData, quantity)

            if (updateError) {
                throw new supabaseError(
                    {
                        step: "UPDATE_CART_PRODUCT",
                        originalError: updateError
                    }
                )
            }

            return {
                action: "updated",
                update
            }

        } else {
            let { data: insert, error: insertError } = await supabase
                .from('shopping_cart_duplicate')
                .insert({
                    product_title: product.title,
                    unit_price: product.price,
                    total_price: product.price,
                    quantity: quantity,
                    product_id: product_id,
                    user_id: user_id
                })

            if (insertError) {
                throw new supabaseError(
                    {
                        step: "INSERT_CART_PRODUCT",
                        originalError: insertError
                    }
                )
            }

            return {
                action: "insert",
                insert
            }
        }

    } catch (error) {
        throw error
    }
}