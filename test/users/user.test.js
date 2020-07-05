const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../app');
chai.should();
chai.use(chaiHttp);

let UserRepository = require('../../app/repository/UserRepository');
const { config } = require('bluebird');

/* Aux vars */
let userManager = null;
let tokenHeader = null;
let creationDate = null;
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
                .end((e, resp) => {
                    if (e) done(e);
                    try {
                        resp.should.have.status(203);
                        resp.body.should.be.a('object');
                        resp.body.should.have.property('data');
                        resp.body.data.should.have.property('user');
                        resp.body.should.have.property('error', false);
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
});

after(done => {
    /* DB created files in this test */
    const config = {
        condition: { removed: false, createdAt: { $gte: creationDate } }
    };
    userManager.FindAll(config)
        .then(users => {
            users.should.be.a('array');
            users.should.have.length(1);
            users[ 0 ].should.have.property('removed', false);

            userManager.DeleteFromDB(users[ 0 ]._id)
                .then(done())
                .catch(e => done(e));
        })
        .catch(e => done(e));
})