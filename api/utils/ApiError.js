export class ApiError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
    }
}

export class supabaseError extends ApiError {
    constructor(meta = {}) {
        super("OBS! Ett fel uppstod när begäran bearbetades.")
        this.statusCode = 500
        this.type = "GENERAL"
        this.meta = meta
    }
}

export class NotFound extends ApiError {
    constructor(message = "Produkt/erna hittades inte.") {
        super(message)
        this.type = "NOT_FOUND"
        this.statusCode = 404
    }
}

export class invalid_credentials extends ApiError {
    constructor(message = "Ogiltig e-post eller lösenord.") {
        super(message)
        this.type = "invalid_credentials"
        this.statusCode = 401
    }
}

export class Payment_validation extends ApiError {
      constructor(message = "kmkm") {
        super(message)
        this.type = "PAYMENT_VALIDATION"
        this.statusCode = 400
    }
}