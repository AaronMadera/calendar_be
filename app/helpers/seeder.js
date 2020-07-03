const DB = require('../../lib/db/Db');
const bcrypt = require('bcryptjs');

global.config = require('../../config.json');

DB.Initialize()
    .then(async () => {
        const model = global.db[ 'User' ];
        const user = {
            name: 'Admin',
            email: 'super@user.com',
            password: bcrypt.hashSync('admin123', bcrypt.genSaltSync(8)),
            isAdmin: true
        };
        const seederUser = await model.findOne({ email: user.email });
        if (!seederUser) {
            new model(user).save();
            console.log('Seeder User has been created successfully!');
        } else console.log('Seeder User already exists!')
    })
    .catch(e => console.log(e));