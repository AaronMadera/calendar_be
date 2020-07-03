const bcrypt = require('bcryptjs')

class UserModel {
    constructor (mongoose, name) {
        this.mongoose = mongoose;
        this.name = name;
        this.Schema = mongoose.Schema;

        return this.Initialize();
    }

    Initialize() {
        this.Schema = new this.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true },
            password: { type: String, required: true },

            removed: { type: Boolean, required: true, default: false }
        }, { versionKey: false });

        this.Schema.methods.validPass = pass => new Promise((res, rej) =>
            bcrypt.compare(pass, this.password, (e, valid) => e ? rej(e) : res(valid))
        ).bind(this);

        return this.mongoose.model(this.name, this.Schema);
    }
}

module.exports = UserModel;
