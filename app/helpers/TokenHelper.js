const jwt = require('jsonwebtoken');

class TokenHelper {

    static async GenerateToken(payload, days) {
        return new Promise((resolve, reject) => {
            const expiresIn = (days * 60 * 60 * 24) + Math.ceil(Date.now() / 1000);
            jwt.sign(payload, global.config.sessionSecret, { expiresIn: `${days}d`, notBefore: '0d' }, (err, token) => {
                if (err) reject(err);
                else resolve({
                    token,
                    expires: expiresIn
                });
            })
        });
    }

    static async DecodeToken(token) {
        return new Promise((res, rej) =>
            jwt.verify(token, global.config.sessionSecret, (e, decoded) => e ? rej(e) : res(decoded))
        );
    }
}

module.exports = TokenHelper;