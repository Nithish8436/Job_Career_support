const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const listCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(c => console.log(` - ${c.name}`));
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error listing collections:', error);
        process.exit(1);
    }
};

listCollections();
