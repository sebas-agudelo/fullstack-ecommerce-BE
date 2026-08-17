import { preparePaymentService } from "../../../sevice/checkout/stripe/preparePayment.service.js";
import { NotFound } from "../../../utils/ApiError.js";

export const preparePaymentController = async (req, res, next) => {
    const { items } = req.body;
    const user_id = req?.user?.id || null;
    const guest_id = req?.signedCookies?.cookie_key || null;

    try {
        if (!guest_id && !user_id) {
            throw new NotFound("Din session har löpt ut eller kunde inte hittas. Vänligen logga in eller ladda om sidan för att slutföra köpet.")
        }

        const orderOwner = user_id
            ? { user_id: user_id }
            : { guest_id: guest_id }

        const serivce = await preparePaymentService(
            items,
            orderOwner
        );

        console.log("Client service: ",serivce.clientSecret);
        
        return res
            .status(200)
            .json({
                clientSecret: serivce.clientSecret,
                payment_id: serivce.payment_id,
                customer_id: serivce.customer_id
            });

    } catch (error) {
        next(error)
    }
}