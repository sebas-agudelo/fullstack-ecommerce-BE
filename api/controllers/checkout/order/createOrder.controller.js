import { createOrderServive } from "../../../sevice/checkout/order/createOrder.service.js";
import { NotFound } from "../../../utils/ApiError.js";

export const createOrderController = async (req, res, next) => {
    const { items, payment_id, customer_id } = req.body;
    const user_id = req?.user?.id || null;
    const guest_id = req?.signedCookies?.cookie_key || null;

    try {
        if (!guest_id && !user_id) {
            throw new NotFound("Din session har löpt ut eller kunde inte hittas. Vänligen logga in eller ladda om sidan för att slutföra köpet.")
        }

        const orderOwner = user_id
            ? { user_id: user_id }
            : { guest_id: guest_id }

     await createOrderServive(orderOwner, items, payment_id, customer_id);

        return res
            .status(201)
            .json({ msg: "Orden skapad"})

    } catch (error) {
        next(error)
    }
}