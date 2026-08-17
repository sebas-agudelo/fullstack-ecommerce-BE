import { addCartItemService } from "../../sevice/shopping_cart/addCartItem.service.js";
import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import { invalid_credentials } from "../../utils/ApiError.js";
const supabase = supabase_config();

export const addCartItemController = async (req, res, next) => {
  let { product_id, quantity } = req.body;
  let user_id = req?.user?.id;

  try {
    if (!user_id) {
      throw new invalid_credentials("Inloggning krävs");
    }

    const addService = await addCartItemService(user_id, product_id, quantity);

    if (addService?.action === "updated") {
      return res
        .status(200)
        .json({ success: true, msg: "Produkt uppdaterad" })

    }

    if (addService?.action === "insert") {
      return res
        .status(200)
        .json({ success: true, msg: "Produkt tillagd" })
    }

  } catch (error) {
    console.error(error);
    next(error)
  }
};