const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
    constructor () {
        super('User');
    }
}

module.exports = UserRepository;