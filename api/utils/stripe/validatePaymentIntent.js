export const validatePaymentIntent = (paymentIntent, totalAmount, customer_id) => {
    if (paymentIntent.customer !== customer_id) {
        return { ok: false, msg: "Den här betalningen är inte kopplad till den angivna kunden." }
    }

    if (paymentIntent.amount / 100 !== totalAmount) {
        return { ok: false, msg: "Betalningsbeloppet stämmer inte överens med orderns totalbelopp." }
    }

    if (paymentIntent.currency !== "sek") {
        return { ok: false, msg: "Betalningen måste genomföras i svenska kronor (SEK)." }
    }

    return { ok: true }
}