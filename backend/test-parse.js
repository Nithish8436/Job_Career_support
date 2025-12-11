const pdf = require('pdf-parse');
const fs = require('fs');

async function testParsing() {
    console.log('Testing PDF parsing...');
    const pdf = require('pdf-parse');
    console.log('Type of export:', typeof pdf);

    if (typeof pdf === 'function') {
        console.log('SUCCESS: pdf-parse is a function');
    } else {
        console.log('FAILURE: pdf-parse is NOT a function');
        console.log('Keys:', Object.keys(pdf));
    }
    console.log('Test complete');
}

testParsing().catch(console.error);
