const sendResponse = async(res, statusCode, success, message, body = null) => {
    return res.status(statusCode).json({
        success: success,
        message: message,
        body: body
    })
}
export default sendResponse;