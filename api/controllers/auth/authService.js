import { da } from "zod/locales";
import { supabase_config } from "../../supabase_config/supabase_conlig.js";
import validator from "validator";
const supabase = supabase_config();

// Checks if the user has an active Supabase session via cookie.
export const checkUserSession = async (req, res) => {
  const token = req?.cookies?.cookie_key;

  if (!token) {
    return res.status(200).json({ user: null });
  }

  const { data: user, error } = await supabase.auth.getUser(token);

  if (!user || error) {
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({ user: user?.user?.email });
};

// Checks if the user has a valid Supabase JWT session via cookie.
export const authMiddleware = async (req, res, next) => {
  try {
    const access_token = req.cookies.cookie_key;

    if (!access_token) {
      req.user = null;
      return next();
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();

  } catch (error) {
    req.user = null;
    next(error);
  }
  // try {
  //   const access_token = req.cookies.cookie_key;

  //   console.log("access_token",access_token);


  //   if (!access_token) {
  //     return res
  //       .status(401)
  //       .json({ error: "Du måste vara inloggad." });
  //   }
  //   const {
  //     data: { user },
  //     error,
  //   } = await supabase.auth.getUser(access_token);

  //   if (error || !user) {
  //     return res
  //       .status(401)
  //       .json({ error: "Du måste vara inloggad." });
  //   }

  //   req.user = user;

  //   next();
  // } catch (error) {
  //   // console.log("auth middleware error",error);

  //   return res
  //     .status(500)
  //     .json({ error: "Ett oväntat fel inträffade. Försök igen." });
  // }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: "Felaktig e-postadress eller lösenord. Vänligen försök igen.",
      });
    }

    const access_token = data.session?.access_token;

    if (!access_token) {
      return res.status(400).json({
        error: "Felaktig e-postadress eller lösenord. Vänligen försök igen.",
      });
    }

    return res
      .cookie("cookie_key", access_token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ successfully: "Du är inloggad" });
  } catch (error) {
    // console.log("Sign in error: ", error);
    return res
      .status(500)
      .json({ error: "Ett oväntat fel inträffade. Försök igen." });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("cookie_key", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({ successfully: "Du är utloggad" });
  } catch (error) {
    // console.error("Fel vid utloggning:", error);
    return res.status(500).json({ error: "Ett oväntat fel inträffade. Försök igen." });
  }
};

export const profile = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const userEmail = req?.user?.email;

    console.log("Profile: ", userId);

    let { data: users_info, error } = await supabase
      .from("users_info")
      .select("*")
      .eq("user_id", userId);

    if (!users_info || error) {
      return res.status(200).json({ success: [] });
    } else if (users_info) {
      return res.status(200).json({ success: "Ja Ja", users_info, userEmail });
    }
  } catch (error) {
    // console.log("profile error",error);
    return res
      .status(500)
      .json({ error: "Ett oväntat fel inträffade. Försök igen." })
  }
};

export const updateUserData = async (req, res) => {
  const { email, birthday, firstname, lastname, phone, address, postal } = req.body;
  const userID = req?.user?.id;

  if (!userID) {
    return res
      .status(401)
      .json({ error: "Du måste vara inloggad." });
  }

  // const validationError = validateCustomerData(
  //   email,
  //   firstname,
  //   lastname,
  //   birthday,
  //   phone,
  //   address,
  //   postal
  // );

  // if (validationError) {
  //   return res.status(400).json(validationError);
  // }

  try {
    const { data, error } = await supabase
      .from("users_info")
      .update([
        {
          firstname,
          lastname,
          phone,
          birthday,
          address,
          postal,
        },
      ])
      .eq("user_id", userID);

    if (error) {
      throw new Error(`internt fel: Kunde inte uppdatera användarensuppgidter. (insertUserData: error): ${JSON.stringify(
        error
      )}`)
    }

    return res.status(201).json({ success: "Dina uppgifter har uppdaterats." });

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Ett oväntat fel har inträffat. Försök igen." });
  }
};

export const addUserInfo = async (req, res) => {
  const { firstname, lastname, phone, birthday, address, postal, email } =
    req.body;
  const userID = req?.user?.id;
  const userEmail = req?.user?.email;

  if (!userID) {
    return res
      .status(401)
      .json({ error: "Du måste vara inloggad." });
  }

  // const validationError = validateCustomerData(
  //   email,
  //   firstname,
  //   lastname,
  //   birthday,
  //   phone,
  //   address,
  //   postal
  // );

  // if (validationError) {
  //   return res.status(400).json(validationError);
  // }

  try {
    const { data, error } = await supabase
      .from("users_info")
      .insert([
        {
          user_id: userID,
          firstname,
          lastname,
          phone,
          birthday,
          address,
          postal,
          email: userEmail,
        },
      ])
      .select()
      .eq("user_id", userID);

    if (!data || error) {
      return res
        .status(500)
        .json({
          error:
            "Ett oväntat fel inträffade. Kontrollera att alla obligatoriska fält är ifyllda.",
        });
    }

    return res.status(201).json({ success: "Dina uppgifter har sparats." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Ett oväntat fel har inträffat. Försök igen." });
  }
};

