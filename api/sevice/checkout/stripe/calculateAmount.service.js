import { getProductsRepository } from "../../../repository/getProducts.repository.js";
import { NotFound, supabaseError } from "../../../utils/ApiError.js";

export const calculateAmountService = async (items) => {
    if (items.length === 0) return 1 * 100;

    const product_ids = items.map((item) => item.product_id);
    if (product_ids.length === 0) {
        throw new NotFound("Din order saknar produkter.")
    }

    const productsResult = await getProductsRepository(product_ids);
    if (!productsResult.data ||
        productsResult.data.length === 0 ||
        productsResult.error) {
        throw new supabaseError({
            step: "CHECKOUT_GET_PRODUCTS",
            originalError: productsResult.error
        })
    };

    const productsMap = new Map(productsResult.data.map((p) => [p.id, p]))

    const totalAmount = items.reduce(
        (acc, item) => {
            const dbProducts = productsMap.get(item.product_id);

            if (!dbProducts) {
                acc.missing.push({
                    id: item.product_id,
                    title: item.product_title,
                    price: item.unit_price,
                })
                return acc
            }
            acc.total += dbProducts.price * item.quantity
            acc.products.push(dbProducts)

            return acc
        }, { total: 0, products: [], missing: [] });

    if (totalAmount.missing.length > 0) {
        const message = totalAmount.missing.map((missing) => (`${missing.title} ${missing.price} kr.`)).join(" ");
        throw new NotFound(`Vi kunde inte hitta vissa produkter som finns i din varukorg. Var vänlig och ta bort produkterna eller kontakta kundtjänst. ${message}`)
    }

    return {
        totalAmount: totalAmount.total,
        products: totalAmount.products
    };
}