const { body, validationResult, param, query } = require('express-validator');

class Validators {

    static Validate(req, res, next) {
        const errors = validationResult(req);
        if (errors.isEmpty()) return next();
        return res.status(422).json({ error: true, errors: errors.array() });
    }

    static ParamId() {
        return [
            param('id').isMongoId().withMessage('Must provide a valid id param')
        ];
    }

    static BodyCompleted() {
        return [
            body('completed').isBoolean().withMessage('Must provide a valid completed param')
        ];
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
            body('name').isString().isLength({ min: 1 }).withMessage('Must provide a valid name param'),
            body('password').isString().isLength({ min: 1 }).withMessage('Must provide a valid password param'),
            body('confirmPassword').isString().isLength({ min: 1 }).custom((val, { req: { body: { password } } }) => val === password).withMessage('Must provide a valid confirmPassword param'),
            body('isAdmin').optional().isBoolean().withMessage('Must provide a valid isAdmin param')
        ];
    }

    static UserUpdating() {
        return [
            body('name').isString().isLength({ min: 1 }).withMessage('Must provide a valid name param'),
            body('isAdmin').optional().isBoolean().withMessage('Must provide a valid isAdmin param'),
            body('userId').isMongoId().withMessage('Must provide a valid userId param')
        ];
    }

    static Pagination() {
        return [
            query('limit').optional().toInt().isInt({ min: 1 }).withMessage('invalid limit value'),
            query('skip').optional().toInt().isInt({ min: 0 }).withMessage('invalid skip value')
        ];
    }

    static EventsPagination() {
        return [
            ...this.Pagination(),
            query('gtedate').optional().toInt().isInt({ min: 1 }).withMessage('Must provide a valid gtedate value'),
            query('ltedate').toInt().custom((val, { req: { query: q } }) => q.gtedate ? val > q.gtedate : true).withMessage('Must provide a valid ltedate param')
        ];
    }

    static EventCreation() {
        return [
            body('events').isArray({ min: 1 }).withMessage('Must provide a valid events param'),
            body('events[*].title').isString().isLength({ min: 1 }).withMessage('Must provide a valid title param'),
            body('events[*].description').isString().isLength({ min: 1 }).withMessage('Must provide a valid description param'),
            body('events[*].startsAt').toInt().isInt({ min: 10000 }).withMessage('Must provide a valid startsAt param'),
            body('events[*].endsAt').toInt().isInt({ min: 100000 }).withMessage('Must provide a valid endsAt param')
        ];
    }

    static EventUpdating() {
        return [
            body('title').isString().isLength({ min: 1 }).withMessage('Must provide a valid title param'),
            body('description').isString().isLength({ min: 1 }).withMessage('Must provide a valid description param'),
            body('startsAt').toInt().isInt({ min: 10000 }).withMessage('Must provide a valid startsAt param'),
            body('endsAt').toInt().isInt({ min: 100000 }).withMessage('Must provide a valid endsAt param')
        ];
    }

}

module.exports = Validators;