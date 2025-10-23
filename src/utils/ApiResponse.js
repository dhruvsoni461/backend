class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}

// some HTTP responses status code =>
    
// informational responses(100 - 199)
// Successful responses(200 - 299)
// Redirection messages(300 - 399)
// client error responses(400 - 499)
// server error responses(500 - 599)