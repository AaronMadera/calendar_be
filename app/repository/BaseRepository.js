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

    async Create(record) {
        return new this.model(record).save();
    }

}

module.exports = BaseRepository;
