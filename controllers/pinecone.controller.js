const { pineconeIndex } = require('../config/pinecone');
const { embeddings } = require('../config/embeddings');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { PromptTemplate } = require('@langchain/core/prompts');
const { chatOpenAI } = require('../config');


const embedAndStoreDocument = async (req, res) => {
  try {
    const { content, namespace } = req.body;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });

    const docs = await splitter.createDocuments([content]);

    const vectors = await embeddings.embedDocuments(docs.map(doc => doc.pageContent));

    const pineconeVectors = vectors.map((vec, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      values: vec,
      metadata: { text: docs[idx].pageContent },
    }));

    await pineconeIndex.upsert(
      pineconeVectors,
      namespace || 'default'
    );

    res.status(200).json({ message: '📄 Document embedded successfully!' });
  } catch (error) {
    console.error('Embedding Error:', error);
    res.status(500).json({ error: 'Embedding failed' });
  }
};

const queryDocuments = async (req, res) => {
  try {
    const { query, namespace } = req.body;

    const embeddedQuery = await embeddings.embedQuery(query);

    const searchResults = await pineconeIndex.query(
      {
        vector: embeddedQuery,
        topK: 3,
        includeMetadata: true
      },
      namespace || 'default'
    );

    console.log("searchResults",searchResults);

    const context = searchResults.matches.map(match => {
        // Applying high score threshold to avoid low quality matches
      // if(match.score >= 0.85){
        return match.metadata.text;
      // }
    }).join('\n');

    console.log("context",context);

    const finalPrompt = `
      Use the following context to answer the question.

      Context:
      ${context}

      Question: ${query}

      use only the context to answer the question. if you don't know the answer in the context, say "I don't know"
    `;

    console.log("finalPrompt",finalPrompt);

    const response = await chatOpenAI.invoke(finalPrompt);

    console.log("response",response);

    res.status(200).json({
      query,
      answer: response.content,
      sources: context,
    });
  } catch (error) {
    console.error('Query Error:', error);
    res.status(500).json({ error: 'Query failed' });
  }
};

const deleteDocuments = async (req, res) => {
    try {
      const { namespace } = req.body;
  
      console.log("namespace", namespace);
      await pineconeIndex.deleteAll(
        namespace || 'default'
      );
  
      res.status(200).json({ message: '🗑️ All documents deleted from namespace!' });
    } catch (error) {
      console.error('Delete Error:', error);
      res.status(500).json({ error: 'Deletion failed' });
    }
};

module.exports = {
  embedAndStoreDocument,
  queryDocuments,
  deleteDocuments,
};
