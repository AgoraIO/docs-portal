---
title: Custom LLM
description: "In conversational AI scenarios, you may want to use a custom large language model (Custom LLM) to meet more personalized requirements. This article explains how to connect a custom LLM to the Agora Conversational AI Engine."
---

# Custom LLM

In conversational AI scenarios, you may want to use a custom large language model (Custom LLM) to meet more personalized requirements. This article explains how to connect a custom LLM to the Agora Conversational AI Engine.

## How It Works

The Agora Conversational AI Engine interacts with LLM services by using the OpenAI API protocol. The key to integrating a custom LLM is to provide an OpenAI-compatible HTTP service that can receive and return requests and responses that conform to the [API standards](#api-standards).

On top of this, you can implement more custom capabilities, including but not limited to:

- Use retrieval-augmented generation (RAG) so the LLM can retrieve information from a specific knowledge base
- Use multimodal capabilities so the LLM can output both text and audio
- Use tool calling so the LLM can call external tools
- Use Function Calling so the LLM can return structured data in the form of function calls

## Prerequisites

Before you begin, make sure that you have:

- Followed [Build a Conversational Agent](../get-started/quick-start.md) to implement the basic logic for interacting with an AI agent
- Access to a custom large language model service
- If you want to use retrieval-augmented generation (RAG), a vector database or retrieval system prepared in advance

## Implementation

### Create an OpenAI API-Compatible Service

To integrate successfully with the Agora Conversational AI Engine, your custom LLM service must provide an interface compatible with the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat). Key requirements are as follows:

1. **Endpoint path**: Provide an endpoint that receives requests, for example, `https://your-custom-llm-service/chat/completions`.
2. **Request format**: Accept request parameters compatible with the OpenAI API protocol.
3. **Response format**: Return streaming responses that are compatible with the OpenAI API protocol and compliant with SSE.

The following sample code shows how to implement an OpenAI API-compatible interface:

#### Python

```python
class TextContent(BaseModel):
    type: str = "text"
    text: str

class ImageContent(BaseModel):
    type: str = "image"
    image_url: HttpUrl

class AudioContent(BaseModel):
    type: str = "input_audio"
    input_audio: Dict[str, str]

class ToolFunction(BaseModel):
    name: str
    description: Optional[str]
    parameters: Optional[Dict]
    strict: bool = False

class Tool(BaseModel):
    type: str = "function"
    function: ToolFunction

class ToolChoice(BaseModel):
    type: str = "function"
    function: Optional[Dict]

class ResponseFormat(BaseModel):
    type: str = "json_schema"
    json_schema: Optional[Dict[str, str]]

class SystemMessage(BaseModel):
    role: str = "system"
    content: Union[str, List[str]]

class UserMessage(BaseModel):
    role: str = "user"
    content: Union[str, List[Union[TextContent, ImageContent, AudioContent]]]

class AssistantMessage(BaseModel):
    role: str = "assistant"
    content: Union[str, List[TextContent]] = None
    audio: Optional[Dict[str, str]] = None
    tool_calls: Optional[List[Dict]] = None

class ToolMessage(BaseModel):
    role: str = "tool"
    content: Union[str, List[str]]
    tool_call_id: str

# Define the complete request schema
class ChatCompletionRequest(BaseModel):
    context: Optional[Dict] = None  # Context information
    model: Optional[str] = None  # Model name to use
    messages: List[Union[SystemMessage, UserMessage, AssistantMessage, ToolMessage]]  # Message list
    response_format: Optional[ResponseFormat] = None  # Response format
    modalities: List[str] = ["text"]  # Use text modality by default
    audio: Optional[Dict[str, str]] = None  # Assistant audio response
    tools: Optional[List[Tool]] = None  # Tool list
    tool_choice: Optional[Union[str, ToolChoice]] = "auto" # Tool selection
    parallel_tool_calls: bool = True  # Whether to call tools in parallel
    stream: bool = True  # Use streaming responses by default
    stream_options: Optional[Dict] = None  # Streaming options

@app.post("/chat/completions")
async def create_chat_completion(request: ChatCompletionRequest):
    try:
        logger.info(f"Received request: {request.model_dump_json()}")
        client = AsyncOpenAI(api_key=os.getenv("YOUR_LLM_API_KEY"))
        response = await client.chat.completions.create(
            model=request.model,
            messages=request.messages,  # Use request messages directly
            tool_choice=(
                request.tool_choice if request.tools and request.tool_choice else None
            ),
            tools=request.tools if request.tools else None,
            modalities=request.modalities,
            audio=request.audio,
            response_format=request.response_format,
            stream=request.stream,
            stream_options=request.stream_options,
        )
        if not request.stream:
            raise HTTPException(
                status_code=400, detail="chat completions require streaming"
            )

        async def generate():
            try:
                async for chunk in response:
                    logger.debug(f"Received chunk: {chunk}")
                    yield f"data: {json.dumps(chunk.to_dict())}\n\n"
                yield "data: [DONE]\n\n"
            except asyncio.CancelledError:
                logger.info("Request was cancelled")
                raise

        return StreamingResponse(generate(), media_type="text/event-stream")
    except asyncio.CancelledError:
        logger.info("Request was cancelled")
        raise HTTPException(status_code=499, detail="Request was cancelled")
    except Exception as e:
        traceback_str = "".join(traceback.format_tb(e.__traceback__))
        error_message = f"{str(e)}\n{traceback_str}"
        logger.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)
```

#### Go

```go
type (
	AudioContent struct {
		InputAudio map[string]string `json:"input_audio"`
		Type       string            `json:"type"`
	}

	// Complete request schema
	ChatCompletionRequest struct {
		// Assistant audio response
		Audio map[string]string `json:"audio,omitempty"`
		// Context information
		Context map[string]any `json:"context,omitempty"`
		// Message list
		Messages []Message `json:"messages"`
		// Use text modality by default
		Modalities []string `json:"modalities"`
		// Model name to use
		Model string `json:"model,omitempty"`
		// Whether to call tools in parallel
		ParallelToolCalls bool `json:"parallel_tool_calls"`
		// Response format
		ResponseFormat *ResponseFormat `json:"response_format,omitempty"`
		// Whether to use streaming responses
		Stream bool `json:"stream"`
		// Streaming options
		StreamOptions map[string]any `json:"stream_options,omitempty"`
		// Tool selection strategy, default is "auto"
		ToolChoice any `json:"tool_choice,omitempty"`
		// Tool list
		Tools []Tool `json:"tools,omitempty"`
	}

	ImageContent struct {
		ImageURL string `json:"image_url"`
		Type     string `json:"type"`
	}

	Message struct {
		Audio      map[string]string `json:"audio,omitempty"`
		Content    any               `json:"content"`
		Role       string            `json:"role"`
		ToolCallID string            `json:"tool_call_id,omitempty"`
		ToolCalls  []map[string]any  `json:"tool_calls,omitempty"`
	}

	ResponseFormat struct {
		JSONSchema map[string]string `json:"json_schema,omitempty"`
		Type       string            `json:"type"`
	}

	TextContent struct {
		Text string `json:"text"`
		Type string `json:"type"`
	}

	Tool struct {
		Function ToolFunction `json:"function"`
		Type     string       `json:"type"`
	}

	ToolChoice struct {
		Function map[string]any `json:"function,omitempty"`
		Type     string         `json:"type"`
	}

	ToolFunction struct {
		Description string         `json:"description,omitempty"`
		Name        string         `json:"name"`
		Parameters  map[string]any `json:"parameters,omitempty"`
		Strict      bool           `json:"strict"`
	}
)

var waitingMessages = []string{
	"Just a moment, I'm thinking...",
	"Let me think about that for a second...",
	"Good question, let me find out...",
}

// Chat Completion server
type Server struct {
	client *openai.Client
	logger *slog.Logger
}

// Create a new server instance
func NewServer(apiKey string) *Server {
	return &Server{
		client: openai.NewClient(apiKey),
		logger: slog.New(slog.NewJSONHandler(os.Stdout, nil)),
	}
}

// Handle the Chat Completion endpoint
func (s *Server) handleChatCompletion(c *gin.Context) {
	var request ChatCompletionRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		s.sendError(c, http.StatusBadRequest, err)
		return
	}

	if !request.Stream {
		s.sendError(c, http.StatusBadRequest, fmt.Errorf("chat completions require streaming"))
		return
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")

	responseChan := make(chan any, 100)
	errorChan := make(chan error, 1)

	go func() {
		messages := make([]openai.ChatCompletionMessage, len(request.Messages))
		for i, msg := range request.Messages {
			if strContent, ok := msg.Content.(string); ok {
				messages[i] = openai.ChatCompletionMessage{
					Role:    msg.Role,
					Content: strContent,
				}
			}
		}

		req := openai.ChatCompletionRequest{
			Model:    request.Model,
			Messages: messages,
			Stream:   true,
		}

		if len(request.Tools) > 0 {
			tools := make([]openai.Tool, len(request.Tools))

			for i, tool := range request.Tools {
				tools[i] = openai.Tool{
					Type: openai.ToolTypeFunction,
					Function: &openai.FunctionDefinition{
						Name:        tool.Function.Name,
						Description: tool.Function.Description,
						Parameters:  tool.Function.Parameters,
					},
				}
			}

			req.Tools = tools
		}

		stream, err := s.client.CreateChatCompletionStream(c.Request.Context(), req)
		if err != nil {
			errorChan <- err
			return
		}

		defer stream.Close()

		for {
			response, err := stream.Recv()
			if err == io.EOF {
				break
			}

			if err != nil {
				errorChan <- err
				return
			}

			responseChan <- response
		}

		close(responseChan)
	}()

	for {
		select {
		case chunk, ok := <-responseChan:
			if !ok {
				c.SSEvent("data", "[DONE]")
				return
			}

			data, _ := json.Marshal(chunk)
			c.SSEvent("data", string(data))
		case err := <-errorChan:
			s.logger.Error("Error in chat completion stream", "err", err)
			s.sendError(c, http.StatusInternalServerError, err)
			return
		}
	}
}

// Send an error response to the client
func (s *Server) sendError(c *gin.Context, status int, err error) {
	c.JSON(status, gin.H{"detail": err.Error()})
}

func main() {
	// Initialize the server
	server := NewServer(os.Getenv("YOUR_LLM_API_KEY"))

	// Initialize Gin routes
	r := gin.Default()

	// Configure routes
	r.POST("/chat/completions", server.handleChatCompletion)

	// Start the server
	r.Run(":8000")
}
```

### Configure the Agora Conversational AI Engine

When calling [POST Create a Conversational AI Agent](../operations/start-agent.md), point the LLM configuration to your custom service:

> Info
> If access to your custom LLM service requires authentication, pass your credentials in the `api_key` field.

```json
{
  "llm": {
    // highlight-start
    "url": "https://your-custom-llm-service/chat/completions",
    "api_key": "",
    // highlight-end
    "system_messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      }
    ]
  }
}
```

## Advanced Features

### Implement Retrieval-Augmented Generation

If you want to improve the accuracy and relevance of agent responses, you can use retrieval-augmented generation (RAG) so that your custom LLM retrieves information from a specific knowledge base and then uses the retrieved results as context to generate an answer.

The following sample code demonstrates a mock flow that retrieves content from a knowledge base and exposes a `/rag/chat/completions` endpoint so the LLM can generate answers by using RAG retrieval results:

#### Python

```python
async def perform_rag_retrieval(messages: Optional[Dict]) -> str:
    """
    Retrieve relevant content from the knowledge base based on the message list by using a RAG model

    Args:
        messages: Original message list

    Returns:
        str: Retrieved text content
    """

    # TODO: Implement actual RAG retrieval logic
    # Depending on your requirements, you can use the first or last message in the list as the query
    # and then send that query to the RAG model to retrieve relevant content

    # Return the retrieved result
    return "This is relevant content retrieved from the knowledge base."

def refact_messages(context: str, messages: Optional[Dict] = None) -> Optional[Dict]:
    """
    Adjust the message list by adding the retrieved context to the original message list

    Args:
        context: Retrieved context
        messages: Original message list

    Returns:
        List: Adjusted message list
    """

    # TODO: Implement actual message adjustment logic
    # This should add the retrieved context to the original message list

    return messages

# Random waiting messages
waiting_messages = [
    "Just a moment, I'm thinking...",
    "Let me think about that for a second...",
    "Good question, let me find out...",
]

@app.post("/rag/chat/completions")
async def create_rag_chat_completion(request: ChatCompletionRequest):
    try:
        logger.info(f"Received RAG request: {request.model_dump_json()}")
        if not request.stream:
            raise HTTPException(
                status_code=400, detail="chat completions require streaming"
            )

        async def generate():
            # First send a "please wait" prompt
            waiting_message = {
                "id": "waiting_msg",
                "choices": [
                    {
                        "index": 0,
                        "delta": {
                            "role": "assistant",
                            "content": random.choice(waiting_messages),
                        },
                        "finish_reason": None,
                    }
                ],
            }
            yield f"data: {json.dumps(waiting_message)}\n\n"

            # Perform RAG retrieval
            retrieved_context = await perform_rag_retrieval(request.messages)

            # Adjust messages
            refacted_messages = refact_messages(retrieved_context, request.messages)

            # Request LLM completion
            client = AsyncOpenAI(api_key=os.getenv("<YOUR_LLM_API_KEY>"))
            response = await client.chat.completions.create(
                model=request.model,
                messages=refacted_messages,
                tool_choice=(
                    request.tool_choice
                    if request.tools and request.tool_choice
                    else None
                ),
                tools=request.tools if request.tools else None,
                modalities=request.modalities,
                audio=request.audio,
                response_format=request.response_format,
                stream=True,  # Force streaming
                stream_options=request.stream_options,
            )

            try:
                async for chunk in response:
                    logger.debug(f"Received RAG chunk: {chunk}")
                    yield f"data: {json.dumps(chunk.to_dict())}\n\n"
                yield "data: [DONE]\n\n"
            except asyncio.CancelledError:
                logger.info("RAG stream was cancelled")
                raise

        return StreamingResponse(generate(), media_type="text/event-stream")

    except asyncio.CancelledError:
        logger.info("RAG request was cancelled")
        raise HTTPException(status_code=499, detail="Request was cancelled")
    except Exception as e:
        traceback_str = "".join(traceback.format_tb(e.__traceback__))
        error_message = f"{str(e)}\n{traceback_str}"
        logger.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)
```

#### Go

```go
// Handle the RAG Chat Completion endpoint
func (s *Server) handleRAGChatCompletion(c *gin.Context) {
	var request ChatCompletionRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		s.sendError(c, http.StatusBadRequest, err)
		return
	}

	if !request.Stream {
		s.sendError(c, http.StatusBadRequest, fmt.Errorf("chat completions require streaming"))
		return
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")

	// First send a "please wait" prompt
	waitingMsg := map[string]any{
		"id": "waiting_msg",
		"choices": []map[string]any{
			{
				"index": 0,
				"delta": map[string]any{
					"role":    "assistant",
					"content": waitingMessages[rand.Intn(len(waitingMessages))],
				},
				"finish_reason": nil,
			},
		},
	}
	data, _ := json.Marshal(waitingMsg)
	c.SSEvent("data", string(data))

	// Perform RAG retrieval
	retrievedContext, err := s.performRAGRetrieval(request.Messages)
	if err != nil {
		s.logger.Error("Failed to perform RAG retrieval", "err", err)
		s.sendError(c, http.StatusInternalServerError, err)
		return
	}

	// Adjust messages
	refactedMessages := s.refactMessages(retrievedContext, request.Messages)

	// Convert messages to OpenAI format
	messages := make([]openai.ChatCompletionMessage, len(refactedMessages))
	for i, msg := range refactedMessages {
		if strContent, ok := msg.Content.(string); ok {
			messages[i] = openai.ChatCompletionMessage{
				Role:    msg.Role,
				Content: strContent,
			}
		}
	}

	req := openai.ChatCompletionRequest{
		Model:    request.Model,
		Messages: messages,
		Stream:   true,
	}

	stream, err := s.client.CreateChatCompletionStream(c.Request.Context(), req)
	if err != nil {
		s.sendError(c, http.StatusInternalServerError, err)
		return
	}

	defer stream.Close()

	for {
		response, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			s.sendError(c, http.StatusInternalServerError, err)
			return
		}
		data, _ := json.Marshal(response)
		c.SSEvent("data", string(data))
	}

	c.SSEvent("data", "[DONE]")
}

// performRAGRetrieval retrieves relevant content from the knowledge base based on the message list by using a RAG model.
//
// messages: Contains the original message list.
//
// Returns the retrieved text content and any error that occurs during retrieval.
func (s *Server) performRAGRetrieval(messages []Message) (string, error) {
	// TODO: Implement actual RAG retrieval logic
	// Depending on your requirements, you may need to use the first or last message in the list as the query
	// and then send that query to the RAG model to retrieve relevant content

	// Return the retrieved result
	return "This is relevant content retrieved from the knowledge base.", nil
}

// refactMessages adjusts the message list by adding the retrieved context to the original message list.
//
// context: Contains the retrieved context.
// messages: Contains the original message list.
//
// Returns the adjusted message list.
func (s *Server) refactMessages(context string, messages []Message) []Message {
	// TODO: Implement actual message adjustment logic
	// This should add the retrieved context to the original message list

	// Return only the original messages
	return messages
}
```

When calling [POST Create a Conversational AI Agent](../operations/start-agent.md), simply point the LLM URL to your RAG endpoint:

> Info
> If access to your custom LLM service requires authentication, pass your credentials in the `api_key` field.

```json
{
  "llm": {
    "url": "http://your-custom-llm-service/rag/chat/completions",
    "api_key": "",
    "system_messages": [
      {
        "role": "system",
        "content": "Please answer the user's question based on the following retrieved information: ..."
      }
    ]
  }
}
```

### Implement Multimodal Capabilities

The Agora Conversational AI Engine supports multimodal LLM output in both text and audio. You can create a dedicated multimodal endpoint to implement more personalized capabilities.

> Info
> To learn more about audio modality output, see [Use Audio Modality Output](./audio-modality.md).

The following sample code shows a flow that reads text and audio files and sends them to the LLM to generate an audio response:

#### Python

```python
async def read_text_file(file_path: str) -> str:
    """
    Read a text file and return its contents

    Args:
        file_path: Path to the text file

    Returns:
        str: Contents of the text file

    """
    async with aiofiles.open(file_path, "r") as file:
        content = await file.read()

    return content

async def read_pcm_file(
    file_path: str, sample_rate: int, duration_ms: int
) -> List[bytes]:
    """
    Read a PCM file and return a list of audio chunks

    Args:
        file_path: Path to the PCM file
        sample_rate: Audio sample rate
        duration_ms: Duration of each audio chunk, in milliseconds

    Returns:
        List: List of audio chunks

    """

    async with aiofiles.open(file_path, "rb") as file:
        content = await file.read()

    chunk_size = int(sample_rate * 2 * (duration_ms / 1000))
    return [content[i : i + chunk_size] for i in range(0, len(content), chunk_size)]

@app.post("/audio/chat/completions")
async def create_audio_chat_completion(request: ChatCompletionRequest):
    try:
        logger.info(f"Received audio request: {request.model_dump_json()}")

        if not request.stream:
            raise HTTPException(
                status_code=400, detail="chat completions require streaming"
            )

        # Sample usage: read text and audio files
        # Replace with your actual logic

        text_file_path = "./file.txt"
        pcm_file_path = "./file.pcm"
        sample_rate = 16000  # Example sample rate
        duration_ms = 40  # 40 ms audio chunks

        text_content = await read_text_file(text_file_path)
        audio_chunks = await read_pcm_file(pcm_file_path, sample_rate, duration_ms)

        async def generate():
            try:
                # Send text content
                audio_id = uuid.uuid4().hex
                text_message = {
                    "id": uuid.uuid4().hex,
                    "choices": [
                        {
                            "index": 0,
                            "delta": {
                                "audio": {
                                    "id": audio_id,
                                    "transcript": text_content,
                                },
                            },
                            "finish_reason": None,
                        }
                    ],
                }
                yield f"data: {json.dumps(text_message)}\n\n"

                # Send audio chunks
                for chunk in audio_chunks:
                    audio_message = {
                        "id": uuid.uuid4().hex,
                        "choices": [
                            {
                                "index": 0,
                                "delta": {
                                    "audio": {
                                        "id": audio_id,
                                        "data": base64.b64encode(chunk).decode("utf-8"),
                                    },
                                },
                                "finish_reason": None,
                            }
                        ],
                    }
                    yield f"data: {json.dumps(audio_message)}\n\n"

                yield "data: [DONE]\n\n"

            except asyncio.CancelledError:
                logger.info("Audio stream was cancelled")
                raise

        return StreamingResponse(generate(), media_type="text/event-stream")

    except asyncio.CancelledError:
        logger.info("Audio request was cancelled")
        raise HTTPException(status_code=499, detail="Request was cancelled")
    except Exception as e:
        traceback_str = "".join(traceback.format_tb(e.__traceback__))
        error_message = f"{str(e)}\n{traceback_str}"
        logger.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)
```

#### Go

```go
// Handle the audio Chat Completion endpoint
func (s *Server) handleAudioChatCompletion(c *gin.Context) {
	var request ChatCompletionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		s.sendError(c, http.StatusBadRequest, err)
		return
	}

	if !request.Stream {
		s.sendError(c, http.StatusBadRequest, fmt.Errorf("chat completions require streaming"))
		return
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")

	// Read text and audio files
	textContent, err := s.readTextFile("./file.txt")
	if err != nil {
		s.logger.Error("Failed to read text file", "err", err)
		s.sendError(c, http.StatusInternalServerError, err)
		return
	}

	sampleRate := 16000 // Example sample rate
	durationMs := 40    // 40 ms chunks
	audioChunks, err := s.readPCMFile("./file.pcm", sampleRate, durationMs)
	if err != nil {
		s.logger.Error("Failed to read PCM file", "err", err)
		s.sendError(c, http.StatusInternalServerError, err)
		return
	}

	// Send text content
	audioID := uuid.New().String()
	textMessage := map[string]any{
		"id": uuid.New().String(),
		"choices": []map[string]any{
			{
				"index": 0,
				"delta": map[string]any{
					"audio": map[string]any{
						"id":         audioID,
						"transcript": textContent,
					},
				},
				"finish_reason": nil,
			},
		},
	}

	data, _ := json.Marshal(textMessage)
	c.SSEvent("data", string(data))

	// Send audio chunks
	for _, chunk := range audioChunks {
		audioMessage := map[string]any{
			"id": uuid.New().String(),
			"choices": []map[string]any{
				{
					"index": 0,
					"delta": map[string]any{
						"audio": map[string]any{
							"id":   audioID,
							"data": base64.StdEncoding.EncodeToString(chunk),
						},
					},
					"finish_reason": nil,
				},
			},
		}
		data, _ := json.Marshal(audioMessage)
		c.SSEvent("data", string(data))
	}

	c.SSEvent("data", "[DONE]")
}

// readPCMFile reads a PCM file and returns audio chunks.
//
// filePath: Specifies the path to the PCM file.
// sampleRate: Specifies the sample rate of the audio.
// durationMs: Specifies the duration of each audio chunk, in milliseconds.
//
// Returns a list of audio chunks and any error that occurs during reading.
func (s *Server) readPCMFile(filePath string, sampleRate int, durationMs int) ([][]byte, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read PCM file: %w", err)
	}

	chunkSize := int(float64(sampleRate) * 2 * float64(durationMs) / 1000.0)
	if chunkSize == 0 {
		return nil, fmt.Errorf("invalid chunk size: sample rate %d, duration %dms", sampleRate, durationMs)
	}

	chunks := make([][]byte, 0, len(data)/chunkSize+1)

	for i := 0; i < len(data); i += chunkSize {
		end := i + chunkSize
		if end > len(data) {
			end = len(data)
		}
		chunks = append(chunks, data[i:end])
	}

	return chunks, nil
}

// readTextFile reads a text file and returns its contents.
//
// filePath: Specifies the path to the text file.
//
// Returns the contents of the text file and any error that occurs during reading.
func (s *Server) readTextFile(filePath string) (string, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to read text file: %w", err)
	}
	return string(data), nil
}
```

When calling [POST Create a Conversational AI Agent](../operations/start-agent.md), use a configuration like the following:

```json
{
  "llm": {
    "url": "http://your-custom-llm-service/audio/chat/completions",
    "api_key": "your_api_key",
    // highlight-start
    "input_modalities": ["text"],
    "output_modalities": ["text", "audio"],
    // highlight-end
    "system_messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      }
    ]
  }
}
```

## Pass Parameters Through a Special First-Chunk Response

In streaming response (SSE) scenarios, a single LLM reply is split into multiple chunks for transmission. The Agora Conversational AI Engine can process a special first-chunk LLM response whose `object` is `chat.completion.custom_metadata`, and use the `metadata` field in that special first chunk to implement the following advanced features:

- [Configure Whether LLM Responses Can Be Interrupted](#configure-whether-llm-responses-can-be-interrupted)
- [Update TTS Parameters in Real Time](#update-tts-parameters-in-real-time)

To do this, you need to modify your custom LLM service so that it outputs the special first-chunk response required by the Conversational AI Engine.

> Note
> The Conversational AI Engine only processes the **first chunk** whose `object` is `chat.completion.custom_metadata`, and ignores the content in `choices`. Subsequent responses are treated as normal responses and do not apply metadata configuration. Therefore, make sure any content that needs to be spoken by TTS is generated in the second and subsequent responses.

The following sequence diagram shows the data flow among the user, the Conversational AI Engine, and the custom LLM:

![Custom LLM Metadata Configuration Flow](https://doc.shengwang.cn/img/convoai/custom-llm-metadata-flow.svg)

### Configure Whether LLM Responses Can Be Interrupted

The Conversational AI Engine allows the custom LLM to determine whether the current reply can be interrupted by user input. This ensures that the agent is not interrupted while speaking important information such as regulations, policies, or product pricing.

**Use Cases**

- Do not allow interruptions when the agent is reading important regulations or policy information.
- Ensure uninterrupted playback when the agent is reading key information such as product pricing or contract terms.

**First-Chunk Response Structure**

You need to modify your custom LLM service so that it outputs a first-chunk response with the following structure:

```json
{
    "id": "response-id",
    "object": "chat.completion.custom_metadata",
    "choices": [],
    "metadata": {
        "interruptable": false
    }
}
```

The `interruptable` field controls whether TTS playback of the current LLM response can be interrupted by user speech:

- If the `interruptable` field does not exist, is empty, or has an invalid value, the current interruption mode remains unchanged.
- If `interruptable` is `false`, the current response cannot be interrupted.
- If `interruptable` is `true`, the current response can be interrupted.

### Update TTS Parameters in Real Time

The Conversational AI Engine supports updating TTS parameters in real time during a conversation to create a more immersive conversational experience.

**Use Cases**

- The custom LLM detects that the user wants the agent to switch to a different voice or timbre.
- The custom LLM detects that the user is happy and dynamically increases TTS volume, pitch, or speaking rate so the agent response better matches the user's mood.

**First-Chunk Response Structure**

You need to modify your custom LLM service so that when the LLM determines TTS parameters need to be updated, it outputs a first-chunk response with the following structure:

```json
{
    "id": "response-id",
    "object": "chat.completion.custom_metadata",
    "choices": [],
    "metadata": {
        "tts_params": {
			"params": {
				"voice_type": "female_1",
				"rate": 1.1
			}
		}
    }
}
```

The `tts_params.params` field is used to configure TTS parameters. Refer to the official documentation of your TTS provider for the descriptions of the parameters you want to customize.

## Reference

### Sample Project

Agora provides an open-source sample project for reference. You can download it or view its source code.

- [Conversational-AI-Server-Sample](https://github.com/Shengwang-Community/Conversational-AI-Server-Sample)

### API Standards

Your custom LLM service must be compatible with the interface standards of the OpenAI Chat Completions API:

- **Request format**: Includes parameters such as model, messages, and tool-calling configuration
- **Response format**: Includes the model-generated reply, metadata, and other information
- **Streaming response**: Complies with the SSE (Server-Sent Events) specification

For detailed interface standards, see:

- [OpenAI Chat Completions API documentation](https://platform.openai.com/docs/api-reference/chat)
- [Agora Conversational AI Engine API documentation](../operations/start-agent.md)
