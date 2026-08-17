
import { updateCartQtyService } from "../../sevice/shopping_cart/updateCartQty.service.js";
import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import { invalid_credentials } from "../../utils/ApiError.js";
const supabase = supabase_config()

export const updateCartQtyController = async (req, res, next) => {
  const { product_id, quantity } = req.body;
  const user_id = req?.user?.id;

  try {
    if (!user_id) {
      throw new invalid_credentials("Inloggning krävs.")
    }

    const updateService = await updateCartQtyService(user_id, product_id, quantity)

    if (updateService?.action === "updated") {
      return res
        .status(200)
        .json({ success: true, msg: "Produkten uppdateras" })

    }
    if (updateService?.action === "deleted") {
      return res
        .status(200)
        .json({ success: true, msg: "Produkten har tagits bort" })

    }

  } catch (error) {
    console.error(error.message);
    next(error)
  }
};