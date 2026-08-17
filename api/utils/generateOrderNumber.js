import crypto from "crypto";

export const generateOrderNumber = () => {
    const orderNumber = crypto.randomInt(1000000000, 10000000000).toString();

    return orderNumber;
}