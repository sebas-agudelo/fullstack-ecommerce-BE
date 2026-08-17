import { supabase_config } from "../../../supabase_config/supabase_conlig.js";
import { supabaseError } from "../../../utils/ApiError.js";
const supabase = supabase_config();

export const getOrderDetailsController = async (req, res, next) => {
    const { order_number } = req.params;

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('email, total_amount')
            .match({
                payment_status: "paid",
                order_number: order_number
            })
            .single()

        if (error) {
            throw new supabaseError({
                step: "PAID_ORDER_DETAILS",
                originalError: error
            })
        }

        return res
            .status(200)
            .json({
                email: data?.email,
                total_amount: data?.total_amount
            })

    } catch (error) {
        next(error)
    }
}