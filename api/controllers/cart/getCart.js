import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import { supabaseError, invalid_credentials } from "../../utils/ApiError.js";
const supabase = supabase_config();

export const getCart = async (req, res, next) => {
    const user_id = req?.user?.id;

    try {
        if (!user_id) {
            throw new invalid_credentials("Inloggning krävs")
        }

        let { data, error } = await supabase
            .from('shopping_cart_duplicate')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })

        if (error) {
            throw new supabaseError({
                step: "GET_CART",
                originalError: error
            })
        }

        if (data.length === 0) {
            return res
                .status(200)
                .json({ data: [], items: 0 })
        }

        const cartDetails = data.reduce((acc, item) => {
            acc.totalPrice += Number(item.total_price);
            acc.items += Number(item.quantity);
            acc.tax += Number(item.total_price) * 0.25;
            return acc;

        }, { totalPrice: 0, items: 0, tax: 0 });

        return res
            .status(200)
            .json({ data: data, total_price: cartDetails.totalPrice, items: cartDetails.items, tax: cartDetails.tax });
    } catch (error) {
        next(error)
    }
};