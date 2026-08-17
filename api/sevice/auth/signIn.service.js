import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import { invalid_credentials, supabaseError } from "../../utils/ApiError.js";
const supabase = supabase_config()

export const signInService = async (email, password) => {
  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error?.code === "validation_failed") {
      console.log("Hay un error de validacion...");
    }

    if (error?.code === "invalid_credentials") {
      console.log("Hola papi")
      throw new invalid_credentials()
    }

    const access_token = data?.session?.access_token;
    return { access_token }

  } catch (error) {
    if (!error?.type) {
      throw new supabaseError({
        step: "SIGN_IN",
        originalError: error
      })
    }

    throw error
  }
}