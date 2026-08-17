import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    console.log("Zod => ", req.body);

    try {
        const queryValidation = schema.parse(req.body);
        req.body = queryValidation
        next()
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res
                .status(400)
                .json({
                    success: false,
                    type: "VALIDATION",
                    msg: error.issues.reduce((acc, value) => {
                        if (!acc[value.path[0]]) {
                            acc[value.path[0]] = value.message
                        }
                        return acc
                    }, {})
                })
        }
    }
}