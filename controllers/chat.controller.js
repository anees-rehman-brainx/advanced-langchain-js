const {
    StringOutputParser,
    JsonOutputParser,
} = require('@langchain/core/output_parsers');
const { PromptTemplate } = require('@langchain/core/prompts');
const { chatOpenAI } = require('../config');
const { RunnableBranch, RunnableSequence,RunnableMap } = require('@langchain/core/runnables');


// Simple Chat with OpenAI and simple prompt and chain
const handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Create a prompt template
        const prompt = PromptTemplate.fromTemplate(
            `User: {message}
            Assistant: Let me help you with that.`
        );

        // Create the chain
        const chain = prompt.pipe(chatOpenAI).pipe(new JsonOutputParser());

        // Execute the chain
        const response = await chain.invoke({
            message: message,
        });

        return res.status(200).json({ response });
    } catch (error) {
        console.error('Chat Controller Error:', error);
        return res.status(500).json({
            error: error?.message || 'Something went wrong',
        });
    }
};

// Chat with OpenAI and simple prompt and chain with streaming
const handleChatStream = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Create a prompt template
        const prompt = PromptTemplate.fromTemplate(
            `User: {message}
            Assistant: Let me help you with that.`
        );

        // Create the chain with StringOutputParser instead of JsonOutputParser
        const chain = prompt.pipe(chatOpenAI).pipe(new JsonOutputParser());

        // Execute the chain
        const stream = await chain.stream({
            message: message,
        });

        // Handle the stream
        for await (const chunk of stream) {
            // Send each chunk as an SSE event
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }

        // End the response
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Chat Controller Error:', error);
        return res.status(500).json({
            error: error?.message || 'Something went wrong',
        });
    }
};

// Chat with OpenAI and multiple runnables handled via RunnableBranch
const handleMultipleRunnables = async (req, res) => {
    try {
        const { question } = req.body;

        // Updated Classification Prompt
        const classificationPrompt = PromptTemplate.fromTemplate(
            `Given the user question below, classify it into exactly one category: 'Billing', 'TechSupport', or 'General'.
            If the question mentions multiple topics, choose the most dominant one.
            If it equally discusses billing and tech support, classify it as 'TechSupport'.
            Respond with exactly one word from the categories above.

            Question: {question}

            Classification:`)
            .pipe(chatOpenAI)
            .pipe(new StringOutputParser());

        // Expert Prompts
        const billingPrompt = PromptTemplate.fromTemplate(
            `You are a Billing expert. Answer the following question:

        Question: {question}
        Answer:`)
            .pipe(chatOpenAI);

        const techSupportPrompt = PromptTemplate.fromTemplate(
            `You are a Tech Support expert. Answer the following question:

        Question: {question}
        Answer:`)
            .pipe(chatOpenAI);

        const generalPrompt = PromptTemplate.fromTemplate(
            `Answer the following question:

        Question: {question}
        Answer:`)
            .pipe(chatOpenAI);

        // Branching Logic
        const branch = RunnableBranch.from([
            [(x) => x.topic.toLowerCase().includes('billing'), billingPrompt],
            [(x) => x.topic.toLowerCase().includes('techsupport'), techSupportPrompt],
            generalPrompt,
        ]);

        // Full Chain with debugging
        const fullChain = RunnableSequence.from([
            {
                topic: classificationPrompt,
                question: (input) => input.question,
            },
            // Add intermediate step to log classification
            (output) => {
                console.log('Classification Result:', output);
                return output;
            },
            branch,
        ]);

        // Invoke Chain
        const result = await fullChain.invoke({ question });

        res.status(200).json({ response: result.content });
    } catch (error) {
        console.error('Error in handleMultipleRunnables:', error);
        res.status(500).json({ error: 'An error occurred.' });
    }
};

// Chat with OpenAI and multiple runnable handled via custom logic
const handleCustomRunnables = async (req, res) => {
    try {
        const { question } = req.body;

        // Updated Classification Prompt
        const classificationPrompt = PromptTemplate.fromTemplate(
            `Given the user question below, classify it based on the main topic.
            If the question compares or mentions multiple topics, choose the most dominant one.
            If it equally discusses LangChain and Anthropic, classify it as 'LangChain'.
            Respond with exactly one word: either 'LangChain', 'Anthropic', or 'Other'.

            Question: {question}

            Classification:`)
                .pipe(chatOpenAI)
                .pipe(new StringOutputParser());

        // 2️⃣ Expert Chains

        // LangChain Expert
        const langChainPrompt = PromptTemplate.fromTemplate(
            `You are an expert in langchain.
            Always answer questions starting with "LangChain Expert:".
            Respond to the following question:

            Question: {question}
            Answer:`)
                .pipe(chatOpenAI)

                // chatOpenAI returns the baseObject that is by default converted to string using parser,
                // so we need to do this to get the full message object
                // .pipe((message) => {
                //     console.log('Full message object:', message);
                //     return message;  // Return full message instead of auto-extracting content
                // });

        // Anthropic Expert
        const anthropicPrompt = PromptTemplate.fromTemplate(
            `You are an expert in anthropic.
            Always answer questions starting with "Anthropic Expert:".
            Respond to the following question:

            Question: {question}
            Answer:`
            ).pipe(chatOpenAI);

        // General Response
        const generalPrompt = PromptTemplate.fromTemplate(
            `Respond to the following question:
            Always answer questions starting with "General Expert:".
            Question: {question}
            Answer:`
            ).pipe(chatOpenAI);

        // 3️⃣ Routing Logic Based on Classification
        const route = (output) => {
            if (output.topic.toLowerCase().includes("anthropic")) {
                return anthropicPrompt;
            } else if (output.topic.toLowerCase().includes("langchain")) {
                return langChainPrompt;
            } else {
                return generalPrompt;
            }
        };

        // 4️⃣ Full Chain (Classification + Routing)
        const fullChain = RunnableSequence.from([
            {
                topic: classificationPrompt,
                question: (input) => input.question,
            },
            // (output) => {
            //     console.log("🟢 Classification Result:", output);
            //     return output;
            // },
            route,
        ]);

        // 5️⃣ Invoke Chain and Send Response
        const result = await fullChain.invoke({ question });

        res.status(200).json({ response: result.content });
    } catch (error) {
        console.error("❌ Error in handleCustomRunnables:", error);
        res.status(500).json({ error: "An error occurred while processing." });
    }
};

// Stream an essay and explaing the cocept of cancelling the request
const streamEssay = async (req, res) => {
  const { topic } = req.body;
  const controller = new AbortController();

  try {

    const model = chatOpenAI.bind({ signal: controller.signal });

    const prompt = PromptTemplate.fromTemplate(
      "Please write a 500 word essay about {topic}."
    );
    const chain = prompt.pipe(model);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });


    // Set a timeout to cancel the request after 10 seconds
    const timeout = setTimeout(() => {
        controller.abort();
        console.log('Request timed out and aborted');
      }, 2000); // 2 seconds timeout

      // Stream response to client
    const stream = await chain.stream({ topic });

    for await (const chunk of stream) {
      res.write(`data: ${chunk.content}\n\n`);
    }

    // Clear the timeout if the request completes successfully
    clearTimeout(timeout);
    res.end();
  } catch (e) {
    if (e.name === "AbortError") {
      res.write(`data: Request was cancelled due to timeout\n\n`);
      res.end();
    } else {
      console.error("Error during streaming:", e);
      res.status(500).json({ error: "Streaming failed" });
    }
  }
};

// parallel execution of multiple chains
const parallelRunnablesExecution = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const jokeChain = PromptTemplate.fromTemplate(
        "Tell me a joke about {topic}"
      ).pipe(chatOpenAI)
      .pipe(new StringOutputParser());
      
      const poemChain = PromptTemplate.fromTemplate(
        "Write a 2-line poem about {topic}"
      ).pipe(chatOpenAI)
      .pipe(new StringOutputParser());
      
      // Combine using RunnableMap
      const mapChain = RunnableMap.from({
        joke: jokeChain,
        poem: poemChain,
      });
      
    // Invoke the chain with user-provided topic
    const result = await mapChain.invoke({ topic });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
    handleChat,
    handleChatStream,
    handleMultipleRunnables,
    handleCustomRunnables,
    streamEssay,
    parallelRunnablesExecution
};
