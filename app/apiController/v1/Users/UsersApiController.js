
const UserRepository = require('../../../repository/UserRepository');
const TokenHelper = require('../../../helpers/TokenHelper');
const Session = require('../../../../lib/Session');
const Validators = require('../../../../lib/Validators');
class UsersApiController {
    constructor ($app) {
        this.app = $app;
        this.userManager = new UserRepository();
    }
    Router(path) {
        this.app.post(`${path}/login`, Validators.UserLogin(), Validators.Validate, this.Login.bind(this));
        this.app.get(`${path}/list`, Session.IsAdmin, Validators.Pagination(), Validators.Validate, this.ListUsers.bind(this));
        this.app.get(`${path}/:id`, Session.IsAdmin, Validators.ParamId(), Validators.Validate, this.GetUser.bind(this));
        this.app.post(`${path}/create`, Session.IsAdmin, Validators.UserCreation(), Validators.Validate, this.Create.bind(this));
        this.app.put(`${path}/update`, Session.IsAdmin, Validators.UserUpdating(), Validators.Validate, this.Update.bind(this));
        this.app.delete(`${path}/remove/:id`, Session.IsAdmin, Validators.ParamId(), Validators.Validate, this.Delete.bind(this));
    }

    async Login(req, res) {
        try {
            const { email, password } = req.body;
            const config = { condition: { removed: false, email } };
            const user = await this.userManager.Find(config);
            if (!user) res.status(401).json({ error: true, msg: 'Wrong credentials, buddy!' });

            const validation = await user.validPass(password);
            if (validation) {
                const { email, name, _id, isAdmin } = user;
                const { token, expires } = await TokenHelper.GenerateToken({ user: { email, name, _id, isAdmin } }, 1);
                res.status(200).json({ error: false, data: { token, expires, user: { email, name } }, msg: 'Logged in successfully' });
            } else res.status(401).json({ error: true, msg: 'Wrong credentials, buddy!' })
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while trying to log in' });
        }
    }

    async ListUsers(req, res) {
        try {
            const { limit = 10, skip = 0 } = req.query;
            const [ users, total ] = await Promise.all([
                this.userManager.ListUsers({ limit, skip, _id: req.user._id }),
                this.userManager.CountUsers(req.user._id)
            ]);
            res.status(200).json({ error: false, data: { total, users }, msg: 'Users listed successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while listing users' });
        }
    }

    async GetUser(req, res) {
        try {
            const config = {
                condition: { _id: req.params.id, removed: false },
                select: '-removed -createdAt -password'
            };
            const user = await this.userManager.Find(config);
            if (!user) return res.status(404).json({ error: true, data: {}, msg: 'There is no User with such id' });
            res.status(200).json({ error: false, data: { user }, msg: 'User listed successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while listing user' });
        }
    }

    async Create(req, res) {
        try {
            const { email, name, password, isAdmin = false } = req.body;

            const userDb = await this.userManager.Find({ condition: { email, removed: false } });
            if (userDb) return res.status(401).json({ error: true, msg: 'User already exists' });

            const { email: emailDb, isAdmin: isAdminDb } = await this.userManager.Create({ email, password, name, isAdmin });
            res.status(201).json({ error: false, data: { user: { email: emailDb, isAdmin: isAdminDb } }, msg: 'User created successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while creating new User' });
        }
    }

    async Update(req, res) {
        try {
            const { name, isAdmin, userId } = req.body;

            const userDb = await this.userManager.Find({ condition: { _id: userId } });
            if (!userDb) return res.status(404).json({ error: true, msg: 'There is no user with such userId' });

            await this.userManager.Update({ _id: userDb._id, record: { name, isAdmin } })

            res.status(200).json({ error: false, data: {}, msg: 'User updated successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while updating User' });
        }
    }

    async Delete(req, res) {
        try {
            const userDb = await this.userManager.Find({ condition: { _id: req.params.id, removed: false } });
            if (!userDb) return res.status(404).json({ error: true, msg: 'There is no user with such id' });

            await this.userManager.Remove(userDb._id);
            res.status(200).json({ error: false, data: {}, msg: 'User removed successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while removing User' });
        }
    }
}

module.exports = UsersApiController;
