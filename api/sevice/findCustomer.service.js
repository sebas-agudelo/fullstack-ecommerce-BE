import { supabase_config } from "../supabase_config/supabase_conlig.js";
const supabase = supabase_config();

import { supabaseError } from "../utils/ApiError.js";

export const findCustomerService = async (orderOwner) => {
    let customerData = null;

    if (orderOwner?.guest_id || orderOwner?.user_id) {
        const { data: guest, error: guestError } = await supabase
            .from('guest')
            .select(`*`)
            .eq('id', orderOwner?.guest_id)
            .single()

        const { data: user, error: userError } = await supabase
            .from('users_info')
            .select(`*`)
            .eq('user_id', orderOwner?.user_id)
            .single()

        if ((orderOwner?.guest_id && (!guest || guestError)) ||
            (orderOwner?.user_id && (!user || userError))) {
            throw new supabaseError({
                step: "CHECKOUT_GET_ORDER_OWNER",
                originalError: guestError || userError
            });
        };

        customerData = {
            id: user?.user_id || guest?.id,
            email: user?.email || guest?.email,
            phone: user?.phone || guest?.phone,
            fullname: user?.name || guest?.fullname,
            address: user?.address || guest?.address,
            postal_code: user?.postal_code || guest?.postal_code,
        }
    }

    return customerData
}