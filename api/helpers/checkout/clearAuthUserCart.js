import { supabase_config } from "../../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

export const clearAuthUserCart = async (user_id) => {
    if (user_id) {
        let { error } = await supabase
            .from("shopping_cart_duplicate")
            .delete()
            .eq("user_id", user_id);

        return {error}
    }
}