export const clearGuestSession = (res, guest_id) => {
    if (guest_id) {
        res.clearCookie("cookie_key", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        })
    }
}