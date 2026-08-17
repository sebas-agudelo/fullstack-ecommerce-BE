import { signInService } from "../../sevice/auth/signIn.service.js";
import { supabase_config } from "../../supabase_config/supabase_conlig.js";
const supabase = supabase_config()

export const signInController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const {access_token} = await signInService(email, password)

    return res
    .cookie('cookie_key', access_token, {
       httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({success: true})
    
  } catch (error) {
   next(error)
  }
};