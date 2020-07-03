const jwt = require('jsonwebtoken');

class TokenHelper {

    static async GenerateToken(payload, days) {
        return new Promise((resolve, reject) => {
            const notBefore = Math.ceil(Date.now() / 1000);
            const expiresIn = (days * 60 * 60 * 24) + notBefore;
            jwt.sign(payload, global.config.sessionSecret, { expiresIn, notBefore }, (err, token) => {
                if (err) reject(err);
                else resolve({
                    token,
                    expires: expiresIn
                });
            })
        });
    }
}

module.exports = TokenHelper;