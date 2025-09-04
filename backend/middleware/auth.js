const jwt = require('jsonwebtoken');
const { BlacklistedToken } = require('../db/models');

module.exports = async function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        // Check if token is blacklisted
        const blacklisted = await BlacklistedToken.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ error: 'Token has been invalidated' });
        }

        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.', details: err.message });
    }
}