const { OpenAIEmbeddings } = require('@langchain/openai');

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

module.exports = { embeddings };