
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
    constructor () {
        super('User');
    }

    async ListUsers({ skip = 0, limit = 10, _id }) {
        const config = {
            condition: { removed: false, _id: { $ne: _id } },
            skip,
            limit,
            select: '-password -createdAt'
        };
        return this.FindAll(config);
    }
}

module.exports = UserRepository;