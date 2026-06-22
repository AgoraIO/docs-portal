---
title: Pricing
description: Information on Conversational AI Engine usage and billing.
---
This page describes how Agora calculates and bills for Conversational AI Engine usage.

When you use Conversational AI Engine in your project, Agora charges a monthly fee based on your usage across all projects under your developer account. At the end of each month, the free quota is subtracted from your total usage, and the remaining minutes are multiplied by the unit price to calculate your bill, rounded to two decimal places. For general billing information, see [Billing](../../introduction/pricing-access#billing).

> **Info**
> If you have signed a sales contract with Agora, your billing follows the terms in your contract.

## Unit price

Creating a Conversational AI Engine instance using the RESTful API and joining a channel incurs an audio task fee at the following rate:

<table>
  <thead>
    <tr>
      <th>Usage Type</th>
      <th>Pricing (USD / minute)</th>
      <th>Free Minutes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Conversational AI Engine Audio Task</td>
      <td>0.10*</td>
      <td> First 300 minutes are free</td>
    </tr>
    <tr>
      <td colspan="3">*The unit price includes usage of selected ASR, LLM, and TTS models. You will be charged the same price even if you bring your own key (BYOK).</td>
    </tr>
  </tbody>
</table>

Usage of ASR, LLM, and TTS providers is included in the unit price when using an Agora managed key. Agora provides and manages the API keys for the following providers:

- **ASR**
  - ARES
  - Deepgram nova‑2
  - Deepgram nova‑3
- **LLM**
  - OpenAI GPT‑4o‑mini
  - OpenAI GPT‑4.1‑mini
  - OpenAI GPT‑5‑nano
  - OpenAI GPT‑5‑mini
- **TTS**
  - MiniMax 2.6 Turbo
  - MiniMax 2.8 Turbo
  - OpenAI TTS‑1

## Examples

The following examples demonstrate how billing is calculated for different Conversational AI Engine configurations.

### Example 1: Using ASR, LLM, and TTS managed by Agora

User A joins a channel and starts a voice conversation with an instance created by Conversational AI Engine. The interaction lasts for 10 minutes. User A and the Conversational AI Engine instance exit the channel at the same time. Agora calculates the cost for this session as follows:

<table>
  <thead>
    <tr>
      <th>Usage Type</th>
      <th>Duration (minutes)</th>
      <th>Unit Price</th>
      <th>Service Cost (USD)</th>
      <th>Total Cost (USD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>User A: Audio RTC</td>
      <td>10</td>
      <td>0.00099</td>
      <td>0.0099</td>
      <td rowspan="3">1.0099</td>
    </tr>
    <tr>
      <td>Conversational AI Engine Audio Task</td>
      <td>10</td>
      <td>0.10</td>
      <td>1.00</td>
    </tr>
    <tr>
      <td>ASR: ARES, LLM: OpenAI GPT‑4o‑mini, TTS: MiniMax 2.8 Turbo </td>
      <td>10</td>
      <td>0.00</td>
      <td>0.00</td>
    </tr>    
  </tbody>
</table>

### Example 2: Using ASR, LLM, and TTS providers with BYOK

User B joins a channel and starts a voice conversation with an instance created by Conversational AI Engine configured to use their own keys for the ASR, LLM, and TTS providers or a multimodal large language model (MLLM). The interaction lasts for 10 minutes. User B and the Conversational AI Engine instance exit the channel at the same time. Agora calculates the cost for this session as follows:

<table>
  <thead>
    <tr>
      <th>Usage Type</th>
      <th>Duration (minutes)</th>
      <th>Unit Price</th>
      <th>Service Cost (USD)</th>
      <th>Total Cost (USD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>User B: Audio RTC</td>
      <td>10</td>
      <td>0.00099</td>
      <td>0.0099</td>
      <td rowspan="2">1.0099</td>
    </tr>
    <tr>
      <td>Conversational AI Engine Audio Task</td>
      <td>10</td>
      <td>0.10</td>
      <td>1.00</td>
    </tr>
    <tr>
      <td>ASR, LLM, and TTS (or MLLM) configured with your own key </td>
      <td>10</td>
      <td colspan="3">Billed directly to you by your ASR, LLM, and TTS (or MLLM) providers.</td>
  </tr>
  </tbody>
</table>

<!-- ### Example 3: BYOK + AI Avatar

User C joins a channel and starts a voice conversation with an avatar instance (720p) created by Conversational AI Engine configured to use their own key for the ASR and avatar provider. The interaction lasts for 10 minutes. User C and the Conversational AI Engine instance exit the channel at the same time. Agora calculates the cost for this session as follows:

<table>
  <thead>
    <tr>
      <th>Usage Type</th>
      <th>Duration (minutes)</th>
      <th>Unit Price</th>
      <th>Service Cost (USD)</th>
      <th>Total Cost (USD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>User C: Video HD RTC</td>
      <td>10</td>
      <td>0.00399</td>
      <td>0.0399</td>
      <td rowspan="3">0.1488</td>
    </tr>
    <tr>
      <td>Avatar: Audio RTC</td>
      <td>10</td>
      <td>0.00099</td>
      <td>0.10</td>
    </tr>
  </tbody>
</table> -->
