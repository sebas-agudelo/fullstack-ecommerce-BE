import { findCustomerService } from "../../sevice/findCustomer.service.js";

export const getCustomerData = async (req, res, next) => {
    const guest_id = req?.signedCookies?.cookie_key || null;
    const user_id = req?.user?.id || null;

    try {
        const customer = user_id
        ? { user_id: user_id }
        : { guest_id: guest_id }
        
        const customerData = await findCustomerService(customer);

        return res.status(200).json((customerData) && {
            email: customerData?.email,
            phone: customerData?.phone,
            fullname: customerData?.fullname,
            address: customerData?.address,
            postal_code: customerData?.postal_code
        });
        
    } catch (error) {
        next(error)
    }
}
