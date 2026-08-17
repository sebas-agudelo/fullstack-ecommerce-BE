import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import { invalid_credentials } from "../../utils/ApiError.js";
const supabase = supabase_config();

export const verifySession = async (req, res, next) => {
    const token = req?.cookies?.cookie_key;

    try {
        if (!token) {
            req.user = null;
            return next()
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (!data || error) {
            req.user = null;
           return next()
        }

        req.user = data?.user;
        next()

    } catch (error) {
        req.user = null;
        next(error)
    }
}