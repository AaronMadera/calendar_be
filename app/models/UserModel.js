const bcrypt = require('bcryptjs');

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
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            isAdmin: { type: Boolean, required: true, default: false },
            createdAt: { type: Date, required: true, default: Date.now },

            removed: { type: Boolean, required: true, default: false }
        }, { versionKey: false });

        this.Schema.methods.validPass = function (pass) {
            const pass2Compare = this.password;
            return new Promise((res, rej) =>
                bcrypt.compare(pass, pass2Compare, (e, valid) => e ? rej(e) : res(valid))
            );
        }

        this.Schema.pre('save', function (next) {
            const user = this;
            return new Promise((res, rej) => {
                bcrypt.genSalt(8, (err, salt) => {
                    err && rej(err);
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        err && rej(err);
                        user.password = hash;
                        res(next());
                    });

                });
            });
        });

        return this.mongoose.model(this.name, this.Schema);
    }
}

module.exports = UserModel;
