import { z } from 'zod';
export const CheckoutCustomerSchema = z.object({
    phone: z
        .string()
        .trim()
        .refine(v => v.length > 0, {
            message: "Telefonnummer krävs"
        })
        .min(10, "Telefonnumret är för kort")
        .max(12, "Telefonnumret är för långt"),

    address: z
        .string()
        .trim()
        .min(1, "Adress krävs"),

    postal_code: z
        .string()
        .trim()
        .min(5, "Postnummer krävs"),

    email: z
        .string()
        .trim()
        .min(1, "E-post krävs")
        .email("Ogiltig e-postadress"),

    fullname: z
        .string()
        .trim()
        .min(1, "För & efternamn krävs")
});

export const PreparePaymentData = z.object({
    email: z.string().trim().min(1, "E-post krävs").email("Ogiltig e-postadress"),
    fullname: z.string().trim().min(1, "För & efternamn krävs"),
    phone: z
        .string()
        .trim()
        .refine(v => v.length > 0, {
            message: "Telefonnummer krävs"
        })
        .min(10, "Telefonnumret är för kort")
        .max(12, "Telefonnumret är för långt"),

    items: z.array(z.any())
})

export const signUser = z.object({
    email: z.string().trim().min(1, "E-post krävs"),
    password: z.string().trim().min(1, "Lösenord krävs")
})