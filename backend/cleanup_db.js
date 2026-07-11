const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/vendos_db';

const SlotSchema = new mongoose.Schema({
    machine_id: String,
    slot_number: String,
    name: String,
    price: Number,
    stock: Number,
    max: Number,
    alertThreshold: Number,
    category: String,
    enabled: Boolean,
    status: String,
    image: String
});

const Slot = mongoose.model('Slot', SlotSchema);

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Delete slots where name is empty or name is empty space
        const result = await Slot.deleteMany({
            $or: [
                { name: "" },
                { name: { $exists: false } },
                { name: null }
            ]
        });
        console.log(`Deleted ${result.deletedCount} unconfigured slots from database.`);

        // Force enable VM-02 slots A01 and A02 if they are currently disabled, just for testing
        const updateResult = await Slot.updateMany({ machine_id: 'VM-02' }, { enabled: true });
        console.log(`Updated ${updateResult.modifiedCount} VM-02 slots to enabled.`);

        mongoose.connection.close();
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
