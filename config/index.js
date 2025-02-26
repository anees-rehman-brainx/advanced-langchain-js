module.exports = {
  db: require('./database'),
  s3: require('./aws'),
  chatOpenAI: require('./chatOpenAI'),
  pineconeIndex: require('./pinecone'),
  embeddings: require('./embeddings'),
};
