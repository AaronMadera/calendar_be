const InvalidRoutes = require('./InvalidRoutes');
const UsersApiController = require('../app/apiController/v1/Users/UsersApiController');

class Router {
    constructor ($app) {
        this.app = $app;
        this.Init = this.Init.bind(this);
        this.v1 = '/api/v1';

        this.Init();
        new InvalidRoutes(this.app);
    }

    Init() {
        new UsersApiController(this.app).Router(`${this.v1}/users`);
    }
}

module.exports = Router;
