const BaseRepository = require('./BaseRepository');

class EventRepository extends BaseRepository {
    constructor () {
        super('Event');
    }

    async FindOverlap({ _id, start, end }) {
        return this.Find({
            condition: {
                user: _id,
                removed: false,
                $or: [
                    { startsAt: { $gte: start, $lte: end } },
                    { endsAt: { $gte: start, $lte: end } }
                ]
            }
        });
    }

    async ListUserEvents({ _id, skip = 0, limit = 10, gtedate = null, ltedate = null }) {
        const config = {
            condition: { removed: false, user: _id },
            skip,
            limit,
            select: '-removed -createdAt -removed'
        };
        if (gtedate) config.condition.startsAt = { $gte: gtedate, $lte: ltedate };
        return this.FindAll(config);
    }

    async CountUserEvents({ gtedate = null, ltedate = null }) {
        const condition = { removed: false };
        if (gtedate) condition.startsAt = { $gte: gtedate, $lte: ltedate };
        return this.Count(condition);
    }
}

module.exports = EventRepository;