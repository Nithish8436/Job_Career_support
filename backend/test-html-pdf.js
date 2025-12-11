const { htmlToPdf } = require('./services/htmlToPdfService');

const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Test Resume</h1>
    <p>This is a test.</p>
</body>
</html>
`;

console.log('Testing HTML to PDF conversion...');

htmlToPdf(testHtml)
    .then(pdfBuffer => {
        console.log('Success! PDF generated. Size:', pdfBuffer.length, 'bytes');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    });
