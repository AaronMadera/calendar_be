class BaseRepository {
    constructor (modelName) {
        this.model = global.db[ modelName ];
        this.Find = this.Find.bind(this);
    }

    async Find({ condition = {}, populate = null, sort = null, select = null }) {
        if (condition.removed === undefined) condition.removed = false;
        const query = this.model.findOne(condition);
        if (populate) query.populate(populate);
        if (sort) query.sort(sort);
        if (select) query.select(select);

        return query.exec();
    }

    async FindAll({ condition = {}, populate = null, sort = null, select = null, skip = null, limit = null }) {
        if (condition.removed === undefined) condition.removed = false;
        const query = this.model.find(condition);
        if (populate) query.populate(populate);
        if (sort) query.sort(sort);
        if (select) query.select(select);

        if (skip) query.skip(skip);
        if (limit) query.limit(limit);

        return query.exec();
    }

    async Count(condition = {}) {
        if (condition.removed === undefined) condition.removed = false;
        return this.model.countDocuments(condition);
    }

    async Create(record) {
        return new this.model(record).save();
    }

    async CreateMany(records) {
        return this.model.insertMany(records);
    }

    async Update({ _id, record = {} }) {
        return this.model.updateOne({ removed: false, _id }, { $set: record });
    }

    async Remove(_id) {
        return this.model.updateOne({ _id }, { $set: { removed: true } });
    }

    async DeleteFromDB(_id) {
        return this.model.deleteOne({ _id });
    }

}

module.exports = BaseRepository;
