const dotenv = require('dotenv');
// ১. এনভায়রনমেন্ট ভ্যারিয়েবল লোড করা
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.js');
const adminRoutes = require('./routes/adminRoutes.js');
const apiRoutes = require('./routes/apiRoutes.js');

const Machine = require('./models/Machine');
const Slot = require('./models/Slot');
const Setting = require('./models/Setting');

// Seeding function to initialize default machine and chambers
const seedDefaultDatabase = async () => {
    try {
        // Seed admin password setting if empty
        const passwordCount = await Setting.countDocuments({ key: 'admin_password' });
        if (passwordCount === 0) {
            await Setting.create({ key: 'admin_password', value: 'admin123' });
            console.log("📡 Seeded admin password setting.");
        }

        // Seed default machine VM-01 if empty
        const machineCount = await Machine.countDocuments({});
        if (machineCount === 0) {
            await Machine.create({
                machine_id: 'VM-01',
                name: 'Campus Canteen',
                location: 'Block A, Ground Floor',
                status: 'online',
                upi_id: 'owner@upi'
            });
            console.log("📡 Seeded default machine VM-01.");
        }
    } catch (err) {
        console.error("❌ Database seeding error:", err.message);
    }
};

// ২. ডাটাবেস কানেকশন চালু করা
connectDB().then(() => {
    seedDefaultDatabase();
});

const app = express();

// ৩. মিডলওয়্যার সেটআপ (CORS এবং JSON Parser)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // ফর্ম ডেটা হ্যান্ডেল করার জন্য

// Serve local uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ৪. এপিআই রাউটস (API Routes)
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// ৫. বেস রাউট (Health Check Endpoint)
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'VendOS Engine Backend is Running... 🚀',
        timestamp: new Date()
    });
});

// 6. গ্লোবাল এরর হ্যান্ডলিং মিডলওয়্যার (সার্ভার ক্র্যাশ হওয়া আটকাবে)
app.use((err, req, res, next) => {
    console.error(`❌ Server Error: ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// 7. সার্ভার লিসেনিং
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`⚡ Server blazing on port ${PORT}`);
});