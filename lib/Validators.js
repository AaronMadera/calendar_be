const { body, validationResult, param, query } = require('express-validator');

class Validators {

    static Validate(req, res, next) {
        const errors = validationResult(req);
        if (errors.isEmpty()) return next();
        return res.status(422).json({ error: true, errors: errors.array() });
    }

    static UserLogin() {
        return [
            body('email').isEmail().withMessage('Must provide a valid email param'),
            body('password').isString().isLength({ min: 1 }).withMessage('Must provide a valid password param')
        ];
    }

    static UserCreation() {
        return [
            body('email').isEmail().withMessage('Must provide a valid email param'),
            body('password').isString().isLength({ min: 1 }).withMessage('Must provide a valid password param'),
            body('confirmPassword').isString().isLength({ min: 1 }).custom((val, { req: { body: { password } } }) => val === password).withMessage('Must provide a valid confirmPassword param'),
            body('isAdmin').optional().isBoolean().withMessage('Must provide a valid isAdmin param')
        ];
    }
}

module.exports = Validators;