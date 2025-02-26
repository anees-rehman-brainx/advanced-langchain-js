const { Calculator } = require('@langchain/community/tools/calculator');
const { AgentExecutor } = require('langchain/agents');
const { createOpenAIFunctionsAgent } = require('langchain/agents');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { chatOpenAI } = require('../config');

const runAgent = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Initialize Tools
    const tools = [new Calculator()];

    // Create prompt for the agent
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful AI assistant that can use tools to answer questions."],
      ["human", "{input}"],

      // This is the built in scratchpad for the agent that will be used to store the conversation history
      ["assistant", "{agent_scratchpad}"]
    ]);

    // Create the agent
    const agent = await createOpenAIFunctionsAgent({
      llm: chatOpenAI,
      tools,
      prompt
    });

    // Create the executor
    const executor = new AgentExecutor({
      agent,
      tools,

      // This is the verbose flag for the agent that will be used to print the conversation history
    //   verbose: true
    });

    // Run Agent with user query
    const response = await executor.invoke({
      input: query,
    });

    res.status(200).json({ response: response.output });
  } catch (error) {
    console.error("Agent Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const runComplexScenario = async (req, res) => {
  try {
    const { businessScenario } = req.body;

    if (!businessScenario) {
      return res.status(400).json({ error: "Business scenario description is required" });
    }

    // Initialize Tools
    const tools = [
      new Calculator(),
      // You can add more tools here as needed
    ];

    // Create a more sophisticated prompt for complex business analysis
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are an advanced AI business analyst assistant. Your capabilities include:
        - Breaking down complex business problems into smaller steps
        - Performing numerical calculations and analysis
        - Providing detailed explanations of your reasoning
        - Making data-driven recommendations
        
        Always structure your response in this format:
        1. First, analyze the problem and break it down
        2. Show your calculations clearly
        3. Explain your reasoning
        4. Provide actionable recommendations
      `],
      ["human", "{input}"],
      ["assistant", "{agent_scratchpad}"]
    ]);

    // Create the agent with the enhanced prompt
    const agent = await createOpenAIFunctionsAgent({
      llm: chatOpenAI,
      tools,
      prompt
    });

    // Create the executor with verbose mode for detailed logging
    const executor = new AgentExecutor({
      agent,
      tools,
    //   verbose: true,
      // Add maxIterations to prevent infinite loops
      maxIterations: 5,
      // Add early stopping conditions
      returnIntermediateSteps: true,
    });

    // Run the complex scenario analysis
    const response = await executor.invoke({
      input: businessScenario,
    });

    // Format the response with additional context
    const formattedResponse = {
      analysis: response.output,
      // If returnIntermediateSteps is true, you can access the steps
      steps: response.intermediateSteps || [],
      metadata: {
        toolsUsed: response.intermediateSteps?.map(step => step.tool) || [],
        iterationsUsed: response.intermediateSteps?.length || 0,
      }
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Complex Scenario Analysis Error:", error);
    res.status(500).json({ 
      error: "Error analyzing complex scenario",
      details: error.message 
    });
  }
};

module.exports = {
  runAgent,
  runComplexScenario,
};
