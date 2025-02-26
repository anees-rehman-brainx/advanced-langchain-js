const { ChatOpenAI } = require("@langchain/openai");

const chatOpenAI = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-mini",
    temperature: 0.7
});

module.exports = chatOpenAI;