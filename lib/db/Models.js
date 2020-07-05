const UserModel = require('../../app/models/UserModel');
const EventModel = require('../../app/models/EventModel');

class Models {
    constructor (mongoose) {
        this.mongoose = mongoose;
    }

    Load() {
        return {
            mongoose: this.mongoose,
            User: new UserModel(this.mongoose, 'User'),
            Event: new EventModel(this.mongoose, 'Event')
        };
    }
}

module.exports = Models;
