const jwt = require('jsonwebtoken');

const protect = (req, res, next) =>{
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // token format - bearer gssjsdfgsdfgsdfg
        const token = authHeader.split(' ')[1];

        if(!token){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role  
        };

        next();
    } catch (error) {
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};
module.exports = { protect };