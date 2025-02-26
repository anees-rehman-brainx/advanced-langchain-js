const router = require('express').Router();
const { chatController } = require('../../controllers');
const { authMiddleware } = require('../../middlewares');

router.post('/', chatController.handleChat);

router.post('/stream', chatController.handleChatStream);

router.post('/multiple-runnables', chatController.handleMultipleRunnables);

router.post('/custom-runnables', chatController.handleCustomRunnables);

router.post('/stream-essay', chatController.streamEssay);

router.post('/parallel-runnables', chatController.parallelRunnablesExecution);

module.exports = router;
