
const checkRoleMiddleware = (allowedRoles) => (req, res, next) => {

    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(401).json({
            msg:"You do not have the required permissions."
        })
    }

    next();
}

export default checkRoleMiddleware;