class EventModel {
    constructor (mongoose, name) {
        this.mongoose = mongoose;
        this.name = name;
        this.Schema = mongoose.Schema;

        return this.Initialize();
    }

    Initialize() {
        this.Schema = new this.Schema({
            user: { type: this.Schema.Types.ObjectId, ref: 'User', required: true },
            title: { type: String, required: true, default: '' },
            description: { type: String, required: true, default: '' },
            completed: { type: Boolean, required: true, default: false },
            startsAt: { type: Date, required: true },
            endsAt: { type: Date, required: true },
            createdAt: { type: Date, required: true, default: Date.now },

            removed: { type: Boolean, required: true, default: false }
        }, { versionKey: false });

        return this.mongoose.model(this.name, this.Schema);
    }
}

module.exports = EventModel;
