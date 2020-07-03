const Bluebird = require('bluebird');
const chalk = require('chalk');
const mongoose = require('mongoose');

const Models = require('./Models');

global.connection = false;

class Db {
    static Initialize() {
        let startIntents = 0;
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        return new Promise((resolve, reject) => {
            const mongooseDb = mongoose.connection;
            mongoose.Promise = Bluebird;

            mongooseDb.on('error', error => {
                global.connection = false;
                mongoose.disconnect();
                reject(error);
            });

            mongooseDb.on('connected', () => {
                global.connection = true;
                console.log(chalk.green.bgBlack('MongoDB is Connected'));
                global.db = new Models(mongoose).Load();
                resolve(true);
            });

            mongooseDb.on('reconnected', () => {
                log(chalk.green.bgBlack('MongoDB is Reconnected'));
                global.db = new Models(mongoose).Load();
                resolve(true);
            });

            mongooseDb.on('disconnected', () => {
                if (global.config.retries >= startIntents) {
                    startIntents++;
                    mongoose.connect(global.config.mongo.url, options);
                } else reject('Limit of tries to connect has been reached');
            });

            mongoose.connect(global.config.mongo.url, options);
        });
    }
}

module.exports = Db;
