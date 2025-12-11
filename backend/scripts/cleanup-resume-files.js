/**
 * Optional Migration Script: Remove file buffers from existing Resume documents
 * 
 * This script removes the 'data' field (file buffers) from all existing Resume documents
 * to free up storage space and improve privacy compliance.
 * 
 * Usage:
 *   node backend/scripts/cleanup-resume-files.js
 * 
 * Note: This is a one-time operation. After running, all resume files will be removed
 * and only parsed text will remain. Make sure you have backups if needed.
 */

const mongoose = require('mongoose');
const Resume = require('../models/Resume');
require('dotenv').config();

async function cleanupResumeFiles() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/delta_forge');
        console.log('✓ Connected to MongoDB');

        // Count resumes with file buffers
        const resumesWithFiles = await Resume.countDocuments({ 
            data: { $exists: true, $ne: null } 
        });
        
        console.log(`\nFound ${resumesWithFiles} resumes with file buffers`);

        if (resumesWithFiles === 0) {
            console.log('✓ No file buffers to clean up. All resumes already use parsed text only.');
            await mongoose.disconnect();
            return;
        }

        // Calculate storage savings (approximate)
        const sampleResume = await Resume.findOne({ data: { $exists: true, $ne: null } });
        if (sampleResume && sampleResume.data) {
            const avgFileSize = sampleResume.data.length;
            const estimatedSavings = (resumesWithFiles * avgFileSize) / (1024 * 1024); // MB
            console.log(`Estimated storage savings: ~${estimatedSavings.toFixed(2)} MB`);
        }

        // Ask for confirmation (in production, you might want to add a --force flag)
        console.log('\n⚠️  WARNING: This will permanently delete all resume file buffers.');
        console.log('   Only parsed text will remain. This action cannot be undone.');
        console.log('\n   To proceed, uncomment the updateMany line below and run again.');

        // Uncomment the following lines to actually perform the cleanup:
        /*
        console.log('\nRemoving file buffers...');
        const result = await Resume.updateMany(
            { data: { $exists: true } },
            { $unset: { data: "" } }
        );
        
        console.log(`✓ Successfully removed file buffers from ${result.modifiedCount} resumes`);
        console.log('✓ Cleanup completed successfully');
        */

        await mongoose.disconnect();
        console.log('\n✓ Disconnected from MongoDB');
    } catch (error) {
        console.error('✗ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run cleanup if called directly
if (require.main === module) {
    cleanupResumeFiles()
        .then(() => {
            console.log('\n✓ Script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('✗ Script failed:', error);
            process.exit(1);
        });
}

module.exports = cleanupResumeFiles;

