const UserModel = require('../../app/models/UserModel');

class Models {
    constructor (mongoose) {
        this.mongoose = mongoose;
    }

    Load() {
        return {
            mongoose: this.mongoose,
            User: new UserModel(this.mongoose, 'User')
        };
    }
}

module.exports = Models;
