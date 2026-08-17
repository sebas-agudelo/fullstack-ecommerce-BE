import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import { supabaseError } from "../../utils/ApiError.js";
const supabase = supabase_config()

export const SignOut = async (req, res, next) => {
    try {
        const { error } = await supabase.auth.signOut()

        res.clearCookie("cookie_key", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return res
            .status(200)
            .json({ msg: "Du är utloggad" })

    } catch (error) {
        return next(new supabaseError({
            step: "SIGN_OUT",
            originalError: error
        }));
    }
}