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

        const slots = await Slot.find();
        console.log(`Found ${slots.length} slots in total:`);
        slots.forEach(s => {
            console.log(`- Machine: ${s.machine_id}, Slot: ${s.slot_number}, Name: "${s.name}", Enabled: ${s.enabled}, Stock: ${s.stock}/${s.max}, Status: ${s.status}, Image: ${s.image ? s.image.substring(0, 50) : null}`);
        });

        mongoose.connection.close();
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
