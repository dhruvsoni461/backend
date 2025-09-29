class ApiError extends Error{
    constructor(
        ststusCode,
        message = "something went wrong",
        error = [],
        stack = ""
    ){
        super(message)
        this.statusCode = this.statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = this.errors

        if (stack) {
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.consatructor)
        }
    }
}

export{ApiError }