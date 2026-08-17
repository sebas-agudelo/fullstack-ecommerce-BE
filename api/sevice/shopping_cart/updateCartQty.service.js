import { findCartItem, findProductById, updateCartQuantity } from "../../repository/shopping_cart/cart.repository.js";
import { supabaseError } from "../../utils/ApiError.js";

import { supabase_config } from "../../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

export const updateCartQtyService = async (user_id, product_id, quantity) => {
  let newQty = quantity;
  
  try {

    const { data: product, error: productError } = await findProductById(product_id);

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

    newQty = existingData.quantity + newQty
    if (newQty <= 0) {
      let { error: deleteError } = await supabase
        .from('shopping_cart_duplicate')
        .delete()
        .eq("user_id", user_id)
        .eq('product_id', existingData.product_id)

      if (deleteError) {
        throw new supabaseError(
          {
            step: "DELETE_CART_PRODUCT",
            originalError: deleteError
          }
        )
      }

      return { action: "deleted" }
    }
    else {

      const { data: update, error: updateError } = await updateCartQuantity(user_id, existingData, newQty);

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
    }

  } catch (error) {
    throw error
  }
}