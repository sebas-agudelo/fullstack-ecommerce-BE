import { createGuestService } from "../../../sevice/checkout/guest/createGuest.service.js";

export const createGuestController = async (req, res, next) => {
    const {
        phone,
        address,
        postal_code,
        email,
        fullname } = req.body

    const guest_id = req?.signedCookies?.cookie_key || null;

    try {
        const order = await createGuestService(
            email,
            fullname,
            phone,
            address,
            postal_code,
            guest_id
        );

        const response = res.status(201);

        if (order.newGuestId) {
            response.cookie("cookie_key", order.newGuestId, {
                httpOnly: true,
                secure: true,
                signed: true,
                sameSite: "none",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            })
        }

        return response.json({
            customer: order.newGuest
        })

    } catch (error) {
        next(error)
    }
}