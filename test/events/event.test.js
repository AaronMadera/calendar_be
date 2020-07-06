const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../app');
chai.should();
chai.use(chaiHttp);

const EventRepository = require('../../app/repository/EventRepository');

/* Aux vars */
let eventManager = null;
let tokenHeader = null;
let creationDate = null;
let currentEventId = null;
const { userCreds: regularUser } = global.config.testing;
const newEvent = {
    events: [ {
        title: 'Test events',
        description: 'Unit test for Events API',
        startsAt: Date.now(),
        endsAt: Date.now() + (1000 * 60 * 60)
    } ]
};

describe('Events API', () => {
    /* 
    Login
    */
    it('-- Getting token header', done => {
        chai.request(server)
            .post('/api/v1/users/login')
            .send({ email: regularUser.email, password: regularUser.password })
            .end((e, resp) => {
                if (e) done(e);
                try {
                    resp.body.should.be.a('object');
                    resp.body.should.have.property('data');
                    resp.body.should.have.property('error', false);
                    resp.body.data.should.have.property('token');
                    tokenHeader = `Bearer ${resp.body.data.token}`;
                    eventManager = new EventRepository();
                    done();
                } catch (e) { done(e); }
            });
    });

    /* 
    *Test POST new Event
    */
    describe('[POST] /api/v1/events/create', () => {
        it('It should POST new Event', done => {
            creationDate = Date.now();
            chai.request(server)
                .post('/api/v1/events/create')
                .set('authorization', tokenHeader)
                .send(newEvent)
                .end(async (e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(201);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', false);
                        resp.body.should.have.property('data');
                        resp.body.data.should.have.property('notCreated');
                        resp.body.data.notCreated.should.be.a('array');
                        resp.body.data.notCreated.should.have.length(0);
                        const currentEvent = await eventManager.Find({ condition: { createdAt: { $gte: creationDate } } });
                        currentEventId = currentEvent.id;
                        done();
                    } catch (e) { done(e); }
                });
        });

        it('It should NOT POST new Event bc it would duplicate same event', done => {
            chai.request(server)
                .post('/api/v1/events/create')
                .set('authorization', tokenHeader)
                .send(newEvent)
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(401);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', true);
                        resp.body.should.have.property('data');
                        resp.body.data.should.have.property('notCreated');
                        resp.body.data.notCreated.should.be.a('array');
                        resp.body.data.notCreated.should.have.length(1);
                        done();
                    } catch (e) { done(e); }
                });
        });
    });

    /* 
    *Test Get events list
    */
    describe('[GET] /api/v1/events/list', () => {
        it('It should List max 2 events bc query.limit=2', done => {
            chai.request(server)
                .get('/api/v1/events/list?limit=2')
                .set('authorization', tokenHeader)
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(200);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', false);
                        resp.body.should.have.property('data');
                        resp.body.data.should.have.property('events');
                        done();
                    } catch (e) { done(e); }
                });
        });
    });

    /* 
  *Test PUT Event update
  */
    describe('[PUT] /api/v1/events/update/:id', () => {
        it('It should PUT updated Event', done => {
            const [ event ] = newEvent.events;
            event.title = `${event.title}_updated`;
            chai.request(server)
                .put(`/api/v1/events/update/${currentEventId}`)
                .set('authorization', tokenHeader)
                .send(event)
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(200);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', false);
                        done();
                    } catch (e) { done(e); }
                });
        });

        it('It should NOT PUT updated Event bc there\s no startsAt ', done => {
            const [ event ] = newEvent.events;
            delete event.startsAt;
            chai.request(server)
                .put(`/api/v1/events/update/${currentEventId}`)
                .set('authorization', tokenHeader)
                .send(event)
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(422);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', true);
                        done();
                    } catch (e) { done(e); }
                });
        });
    });
    /* 
  *Test Patch Event status to true
  */
    describe('[PATCH] /api/v1/events/status/:id', () => {
        it('It should PATCH Event status to true', done => {
            chai.request(server)
                .patch(`/api/v1/events/status/${currentEventId}`)
                .set('authorization', tokenHeader)
                .send({ completed: true })
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        console.log('inside patch', resp.body);

                        resp.should.have.status(200);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', false);
                        done();
                    } catch (e) { done(e); }
                });
        });

        it('It should NOT PATCH Event status to true bc id param isn\'t a mongoId ', done => {
            chai.request(server)
                .patch(`/api/v1/events/status/no-a-mongo-id`)
                .set('authorization', tokenHeader)
                .send({ completed: true })
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(422);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', true);
                        done();
                    } catch (e) { done(e); }
                });
        });
    });

    /* 
  *Test DELETE User
  */
    describe('[DELETE] /api/v1/events/remove/:id', () => {
        it('It should DELETE Event', done => {
            chai.request(server)
                .delete(`/api/v1/events/remove/${currentEventId}`)
                .set('authorization', tokenHeader)
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(200);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', false);
                        done();
                    } catch (e) { done(e); }
                });
        });

        it('It should NOT DELETE Event bc id param isn\'t a mongoId ', done => {
            chai.request(server)
                .delete('/api/v1/events/remove/no-a-mongo-id')
                .set('authorization', tokenHeader)
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(422);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', true);
                        done();
                    } catch (e) { done(e); }
                });
        });
    });

});

after(done => {
    /* DB created files in this test */
    const config = {
        condition: { removed: true, createdAt: { $gte: creationDate } }
    };
    eventManager.FindAll(config)
        .then(events => {
            events.should.be.a('array');
            events.should.have.length(1);
            events[ 0 ].should.have.property('removed', true);
            events[ 0 ].should.have.property('completed', true);

            eventManager.DeleteFromDB(events[ 0 ]._id)
                .then(done())
                .catch(e => done(e));
        })
        .catch(e => done(e));
});
