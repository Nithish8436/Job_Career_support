const { chatWithAI } = require('./services/aiService');

async function test() {
    try {
        console.log("Testing AI Chat...");
        const response = await chatWithAI("Hello, are you working?");
        console.log("\nAI Response:\n", response);
    } catch (error) {
        console.error("\nTest Failed:", error);
    }
}

test();
