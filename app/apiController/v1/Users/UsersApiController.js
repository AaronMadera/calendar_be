class UsersApiController {
    constructor ($app) {
        this.app = $app;
    }
    Router(path) {
        this.app.post(`${path}/login`, this.Login.bind(this));
    }

    async Login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) throw new Error('missing fields');
            res.status(200).json({ error: false, data: { token: {}, user: {} }, msg: 'Logged in successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while trying to log in' });
        }
    }
}

module.exports = UsersApiController;