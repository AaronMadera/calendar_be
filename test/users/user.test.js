const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../app');
chai.should();
chai.use(chaiHttp);

let UserRepository = require('../../app/repository/UserRepository');

/* Aux vars */
let userManager = null;
let tokenHeader = null;
let creationDate = null;
let currentUserId = null;
const newUser = {
    email: 'user@testing.com',
    password: 'testing',
    confirmPassword: 'testing',
    name: 'user_from_testing',
    isAdmin: false
};
const adminUser = global.config.testing.adminCreds;
describe('Users API', () => {
    /* 
    Login
    */
    it('[POST] /api/v1/users/login', done => {
        chai.request(server)
            .post('/api/v1/users/login')
            .send({ email: adminUser.email, password: adminUser.password })
            .end((e, resp) => {
                if (e) done(e);
                try {
                    resp.body.should.be.a('object');
                    resp.body.should.have.property('data');
                    resp.body.should.have.property('error', false);
                    resp.body.data.should.have.property('token');
                    tokenHeader = `Bearer ${resp.body.data.token}`;
                    userManager = new UserRepository();
                    done();
                } catch (e) { done(e); }
            });
    });

    /* 
    *Test POST new User
    */
    describe('[POST] /api/v1/users/create', () => {
        it('It should POST new User', done => {
            creationDate = Date.now();
            chai.request(server)
                .post('/api/v1/users/create')
                .set('authorization', tokenHeader)
                .send(newUser)
                .end(async (e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(201);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('data');
                        resp.body.data.should.have.property('user');
                        resp.body.should.have.property('error', false);
                        const currentUser = await userManager.Find({ condition: { createdAt: { $gte: creationDate } } });
                        currentUserId = currentUser.id;
                        done();
                    } catch (e) { done(e); }
                });
        });

        it('It should NOT POST new User bc wrong pass confirmation ', done => {
            newUser.confirmPassword = 'wrongConfirm';
            chai.request(server)
                .post('/api/v1/users/create')
                .set('authorization', tokenHeader)
                .send(newUser)
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
    *Test Get users list
    */
    describe('[GET] /api/v1/users/list', () => {
        it('It should List max 2 users bc query.limit=2', done => {
            chai.request(server)
                .get('/api/v1/users/list?limit=2')
                .set('authorization', tokenHeader)
                .send(newUser)
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(200);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('error', false);
                        resp.body.should.have.property('data');
                        resp.body.data.should.have.property('users');
                        done();
                    } catch (e) { done(e); }
                });
        });
    });

    /* 
  *Test PUT User
  */
    describe('[PUT] /api/v1/users/update', () => {
        it('It should PUT updated User', done => {
            chai.request(server)
                .put('/api/v1/users/update')
                .set('authorization', tokenHeader)
                .send({
                    name: 'usert_test_updated',
                    isAdmin: false,
                    userId: currentUserId
                })
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

        it('It should NOT PUT updated User bc there\s no userId ', done => {
            chai.request(server)
                .put('/api/v1/users/update')
                .set('authorization', tokenHeader)
                .send({
                    name: 'usert_test_updated',
                    isAdmin: false,
                })
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
    describe('[DELETE] /api/v1/users/remove', () => {
        it('It should DELETE User', done => {
            chai.request(server)
                .delete(`/api/v1/users/remove/${currentUserId}`)
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

        it('It should NOT DELETE User bc id param isn\'t a mongoId ', done => {
            chai.request(server)
                .delete('/api/v1/users/remove/no-a-mongo-id')
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
    userManager.FindAll(config)
        .then(users => {
            users.should.be.a('array');
            users.should.have.length(1);
            users[ 0 ].should.have.property('removed', true);

            userManager.DeleteFromDB(users[ 0 ]._id)
                .then(done())
                .catch(e => done(e));
        })
        .catch(e => done(e));
})