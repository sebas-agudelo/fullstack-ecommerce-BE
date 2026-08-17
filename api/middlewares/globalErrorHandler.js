export function globalErrorHandler(error, req, res, next) {
    if (error.meta?.step && error.meta?.originalError) {
        console.log("Error details (devs): ", {
            step: error.meta.step,
            org: error.meta.originalError,
            msg: error.message
        });
    } else {
        console.log("Error details (devs): ", {
            msg: error.message
        });
    }

    const errorStatus = error.statusCode || 500
    const message = error.message || "OBS! Någar gått väldigt fel."
    const type = error?.type || "";

    return res
        .status(errorStatus)
        .json({
            success: false,
            type: type,
            msg: message
        })
}