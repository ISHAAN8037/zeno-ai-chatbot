// Langflow API Service
import { LANGFLOW_CONFIG, getApiKey } from '../config.js';

class LangflowApiService {
  constructor() {
    this.baseUrl = LANGFLOW_CONFIG.baseUrl;
    this.flowId = LANGFLOW_CONFIG.flowId;
    this.apiKey = getApiKey();
  }

  // Send message to chat API
  async sendMessage(message, userId = null) {
    try {
      // Check message length to prevent token limit issues
      if (message.length > 4000) {
        throw new Error('Message too long. Please keep your question under 4000 characters.');
      }

      const url = `${this.baseUrl}/api/chat`;
      
      const payload = {
        message: message,
        userId: userId
      };

      const headers = {
        "Content-Type": "application/json"
      };

      console.log('🚀 Sending message to chat API:', { url, payload });

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Chat API response:', data);
      
      if (data.success && data.response) {
        return data.response;
      } else {
        throw new Error(data.error || 'No response received');
      }
      
    } catch (error) {
      console.error('❌ Chat API Error:', error);
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }

  // Parse Langflow response with enhanced logic for the specific format
  parseResponse(data) {
    console.log('🔍 Parsing response data:', data);
    
    // Handle the specific Langflow response format we discovered
    if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      const firstOutput = data.outputs[0];
      
      // Try to get message from outputs
      if (firstOutput.outputs && Array.isArray(firstOutput.outputs) && firstOutput.outputs.length > 0) {
        const output = firstOutput.outputs[0];
        
        // Check for message in results
        if (output.results && output.results.message) {
          const message = output.results.message;
          if (message.text) {
            return message.text;
          }
        }
        
        // Check for message in outputs
        if (output.outputs && output.outputs.message) {
          const message = output.outputs.message;
          if (message.message) {
            return message.message;
          }
        }
        
        // Check for artifacts
        if (output.artifacts && output.artifacts.message) {
          return output.artifacts.message;
        }
        
        // Check for messages array
        if (output.messages && Array.isArray(output.messages) && output.messages.length > 0) {
          const message = output.messages[0];
          if (message.message) {
            return message.message;
          }
        }
      }
    }
    
    // Handle nested response structures
    if (data.result) {
      if (typeof data.result === 'string') {
        return data.result;
      } else if (data.result.output) {
        return data.result.output;
      } else if (data.result.result) {
        return data.result.result;
      } else if (data.result.message) {
        return data.result.message;
      } else if (data.result.text) {
        return data.result.text;
      } else if (data.result.content) {
        return data.result.content;
      }
    }
    
    // Handle direct output fields
    if (data.output) {
      if (typeof data.output === 'string') {
        return data.output;
      } else if (data.output.result) {
        return data.output.result;
      } else if (data.output.message) {
        return data.output.message;
      } else if (data.output.text) {
        return data.output.text;
      } else if (data.output.content) {
        return data.output.content;
      }
    }
    
    // Handle message fields
    if (data.message) {
      if (typeof data.message === 'string') {
        return data.message;
      } else if (data.message.content) {
        return data.message.content;
      } else if (data.message.text) {
        return data.message.text;
      }
    }
    
    // Handle response fields
    if (data.response) {
      if (typeof data.response === 'string') {
        return data.response;
      } else if (data.response.content) {
        return data.response.content;
      } else if (data.response.text) {
        return data.response.text;
      }
    }
    
    // Handle text fields
    if (data.text) {
      return data.text;
    }
    
    // Handle content fields
    if (data.content) {
      return data.content;
    }
    
    // Handle array responses
    if (Array.isArray(data)) {
      if (data.length > 0) {
        const firstItem = data[0];
        if (typeof firstItem === 'string') {
          return firstItem;
        } else if (firstItem.content) {
          return firstItem.content;
        } else if (firstItem.text) {
          return firstItem.text;
        } else if (firstItem.message) {
          return firstItem.message;
        }
      }
    }
    
    // If we can't parse it, return a helpful message with the raw data
    console.warn('⚠️ Could not parse response, returning raw data:', data);
    return `I received a response but couldn't parse it properly. Raw data: ${JSON.stringify(data, null, 2)}`;
  }

  // Check if Langflow is accessible
  async checkHealth() {
    try {
      // Try to access the flows endpoint to check if Langflow is running
      const response = await fetch(`${this.baseUrl}/api/v1/flows`, {
        method: 'GET',
        headers: {
          "x-api-key": this.apiKey
        }
      });
      return response.ok;
    } catch (error) {
      console.log('Langflow health check failed:', error);
      return false;
    }
  }

  // Get flow information
  async getFlowInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/flows/${this.flowId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error getting flow info:', error);
      return null;
    }
  }
}

export default new LangflowApiService();
