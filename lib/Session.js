const TokenHelper = require('../app/helpers/TokenHelper');
const UserRepository = require('../app/repository/UserRepository');

class Session {

    static async GetUser(req) {
        const userManager = new UserRepository();
        try {
            const [ , token ] = req.headers.authorization.split(' ');
            const { user } = await TokenHelper.DecodeToken(token);
            req.user = await userManager.Find({ condition: { _id: user._id }, select: '-createdAt -password' });
            if (!req.user) throw new Error('There is no user');
            return true;
        } catch (e) {
            throw new Error(e);
        }
    }

    static async HasAccess(req, res, next) {
        try {
            await Session.GetUser(req);
            if (req.user && req.user.isAdmin !== undefined && req.user.isAdmin !== null)
                next();
            else throw new Error('User has no access');
        } catch (e) {
            return res.status(401).json({ error: true, msg: 'Invalid access' });
        }
    }

    static async IsAdmin(req, res, next) {
        try {
            await Session.GetUser(req);
            if (req.user && req.user.isAdmin) next();
            else throw new Error('User is not Admin');
        } catch (e) {
            return res.status(403).json({ error: true, msg: 'Invalid access' });
        }
    }

    static async IsRegularUser(req, res, next) {
        try {
            await Session.GetUser(req);
            if (req.user && req.user.isAdmin === false) next();
            else throw new Error('User is not Regular User');
        } catch (e) {
            return res.status(403).json({ error: true, msg: 'Invalid access' });
        }
    }
}

module.exports = Session;