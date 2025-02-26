const router = require('express').Router();
const { agentController } = require('../../controllers');

router.post('/run-agent', agentController.runAgent);
router.post('/run-complex-scenario', agentController.runComplexScenario);

module.exports = router;
