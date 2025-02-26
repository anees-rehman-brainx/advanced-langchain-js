const router = require('express').Router();
const { pineconeController } = require('../../controllers');

router.post('/store-document', pineconeController.embedAndStoreDocument);
router.post('/query-document', pineconeController.queryDocuments);
router.delete('/delete-document', pineconeController.deleteDocuments);

module.exports = router;
