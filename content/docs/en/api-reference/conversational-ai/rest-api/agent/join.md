---
title: Start a conversational AI agent
description: Create and start a Conversational AI agent instance.
---
Use this endpoint to create and start a conversational AI agent instance.

## Request

### Path parameters

  The App ID of the project.

### Request body

<div className="api-mime-type">APPLICATION/JSON</div>

  
    The unique identifier of the agent. The same identifier cannot be used repeatedly.
  
  
    A comma-separated string of one or more presets. Each preset provides a predefined configuration for ASR, LLM, and TTS. You can specify a preset for any or all of ASR, LLM, and TTS. When a preset is specified, you do not need to provide the endpoint URL, API key, or model for the preset providers. Use the `asr`, `llm`, and `tts` fields to configure additional settings.

    <details>
    <summary>Available presets</summary>

    - **ASR**
      - [deepgram_nova_2](../../../../ai/models/asr/deepgram.md#use-a-preset)
      - [deepgram_nova_3](../../../../ai/models/asr/deepgram.md#use-a-preset)
    - **LLM**
      - [openai_gpt_4o_mini](../../../../ai/models/llm/openai.md#use-a-preset)
      - [openai_gpt_4_1_mini](../../../../ai/models/llm/openai.md#use-a-preset)
      - [openai_gpt_5_nano](../../../../ai/models/llm/openai.md#use-a-preset)
      - [openai_gpt_5_mini](../../../../ai/models/llm/openai.md#use-a-preset)
    - **TTS**
      - [minimax_speech_2_6_turbo](../../../../ai/models/tts/minimax.md#use-a-preset)
      - [minimax_speech_2_8_turbo](../../../../ai/models/tts/minimax.md#use-a-preset)
      - [openai_tts_1](../../../../ai/models/tts/openai.md#use-a-preset)
    </details>

  
  
    The unique ID of a published agent in [Agent Studio](../../../../ai/studio/index.md). When provided, the saved agent configuration is used as the base configuration. Any fields specified in `properties` override the corresponding agent settings. When you specify a `pipeline_id`, the `asr`, `tts`, and `llm` fields in `properties` are optional.
  

  
    Configuration details of the agent.
    
      The name of the channel to join.
    
    
      The authentication token used by the agent to join the channel.
    
    
      The user ID of the agent in the channel. All UIDs within an RTC channel must be unique. Ensure no other user or service bot is using this UID. A value of `0` means that a unique random UID is generated and assigned. Set the `token` accordingly.
    
    
      A list of user IDs that the agent subscribes to in the channel. Only subscribed users can interact with the agent.      
      > **Info**
> Currently, only one user ID is supported.
     
    
    
      Whether to enable String uid:
      <ul>
        <li>`true`: Both agent and subscriber user IDs use strings.</li>
        <li>`false`: Both agent and subscriber user IDs must be integers.</li>
      </ul>
    

    
      Sets the timeout after all the users specified in `remote_rtc_uids` are detected to have left the channel. When the timeout value is exceeded, the agent automatically stops and exits the channel. A value of `0` means that the agent does not exit until it is stopped manually.
      
      > **Agent lifecycle best practice**
> For precise and reliable control over the agent's lifecycle, use the [`leave`](leave.md) API to terminate the agent as soon as its task is complete.
    

    
      Regional access restriction configuration. Use this to limit which Agora servers the Conversational AI Engine can access based on geographic regions.
  
      
        The allowed region for server access.
      
      
        The excluded region. Only available when `area` is set to `GLOBAL`.
      
    

    
      Advanced features configuration.

      
        Use [mllm.enable](#properties-mllm-enable) instead.

        Enable Multimodal Large Language Model for voice-to-voice processing. Enabling MLLM automatically disables ASR, LLM, and TTS since the MLLM handles end-to-end voice processing directly. See `turn_detection.type` for turn detection options available with MLLM.
      

      
        Whether to enable the Signaling (RTM) service. When enabled, the agent can combine the capabilities provided by Signaling to implement advanced functions, such as delivering [custom information](../../../../ai/build/custom-information.md).
        > **Info**
> Before enabling the Signaling service, make sure the token includes both RTC and RTM privileges. When an agent joins an RTM channel, it reuses the token specified in the `token` field. For more information, see ["How can I generate a token with both RTC and Signaling privileges?"](https://doc.shengwang.cn/help/integration-issues/rtc_rtm_token).
      

      
        Enable Selective Attention Locking (SAL). When enabled, configure the `sal` field to set up speaker recognition or locking modes. See the `sal` parameter for configuration details.
      

      
        Enable tool invocation. When enabled, the agent can invoke tools provided by the MCP server to implement advanced functionality.
      
    

    
      Automatic Speech Recognition (ASR) configuration.

      
        The BCP-47 language tag identifying the primary language used for agent interaction. If `params` contains a vendor-specific language code, it takes precedence over this setting.
      

      
      ASR provider:
      - `ares`: [Adaptive Recognition Engine for Speech](../../../../ai/models/asr/ares.md)
      - `microsoft`: [Microsoft Azure](../../../../ai/models/asr/microsoft.md)
      - `deepgram`: [Deepgram](../../../../ai/models/asr/deepgram.md)
      - `openai`: [OpenAI (Beta)](../../../../ai/models/asr/openai.md)
      - `speechmatics`: [Speechmatics](../../../../ai/models/asr/speechmatics.md)
      - `assemblyai`: [AssemblyAI (Beta)](../../../../ai/models/asr/assembly-ai.md)
      - `amazon`: [Amazon Transcribe (Beta)](../../../../ai/models/asr/amazon.md)
      - `google`: [Google (Beta)](../../../../ai/models/asr/google.md)
      - `sarvam`: [Sarvam (Beta)](../../../../ai/models/asr/sarvam.md)
      
      

      
        The configuration parameters for the ASR vendor. See [ASR Overview](../../../../ai/models/asr/index.md) for details.
      
    
  
    
      Text-to-speech (TTS) module configuration.

      
        TTS provider. 
        - `microsoft`: [Microsoft Azure](../../../../ai/models/tts/microsoft.md)
        - `elevenlabs`: [ElevenLabs](../../../../ai/models/tts/elevenlabs.md)
        - `minimax`: [MiniMax](../../../../ai/models/tts/minimax.md)
        - `deepgram`: [Deepgram (Beta)](../../../../ai/models/tts/deepgram.md)
        - `murf`: [Murf (Beta)](../../../../ai/models/tts/murf.md)
        - `cartesia` : [Cartesia (Beta)](../../../../ai/models/tts/cartesia.md)
        - `openai`: [OpenAI (Beta)](../../../../ai/models/tts/openai.md)
        - `humeai`: [Hume AI (Beta)](../../../../ai/models/tts/humeai.md)
        - `rime`: [Rime (Beta)](../../../../ai/models/tts/rime.md)
        - `fishaudio`: [Fish Audio (Beta)](../../../../ai/models/tts/fish-audio.md)
        - `google`: [Google (Beta)](../../../../ai/models/tts/google.md)
        - `amazon`: [Amazon Polly (Beta)](../../../../ai/models/tts/amazon.md)
        - `sarvam`: [Sarvam (Beta)](../../../../ai/models/tts/sarvam.md)

      

      
        The configuration parameters for the TTS vendor. See [TTS Overview](../../../../ai/models/tts/index.md) for details.
      

      
        Controls whether the TTS module skips bracketed content when reading LLM response text. This prevents the agent from vocalizing structural prompt information like tone indicators, action descriptions, and system prompts, creating a more natural and immersive listening experience. Enable this feature by specifying one or more values:
        
        - `1`: Skip content in Chinese parentheses `（）`
        - `2`: Skip content in Chinese square brackets `【】`
        - `3`: Skip content in parentheses `( )`
        - `4`: Skip content in square brackets `[ ]`
        - `5`: Skip content in curly braces `{ }`

        > **Info**
> - **Nested brackets**: When input text contains nested brackets and multiple bracket types are configured to be skipped, the system processes only the outermost brackets. The system matches from the beginning of the text and skips the first outermost bracket pair that meets the skip rule, including all nested content.
>         - **Agent memory**: The agent's short-term memory always contains the complete, unfiltered LLM text, regardless of live captioning settings.
>         - **Real-time transcript**: When enabled, transcript excludes filtered content during TTS playback but restores the complete text after each sentence finishes.
      
    

    
      Large language model (LLM) configuration.

      
        The LLM callback address.
      

      
        The LLM verification API key. The default value is an empty string. Ensure that you enable the API key in a production environment.
      

      
        A set of predefined information used as input to the LLM, including prompt words and examples.
      

      
        Additional LLM configuration parameters, such as the `model` used, and the maximum token limit. For details about each supported LLM, refer to [Supported LLMs](../../../../ai/models/llm/index.md#supported-llms).
      

      
        The number of conversation history messages cached in the LLM. History includes user and agent dialog messages, tool call information, and timestamps. Agent and user messages are recorded separately.
      

      
        LLM input modalities: 
        - `["text"]`: Text only
        - `["text", "image"]`: Text plus image; requires the selected LLM to support visual input
      

      
        LLM output modalities: 
        - `["text"]`: The output text is converted to speech by the TTS module and then published to the RTC channel.
        - `["audio"]`: Voice only. Voice is published directly to the RTC channel.
        - `["text", "audio"]`: Text plus voice. Write your own logic to process the output of LLM as needed.
      

      
        Agent greeting broadcast configuration.

        
          Determines when the agent sends greeting messages to users joining the channel.

            - `single_every`: Broadcasts a greeting every time a user joins the channel.
            - `single_first`: Broadcasts a greeting only once to the first user who joins the channel.
        

        
          The delay in milliseconds before the agent plays the greeting message after a user joins the channel.
        
      

      
        Agent greeting. If provided, the first user in the channel is automatically greeted with the message upon joining.
      

      
        Prompt for agent activation failure. If provided, it is returned through TTS when the custom LLM call fails.
      

      
        LLM provider, supports the following settings:
        - `custom`: Custom LLM. When you set this option, the agent includes the following fields, in addition to `role` and `content` when making requests to the custom LLM:
          - `turn_id`: A unique identifier for each conversation turn. It starts from `0` and increments with each turn. One user-agent interaction corresponds to one `turn_id`.
          - `timestamp`: The request timestamp, in milliseconds.
        - `azure`: Use this value for Azure OpenAI
      

      
        The request style for chat completion:
        - `openai`: For OpenAI and OpenAI-compatible APIs
        - `gemini`: For Google Gemini and Google Vertex API format
        - `anthropic`: For Anthropic Claude API format
        - `dify`: For Dify API format

        For details, refer to [Supported LLMs](../../../../ai/models/llm/index.md#supported-llms).
      

      
        Template parameter configuration used to insert variables into the agent's `system_messages`, `greeting_message`, `failure_message`, and `parameters.silence_config.content` text. Uses key-value pairs, where the key is the variable name and the value is the variable's value. Template variables, combined with prompt customization and SIP outbound calling functionality, enable dynamic content injection, automating processes such as automatic hang-up, voicemail recognition, automatic message leaving, and call transfer.

        To insert defined variables in the prompt text, use the syntax `{{variable_name}}`. The system automatically replaces each variable with the corresponding value defined in `template_variables`.

        > **Caution**
> Variable values cannot reference other variables. For example, if you define `"farewell": "Looking forward to seeing you again, {{name}}"`, the `{{name}}` variable will not be resolved.
      

      
        MCP (Model Context Protocol) server configuration. By configuring MCP servers, agents can call tools provided by external services to implement advanced functionality.
        
        
          A unique identifier for the MCP server. Maximum 48 characters. Accepts only English letters and numbers.
        
        
        
          The endpoint address of the MCP server. The agent uses this to communicate with the MCP server.
        
        
        
          Transport protocol type. 
          - `streamable_http`: Streaming HTTP protocol
        
        
        
          HTTP header information to include when requesting the MCP server, such as authentication information.
        
        
        
          A list of tools that the agent is allowed to invoke. The agent can only use tools on this list.
          
          **Behavior:**
          - **Empty or omitted**: All tools are enabled.
          - **Empty array `[]`**: No tools are enabled.
          - **`["*"]`**: All tools are enabled.
          - **Specific tools `["aa", "bb", "cc"]`**: Only `aa`, `bb`, and `cc` are enabled.
          - **Mix with wildcard `["aa", "bb", "*"]`**: All tools are enabled (wildcard takes precedence).
        
        
        
          The MCP server request timeout in milliseconds. After timeout, the agent stops waiting for the MCP server's response and continues executing subsequent logic.
        
      
      
        Custom headers to include in requests to the LLM. Use this field to pass business-specific information such as custom fields or tenant identifiers.

        > **Caution**
> - These headers are merged with the headers generated by the Conversational AI Engine. If a key conflict occurs, the engine-generated header takes precedence. For example, authentication-related headers.
>         - Header keys are merged using exact string matching and are case-sensitive. Agora recommends using standard capitalization to avoid ambiguity from duplicate keys with different casing.
      

    

    
      Multimodal Large Language Model (MLLM) configuration for real-time audio and text processing. `mllm` is an exclusive alternative to the standard `asr` + `llm` + `tts` pipeline."

      
        Enable Multimodal Large Language Model for voice-to-voice processing. Enabling MLLM automatically disables ASR, LLM, and TTS since the MLLM handles end-to-end voice processing directly. Replaces the deprecated `advanced_features.enable_mllm`.
      

      
        The MLLM WebSocket URL for real-time communication.
      

      
        The API key used for MLLM authentication.
      

      
        Array of conversation items used for short-term memory management. Uses the same structure as `item.content` from the [OpenAI Realtime API](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create).
      

      
        Additional MLLM configuration parameters.
        - **Modalities override**: The `modalities` setting in params is overridden by `input_modalities` and `output_modalities`.
        - **Turn detection override**: The `turn_detection` setting in `params` is overridden by `mllm.turn_detection`.

        See [MLLM Overview](../../../../ai/models/mllm/index.md) for details.
      

      
        MLLM input modalities:
        - `["audio"]`: Audio only
        - `["audio", "text"]`: Audio plus text
      

      
        MLLM output modalities:
        - `["text", "audio"]`: Text plus audio
      

      
        Agent greeting message. If provided, the first user in the channel is automatically greeted with this message upon joining.
      

      
        MLLM provider. Currently supports:
        - `openai`: [OpenAI Realtime API](../../../../ai/models/mllm/openai.md)
        - `gemini`: [Google Gemini Live](../../../../ai/models/mllm/gemini.md)
        - `vertexai`: [Google Gemini Live (Vertex AI)](../../../../ai/models/mllm/google-vertex-ai.md)
      

      
        Turn detection configuration for the MLLM module.

        > **Info**
> When `mllm.turn_detection` is defined, the top-level `turn_detection` object has no effect.

        
          - `agora_vad`: Agora VAD-based detection. 
          - `server_vad`: Vendor-side VAD-based detection. Supported by OpenAI Realtime API and Gemini Live.
          - `semantic_vad`: Semantic-based detection. Supported by OpenAI Realtime API only.
        

        
          Configuration for Agora VAD-based turn detection. Applicable when `mode` is `agora_vad`.

          
            Minimum duration of speech in milliseconds required to trigger an interruption.
          
          
            Duration of audio in milliseconds to include before the detected speech start.
          
          
            Duration of silence in milliseconds required to determine end of speech.
          
          
            VAD sensitivity threshold. A higher value reduces false positives.
          
        

        
          Configuration for vendor-side VAD-based turn detection. Applicable when `mode` is `server_vad`. Parameters are passed through to the vendor.

          
            Duration of audio in milliseconds to include before the detected speech start.
          
          
            Duration of silence in milliseconds required to determine end of speech.
          
          
            VAD sensitivity threshold. Applicable to OpenAI Realtime API only.
          
          
            Idle timeout in milliseconds. Applicable to OpenAI Realtime API only.
          
          
            Sensitivity for start of speech detection. Applicable to Gemini Live only. 
          
          
            Sensitivity for end of speech detection. Applicable to Gemini Live only. 
          
        

        
          Configuration for semantic-based turn detection. Applicable when `mode` is `semantic_vad`. Supported by OpenAI Realtime API only.

          
            Controls how eagerly the model ends its turn. 
          
        
      
      

      
      Avatar configuration.

        
        Whether to enable the avatar function for the agent. To enable, set to `true` and configure the `vendor` and `params` fields.
       

        
        Avatar vendor. Supports the following values:  
        - `akool`: [Akool (Beta)](../../../../ai/models/avatar/akool.md)
        - `liveavatar`: [LiveAvatar (Beta)](../../../../ai/models/avatar/heygen.md)
        - `anam`: [Anam (Beta)](../../../../ai/models/avatar/anam.md)
       

        
        The configuration parameters for the avatar vendor. See [AI Avatar Overview](../../../../ai/models/avatar/index.md) for details.
       
      

    
      Conversation turn detection settings. Controls the logic for voice activity detection and conversation turn determination. The previous version of `turn_detection` is deprecated. Refer to [Deprecated parameters](#deprecated-parameters) for details. Agora recommends switching to the latest parameters.

      > **Info**
> This object has no effect when `mllm.enable` is true. Use [mllm.turn_detection](#properties-mllm-turn-detection) instead.

      > **Caution**
> Starting with v2.6, `turn_detection` only handles Start of Speech (SoS) and End of Speech (EoS) detection. Interruption handling strategies, including keyword-based interruption and disabling interruption, have moved to the top-level [`interruption`](#properties-interruption) field.

      This configuration supports multiple combinations of detection modes:
      - **Start of Speech (SoS)**: Supports three modes: VAD, Keyword, and Disable.
      - **End of Speech (EoS)**: Supports VAD and Semantic modes.

      
        Conversation turn detection mode:
        - `default`: Uses standard conversation turn detection configuration.
      

      
        Detailed configuration for conversation turn detection.
        
        
          Voice activity detection sensitivity. Determines the sound level in the audio signal that is considered voice activity. Lower values make it easier for the agent to detect speech, and higher values ignore weak sounds.
        
        
        
          Start of Speech (SoS) detection configuration. Determines when a user begins speaking.
          
        
          Start of speech detection mode:
          - `vad`: Based on VAD (Voice Activity Detection). Uses audio signal detection.
          - `keywords`: Deprecated. Use [`interruption.mode = "keywords"`](#properties-interruption-mode) instead.
          - `disabled`: Deprecated. Use [`interruption.enable = false`](#properties-interruption-enable) with [`interruption.disabled_config.strategy`](#properties-interruption-disabled-config-strategy) to configure the handling strategy.
        
          
          
            Start of speech detection configuration parameters. The structure and supported fields vary depending on the detection mode.
            
            > **Info**
> - The configuration type must match `mode`. For example, when `mode` is `vad`, you must provide `vad_config`.
>             - You cannot provide multiple mode configurations simultaneously.

            
            The amount of time in milliseconds that the user's voice must exceed the VAD threshold before an interruption is triggered.
            

            
            Interruption duration in milliseconds while the agent is speaking.
            

            
            The extra forward padding time in milliseconds before the processing system starts to process the speech input. This padding helps capture the beginning of speech.
            

            
            Specifies the list of keywords that trigger an interruption. When the agent detects any of these keywords in the user's speech, it immediately stops its current interaction and processes the new input.
            

            
              Voice processing strategy when the agent is interacting (speaking or thinking):
              - `append`: Append mode. Human voice does not interrupt the agent. The agent processes the human voice input after the current interaction ends.
              - `ignore`: Ignore mode. The agent ignores human voice input. If the agent receives human voice while speaking or thinking, the agent discards the input without storing it in context.
            
            
            **Configuration examples:**
            
            - `vad_config`

              ```json
              "vad_config": {
                "interrupt_duration_ms": 160,
                "speaking_interrupt_duration_ms": 160,
                "prefix_padding_ms": 800
              }
              ```

            - `keywords_config`

              ```json
              "keywords_config": {
                "interrupt_duration_ms": 160,
                "prefix_padding_ms": 800,
                "triggered_keywords": ["Are you there", "hello"]
              }       
              ```

            - `disabled_config`

              ```json
              "disabled_config": {
                  "strategy": "append"
              }              
              ```              
                        
          
        
        
        
          End of Speech (EoS) detection configuration. Determines when a user ends their speech.
          
          
            End of speech detection mode. Possible values:
            - `vad`: Based on VAD (Voice Activity Detection). Detects silence duration.
            - `semantic`: Based on semantic triggering. Uses semantic understanding to determine when conversation ends.

            > **Caution**
> When `mode` is `semantic`, EOS detection supports English and Chinese only. For unsupported languages, the engine falls back to VAD.
          
          
          
            End of speech detection configuration parameters. The structure and supported fields vary depending on the detection mode.
            
            > **Info**
> - The configuration type must match `mode`. For example, when `mode` is `vad`, you must provide `vad_config`.
>             - You cannot provide multiple mode configurations simultaneously.
            
            **Configuration examples:**

            - `vad_config`

              ```json
              "vad_config": {
                "silence_duration_ms": 640
              }
              ```
            
            - `semantic_config`

              ```json
              "semantic_config": {
                  "silence_duration_ms": 320,
                  "max_wait_ms": 3000,
                  "pause_state_enabled": true
              }
              ```
            
            
              **Default**: `640` in `vad_config`, `320` in `semantic_config`  
              Silence duration threshold in milliseconds. The minimum silence duration at the end of a speech segment,  to ensure that a brief pause does not prematurely end the speech segment.
            
            
            
              `-1` means forever.  

              Maximum wait time in milliseconds. The maximum time to wait for semantic determination. After timeout, the conversation end is determined based on the current state.
            
            
              Whether to detect user intent to pause the conversation:
              - `true`: The agent uses semantic understanding to determine if the user intends to pause the conversation. For example, when the user's input ends with phrases such as "hold on" or "just a moment", the agent waits for further input rather than treating the utterance as complete and sending it to the LLM.
              - `false`: The agent does not detect intent to pause the conversation.
            
          
        
      
    

    
      Interruption control configuration. Provides unified management of the agent's behavior when interrupted by the user.

      
        Whether to enable agent interruption:
        - `true`: Enable interruption.
        - `false`: Disable interruption. When disabled, the agent cannot be interrupted mid-response.
      

      
        The interruption trigger mode:
        - `start_of_speech`: Trigger interruption when the user starts speaking.
        - `keywords`: Trigger interruption when the user speaks a specified keyword. Configure the trigger keywords in `keywords_config`.
      

      
        Configuration for keyword-based interruption triggering. Applicable only when `mode` is `keywords`.

        
          The list of keywords that trigger an interruption. A maximum of 128 keywords is supported.
        
      

      
        Configuration for agent behavior when interruption is disabled. Applicable only when `interruption.enable` is `false`.

        
          The processing strategy when interruption is disabled:
          - `append`: User speech does not interrupt the agent. The agent processes the user's input after the current interaction ends.
          - `ignore`: The agent ignores user speech. If the agent receives user speech while speaking or thinking, it discards the input without storing it in context.
        
      
    

    
      Selective Attention Locking (SAL) configuration. **(Beta)**

      

        Selective attention lock mode. Supports the following options:

        - `locking`: Speaker Lock Mode. The agent locks onto the speaker, blocking 95% of ambient human voices and noise. You can enable this mode in two ways:

          - Seamless mode: When a user speaks loudly and clearly at the beginning of a conversation, the intelligent agent automatically recognizes the user as the speaker.
          - Personalized mode: When creating an agent, a speaker's voiceprint URL is pre-registered through the `sample_urls` field. The agent then locates the speaker based on the pre-registered voiceprint.

        - `recognition`: Voiceprint recognition mode. You can pre-register only one voiceprint URL using the `sample_urls` field. The agent identifies different speakers and suppresses other background voices and environmental noise. The target speaker is identified through the `vpids` field in the `metadata` field and sent to the LLM. Set `llm.vendor` to "custom" and refer to [Custom LLM](../../../../ai/build/custom-llm.md) for instructions on how to make the LLM process speaker information.
      

      
        The registered voiceprint URL as a key-value pair, where the key is the voiceprint name and the value is the download URL for the speaker's voiceprint. Only one voiceprint URL is supported.  
        Example:

        ```json
        {
          "speaker1": "https://example.com/speaker1.pcm"
        }
        ```

        > **Info**
> - Do not set the incoming voiceprint name to "unknown"; this is a reserved keyword used to identify unknown speakers.
>           - For a registered voiceprint, ensure that:
>             - Size: The voiceprint file does not exceed 2 MB.
>             - Duration: Contains 10 to 15 seconds of audio, with at least 8 seconds of effective audio excluding silent segments.
>             - Format: 16kHz sampling rate, 16-bit depth, mono PCM audio file. The file name extension must be ".pcm".
      
    

    
      Custom labels in key-value pair format, where the key is the label name and the value is the label value. Enables agents to carry custom business information.

      These labels are bound to the agent and returned in the `payload` field of all message notification callbacks from the conversational AI engine. Use them to implement custom business logic, such as tagging activity IDs, customer groups, and business scenarios.
    

    
      RTC media encryption configuration.
      
        The encryption key for RTC media content. The key has no length limit. Agora recommends using a 32-byte key. If no encryption key is set or if the key is empty, built-in encryption is not used.
      
      
        The salt value used for encryption. This is a Base64-encoded string that is 32 bytes long after decoding. This parameter only takes effect when `encryption_mode` is set to `7` (`AES_128_GCM2`) or `8` (`AES_256_GCM2`). Ensure that the salt parameter is not empty for these encryption modes.
      
      
        The built-in encryption mode. 
          - `1`: `AES_128_XTS` - 128-bit AES encryption, XTS mode.
          - `2`: `AES_128_ECB` - 128-bit AES encryption, ECB mode.
          - `3`: `AES_256_XTS` - 256-bit AES encryption, XTS mode.
          - `4`: `SM4_128_ECB` - 128-bit SM4 encryption, ECB mode.
          - `5`: `AES_128_GCM` - 128-bit AES encryption, GCM mode.
          - `6`: `AES_256_GCM` - 256-bit AES encryption, GCM mode.
          - `7`: `AES_128_GCM2` - 128-bit AES encryption, GCM mode. Requires setting `encryption_salt`.
          - `8`: `AES_256_GCM2` - 256-bit AES encryption, GCM mode. Requires setting `encryption_salt`.

        Agora recommends using either `7` (`AES_128_GCM2`) or `8` (`AES_256_GCM2`) mode. Both modes support cryptographic salts to enhance security.
                  
    

    
      Filler word configuration. Plays filler words while waiting for LLM responses to reduce user anxiety and improve conversation flow.
      
      Filler word playback follows these rules:
      - **Playback order**: When multiple filler words or LLM responses are waiting to be played, they are played in the order they arrive.
      - **Interruption control**: Inherits the interruption mode setting from the [`interruption`](#properties-interruption) field.
      
      
        Whether to enable filler words:
        - `true`: Enable filler words.
        - `false`: Disable filler words.
      
      
      
        Filler word trigger configuration. Defines when to trigger filler word playback.
        
        
          Filler word trigger mode:
          - `fixed_time`: Fixed time trigger. Triggers filler word playback when LLM response wait time exceeds the threshold.
        
        
        
          Filler word trigger configuration parameters. The parameter name and structure vary depending on the trigger mode.
          
          > **Info**
> - The configuration type must match `mode`. For example, when `mode` is `fixed_time`, you must provide `fixed_time_config`.
>           - You cannot provide multiple mode configurations simultaneously.
          
          **Configuration example:**           

          ```json
          "fixed_time_config": {
            "response_wait_ms": 1500
          }
          ```
          
          
            LLM response wait threshold in milliseconds. Triggers filler word playback when the LLM waits this duration without generating a response, such as when waiting for RAG retrieval or tool call results.
          
        
      
      
      
        Filler word content configuration. Defines the source and selection rules for filler words.
        
        
          Filler word content mode:
          - `static`: Static filler words. Uses a predefined list of filler words.
        
        
        
          Filler word content configuration parameters. The parameter name and structure vary depending on the content mode.
          
          > **Info**
> - The configuration type must match `mode`. For example, when `mode` is `static`, you must provide `static_config`.
>           - You cannot provide multiple mode configurations simultaneously.
          
          **Static filler word configuration example:**

          ```json
          "static_config": {
            "phrases": [
              "Please wait.",
              "Okay.",
              "Uh-huh."
            ],
            "selection_rule": "shuffle"
          }
          ```
          
          
            List of filler word phrases.
            
            **Limits:**
            - Maximum 100 filler words.
            - Each filler word must not exceed 50 English words.
          
          
          
            Filler word selection rule:
            - `shuffle`: Random shuffle. Already-used filler words are not repeated until all filler words have been used once. After all filler words are played, they are reshuffled randomly and a new round begins.
            - `round_robin`: Round-robin. Selects and plays filler words sequentially from the list. After all filler words are played once, a new cycle begins.
          
        
      
    

    
      Agent configuration parameters.
      
        Settings related to agent silence behavior.
        > **Info**
> `silence_config` does not apply when you integrate a `mllm`.
        
          Specifies the maximum duration (in milliseconds) that the agent can remain silent. 
          After the agent is successfully created and the user joins the channel, any time during which the agent is not listening, thinking, or speaking is considered silent time. When the silent time reaches the specified value, the agent broadcasts a silent reminder message. This feature is useful for prompting users when they become inactive.
          - `0`: Disables the silent reminder feature.
          - `(0, 60000]`: Enables the silent reminder. You must also set `content`; otherwise, the configuration is invalid.
        
        
          Specifies how the agent behaves when the silent timeout is reached. Valid values:
          - `speak`: Uses the TTS module to announce the silent prompt (`content`).
          - `think`: Appends the silent prompt (`content`) to the context and passes it to the LLM.
        
        
          Specifies the silent prompt message. The message use depends on the value of `action` parameter.
        
      

      
        Graceful hang-up settings for the agent.
        
        
          Enable graceful leave:
          * `true`: Enabled. When enabled, calling the POST method to stop the agent ensures that the agent is in an `IDLE` state before leaving the channel.
          * `false`: Disabled.
        
        
        
          Graceful exit timeout (in seconds). Represents the maximum time to wait for the agent to enter an `IDLE` state before exiting the channel. After this time, the agent will exit the channel immediately, even if it is not in an idle state. This field is only effective when `graceful_enabled` is `true`.   
                
      

      
      Agent data transmission channel:
      - `rtm`: Use RTM transmission. This configuration takes effect only when `advanced_features.enable_rtm` is `true`.
      - `datastream`: Use RTC data stream transport.
      

      
  Whether to receive agent performance data:
      - `true`: Receive agent performance data.
      - `false`: Do not receive agent performance data.
      
      This setting only takes effect when `advanced_features.enable_rtm` is `true`. See [Listen to agent events](../../../../ai/build/webhooks.md) to learn how to use client components to receive agent performance data.
      

      
      Whether to receive agent error events:
      - `true`: Receive agent error events.
      - `false`: Do not receive agent error events.
      
      This setting only takes effect when `advanced_features.enable_rtm` is `true`. See [Listen to agent events](../../../../ai/build/webhooks.md) to learn how to use client components to receive agent error events.
      
      
      

      The audio scenario for the RTC channel.

      - `default`: Maps to `aiserver`.
      - `chorus`: Real-time chorus scenario, where users have good network conditions and require ultra-low latency.
      - `aiserver`: Optimized for interactions between the user and the conversational AI agent in terms of latency and network resilience.
      
    
  

## Response

- If the returned status code is `200`, the request was successful. The response body contains the result of the request.

  
    
      Unique id of the agent instance
    
    
    
      Timestamp of when the agent was created
    
    
    
      Current status.
      <ul>
        <li>`IDLE` (0): Agent is idle.</li>
        <li>`STARTING` (1): The agent is being started.</li>
        <li>`RUNNING` (2): The agent is running.</li>
        <li>`STOPPING` (3): The agent is stopping.</li>
        <li>`STOPPED` (4): The agent has exited.</li>
        <li>`RECOVERING` (5): The agent is recovering.</li>
        <li>`FAILED` (6): The agent failed to execute.</li>
      </ul>
    
  

- If the returned status code is not `200`, the request failed. The response body includes the `detail` and `reason` for failure. Refer to [status codes](../status-codes.md) to understand the possible reasons for failure.

### Reference

#### Deprecated parameters

The following turn detection configuration is deprecated. To create more natural conversations and reduce unintended interruptions, Agora recommends using the latest version of `turn_detection` above.

  
  
    Conversation turn detection settings. 
    <span id="turn-detection"></span>

    
      Turn detection mechanism.
      - `agora_vad`:  Agora VAD. Compatible with both cascade (ASR/LLM/TTS) and MLLM modes.
      - `server_vad`: The model detects the start and end of speech based on audio volume and responds at the end of user speech. Only available when `mllm` is enabled and OpenAI Realtime or Gemini Live is selected. The detection behavior is controlled by the LLM provider.
      - `semantic_vad`: Uses a turn detection model in conjunction with VAD to semantically estimate whether the user has finished speaking, then dynamically sets a timeout based on this probability for more natural conversations. Only available when `mllm` is enabled and OpenAI is selected.
    

    
      Sets the agent's behavior when human voice interrupts the agent while it is interacting (speaking or thinking). Choose from the following values:

        - `interrupt`: The agent immediately stops the current interaction and processes the human voice input.
        - `append`: The agent completes the current interaction, then processes the human voice input.
        - `ignore`: The agent discards the human voice input without processing or storing it in the context.
        - `keywords`: The agent stops its current interaction after detecting any of the keywords specified in `turn_detection.interrupt_keywords`.
        - `adaptive`: The agent dynamically increases the voice continuity threshold while speaking to reduce accidental interruptions.

        > **Info**
> Only the `interrupt` mode is supported when you integrate an `mllm`.
            

    
      The amount of time in milliseconds that the user's voice must exceed the VAD threshold before an interruption is triggered.
    

    
        Specifies the list of keywords that trigger an interruption when the `turn_detection.interrupt_mode` is set to `"keyword"`.

        When the agent detects any of these keywords in the user's speech, it immediately stops its current interaction and processes the new input.

        > **Info**
> - Keyword recognition capabilities, such as support for multiple languages or dialects, depend on the ASR provider you choose.  
>         - You can configure up to 128 keywords.
       

    
      The extra forward padding time in milliseconds before the processing system starts to process the speech input. This padding helps capture the beginning of the speech.
    

    
      The duration of audio silence in milliseconds. If no voice activity is detected during this period, the agent assumes that the user has stopped speaking.
    

    
      Identification sensitivity determines the level of sound in the audio signal that is considered voice activity. Lower values make it easier for the agent to detect speech, and higher values ignore weak sounds.
    

    
      The eagerness of the model to respond:
      - `auto`: Equivalent to medium
      - `low`: Wait longer for the user to continue speaking
      - `high`: Respond more quickly
      
      Only available in `semantic_vad` mode when using OpenAI Realtime API.
      
      

This endpoint requires [authentication](../authentication.md).

<!-- Unsupported MDX component omitted:  -->

  ```json
  {
    "agent_id": "1NT29X10YHxxxxxWJOXLYHNYB",
    "create_ts": 1737111452,
    "status": "RUNNING"
  }
  ```
