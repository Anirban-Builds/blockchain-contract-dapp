class ApiError extends Error {
    constructor(
        statusCode,
        message = " Internal Server Error",
        errors = [],
        errstack= ""
    ){
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.data = null
        this.success = false
        this.errors = errors

        if (errstack){
            this.errstack = errstack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError