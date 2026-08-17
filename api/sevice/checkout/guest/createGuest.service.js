import { supabase_config } from "../../../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

import { supabaseError } from "../../../utils/ApiError.js";

export const createGuestService = async (
    email,
    fullname,
    phone,
    address,
    postal_code,
    guest_id,
) => {
    let newGuestId = null;
    let newGuest = null;

    try {
        if (!guest_id) {
            let { data, error } = await supabase
                .from("guest")
                .insert([
                    {
                        phone: phone,
                        address: address,
                        postal_code: postal_code,
                        email: email,
                        fullname: fullname
                    },
                ])
                .select()
                .single();

            if (error || !data) {
                throw new supabaseError({
                    step: "CHECKOUT_CREATE_GUEST",
                    originalError: error
                }
                )
            }

            newGuestId = data?.id;
            newGuest = data;
        }

        return {
            newGuestId: newGuestId,
            newGuest: newGuest,
        }

    } catch (error) {
        throw error
    }
}
