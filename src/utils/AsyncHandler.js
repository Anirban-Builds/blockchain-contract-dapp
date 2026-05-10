const asynchandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (err) {
        res.status(typeof err.statusCode === "number" ? err.statusCode : 500).json({
            success: false,
            message : err.message
         })
    }
}

export default asynchandler