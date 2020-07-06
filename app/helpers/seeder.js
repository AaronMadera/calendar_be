const DB = require('../../lib/db/Db');

global.config = require('../../config.json');

DB.Initialize()
    .then(async () => {
        const model = global.db[ 'User' ];

        const { adminCreds: adminUser, userCreds: regularUser } = global.config.testing;

        const [ seederAdminUser, seederRegularUser ] = await Promise.all([
            model.findOne({ email: adminUser.email }),
            model.findOne({ email: regularUser.email })
        ]);

        if (!seederAdminUser) {
            new model(adminUser).save();
            console.log('Seeder Admin User has been created successfully!');
        } else console.log('Seeder Admin User already exists!');

        if (!seederRegularUser) {
            new model(regularUser).save();
            console.log('Seeder Regular User has been created successfully!');
        } else console.log('Seeder Regular User already exists!');
    })
    .catch(e => console.log(e));