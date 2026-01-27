const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const verifyCount = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const count = await db.collection('contactmessages').countDocuments();
        console.log(`Total documents in "contactmessages": ${count}`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyCount();
