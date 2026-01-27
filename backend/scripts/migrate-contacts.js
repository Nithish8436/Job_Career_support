const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const migrateData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        console.log('Migrating data from "contacts" to "contactmessages"...');
        const contactsData = await db.collection('contacts').find({}).toArray();

        if (contactsData.length > 0) {
            await db.collection('contactmessages').insertMany(contactsData);
            console.log(`✅ Migrated ${contactsData.length} documents.`);

            console.log('Deleting temporary "contacts" collection...');
            await db.collection('contacts').drop();
            console.log('✅ Done.');
        } else {
            console.log('No data found in "contacts" collection.');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error migrating data:', error);
        process.exit(1);
    }
};

migrateData();
