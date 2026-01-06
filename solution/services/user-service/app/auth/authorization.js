import { JWKS_URL } from '../env.js';
import pkg from 'jsonwebtoken';
const { verify } = pkg;
import jwksClient from 'jwks-rsa';
import { userRoles } from '../enums/user-roles.js';

const client = jwksClient({
    jwksUri: JWKS_URL
});

// Get signing key
function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (err || !key) {
            console.error('Error getting signing key!', err);
            return callback(err || new Error('Signing key not found!'))
        }
        const signingKey = key.getPublicKey?.() || key.publicKey || key.rsaPublicKey;
        if (!signingKey) {
            callback(null, signingKey);
        }
        callback(null, signingKey)
    });
}

// Middleware to validate JWT
function jwtAuthMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(401).json({ error: 'Missing token' });

    verify(token, getKey, {
        algorithms: ['RS256'], // Use your provider's algorithm
    }, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded; // You can access `req.user` in your routes
        next();
    });
}

function jwtAuthMiddlewareSupportedRoles(...roles) {
	return async (req, res, next) => {
		const pathId = req.params.id;	
		const tokenId = req.user.sub;
		if (!roles.includes(req.user.role) ||
			req.user.role == userRoles.USER && pathId && pathId != tokenId) {
			return res.status(403).json({ error: 'Insufficient permissions' });
		}
		next();
	}
}

export  { jwtAuthMiddleware, jwtAuthMiddlewareSupportedRoles };
