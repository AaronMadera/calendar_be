const InvalidRoutes = require('./InvalidRoutes');
const UsersApiController = require('../app/apiController/v1/Users/UsersApiController');
const EventApiController = require('../app/apiController/v1/Events/EventsApiController');

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
        new EventApiController(this.app).Router(`${this.v1}/events`);
    }
}

module.exports = Router;
