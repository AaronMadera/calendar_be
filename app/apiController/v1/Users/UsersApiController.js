const UserRepository = require('../../../repository/UserRepository');
const TokenHelper = require('../../../helpers/TokenHelper');

class UsersApiController {
    constructor ($app) {
        this.app = $app;
        this.userManager = new UserRepository();
    }
    Router(path) {
        this.app.post(`${path}/login`, this.Login.bind(this));
    }

    async Login(req, res) {
        try {
            const { email, password } = req.body;
            const config = { condition: { removed: false, email } };
            const user = await this.userManager.Find(config);
            if (!user) res.status(401).json({ error: true, msg: 'Wrong credentials, buddy!' });

            const validation = await user.validPass(password);
            if (validation) {
                const { email, name, id, _id } = user;
                const { token, expires } = await TokenHelper.GenerateToken({ email, name, id, _id }, 1);
                res.status(200).json({ error: false, data: { token, expires, user: { email, name } }, msg: 'Logged in successfully' });
            } else res.status(401).json({ error: true, msg: 'Wrong credentials, buddy!' })
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while trying to log in' });
        }
    }
}

module.exports = UsersApiController;