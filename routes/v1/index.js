const router = require('express').Router();

router.use('/user', require('./userRoutes'));
router.use('/chat', require('./chat.routes'));
router.use('/pinecone', require('./pinecone.routes'));
router.use('/agent', require('./agent.routes'));
module.exports = router;
