const moment = require('moment');

const EventRepository = require('../../../repository/EventRepository');
const Session = require('../../../../lib/Session');
const Validators = require('../../../../lib/Validators');
const { filter } = require('bluebird');

class EventsApiController {
    constructor ($app) {
        this.app = $app;
        this.eventManager = new EventRepository();
    }
    Router(path) {
        this.app.get(`${path}/list`, Session.IsRegularUser, Validators.Pagination(), Validators.Validate, this.ListEvents.bind(this));
        // this.app.get(`${path}/list/:userId`, Session.IsAdmin, Validators.Pagination(), Validators.Validate, this.ListEventsByUser.bind(this));
        this.app.get(`${path}/:id`, Session.HasAccess, Validators.ParamId(), Validators.Validate, this.GetEvent.bind(this));
        this.app.post(`${path}/create`, Session.HasAccess, Validators.EventCreation(), Validators.Validate, this.Create.bind(this));
        this.app.put(`${path}/update/:id`, Session.HasAccess, Validators.ParamId(), Validators.EventUpdating(), Validators.Validate, this.Update.bind(this));
        this.app.patch(`${path}/status/:id`, Session.HasAccess, Validators.ParamId(), Validators.BodyCompleted(), Validators.Validate, this.ChangeStatus.bind(this));
        this.app.delete(`${path}/remove/:id`, Session.HasAccess, Validators.ParamId(), Validators.Validate, this.Delete.bind(this));
    }

    async ListEvents(req, res) {
        try {
            const { skip = 0, limit = 10, gtedate = null, ltedate = null } = req.params;
            let gte = null;
            let lte = null;
            if (gtedate) {
                gte = new moment(gtedate);
                lte = new moment(ltedate);
            }
            const filters = {
                _id: req.user._id,
                gtedate: gtedate ? gte.toDate() : null,
                ltedate: ltedate ? lte.toDate() : null
            };
            const [ events, total ] = await Promise.all([
                this.eventManager.ListUserEvents({ ...filters, skip, limit }),
                this.eventManager.CountUserEvents(filters)
            ]);
            res.status(200).json({ error: false, data: { total, events }, msg: 'Events listed successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while listing events' });
        }
    }
    /* 
        async ListEventsByUser(req, res) {
            try {
                const { skip = 0, limit = 10, gtedate = null, ltedate = null } = req.params;
                let gte = null;
                let lte = null;
                if (gtedate) {
                    gte = new moment(gtedate);
                    lte = new moment(ltedate);
                }
                const filters = {
                    skip,
                    limit,
                    _id: req.user._id,
                    gtedate: gtedate ? gte.toDate() : null,
                    ltedate: ltedate ? lte.toDate() : null
                };
                const events = await this.eventManager.ListUserEvents(filters);
                res.status(200).json({ error: false, data: { events }, msg: 'Events listed successfully' });
            } catch (e) {
                res.status(500).json({ error: true, data: {}, msg: 'Error while listing events' });
            }
        } */

    async GetEvent(req, res) {
        try {
            const config = {
                condition: req.user.isAdmin ? { removed: false } : { _id: req.params.id, removed: false },
                select: '-removed -createdAt'
            };
            const event = await this.eventManager.Find(config);
            if (!event) return res.status(404).json({ error: true, data: {}, msg: 'There is no Event with such id' });
            res.status(200).json({ error: false, data: { event }, msg: 'Event listed successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while listing event' });
        }
    }



    async Create(req, res) {
        try {
            const notCreated = [];
            const toCreate = [];

            for (let i = 0; i < req.body.events.length; i++) {
                const event = req.body.events[ i ];
                const { title, description, startsAt, endsAt } = event;

                const start = new moment(startsAt).toDate();
                const end = new moment(endsAt).toDate();

                const [ eventDb, eventProvided ] = await Promise.all([
                    this.eventManager.FindOverlap({ _id: req.user._id, start, end }),
                    req.body.events.findIndex((e, idx) =>
                        idx !== i && ((startsAt >= e.startsAt && startsAt <= e.endsAt || (endsAt >= e.startsAt && endsAt <= e.endsAt)))
                    )
                ]);
                if (eventDb || eventProvided >= 0 || startsAt >= endsAt) {
                    notCreated.push({
                        index: i,
                        content: event,
                        msg: 'Time range of this event overlaps with another event.'
                    });
                } else {
                    toCreate.push({
                        user: req.user._id,
                        title,
                        description,
                        startsAt: start,
                        endsAt: end
                    });
                }
            }
            if (toCreate.length) await this.eventManager.CreateMany(toCreate);
            else return res.status(401).json({ error: true, data: { notCreated }, msg: 'Time range of every event overlaps with an existing one' });

            res.status(201).json({ error: false, data: { notCreated }, msg: notCreated.length ? 'Some Events created successfully' : 'All Events created successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while creating new Events' });
        }
    }

    async Update(req, res) {
        try {
            const { params: { id }, body: { title, description, startsAt, endsAt } } = req;
            const start = new moment(startsAt).toDate();
            const end = new moment(endsAt).toDate();


            const [ eventDb, overlaped ] = await Promise.all([
                this.eventManager.Find({ condition: { _id: id, removed: false } }),
                this.eventManager.FindOverlap({ _id: req.user._id, start, end })
            ]);
            if (!eventDb || (overlaped && overlaped.id !== eventDb.id))
                return res.status(404).json({ error: true, msg: !eventDb ? 'There is no Event with such id' : 'Time range of event overlaps with an existing one' });

            await this.eventManager.Update({ _id: eventDb._id, record: { title, description, startsAt: start, endsAt: end } })

            res.status(200).json({ error: false, data: {}, msg: 'Event updated successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while updating Event' });
        }
    }

    async ChangeStatus(req, res) {
        try {
            const { params: { id }, body: { completed } } = req;

            const eventDb = await this.eventManager.Find({ condition: { _id: id, removed: false } });

            if (!eventDb) return res.status(404).json({ error: true, msg: 'There is no Event with such id' });

            await this.eventManager.Update({ _id: eventDb._id, record: { completed } })

            res.status(200).json({ error: false, data: {}, msg: 'Event updated successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while updating Event' });
        }
    }

    async Delete(req, res) {
        try {
            const eventDb = await this.eventManager.Find({ condition: { _id: req.params.id, removed: false } });
            if (!eventDb) return res.status(404).json({ error: true, msg: 'There is no event with such id' });

            await this.eventManager.Remove(eventDb._id);
            res.status(200).json({ error: false, data: {}, msg: 'Event removed successfully' });
        } catch (e) {
            res.status(500).json({ error: true, data: {}, msg: 'Error while removing Event' });
        }
    }
}

module.exports = EventsApiController;
