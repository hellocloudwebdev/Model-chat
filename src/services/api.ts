import { ModelResponse, LocalModelConfig, FetchedModel } from '../types';
import { SettingsService } from './settings';

export class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint;

    const defaultOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`HTTP error! status: ${response.status} on URL: ${url}, body: ${errorBody}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorBody}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);

    } catch (error) {
      console.error(`API request failed for URL: ${url}`, error);
      throw error;
    }
  }

  static async fetchModelsFromApi(): Promise<FetchedModel[]> {
    const settings = SettingsService.getSettings();
    const baseUrl = settings.apiBaseUrl.replace(/\/+$/, '');
    const apiKey = settings.openRouterApiKey;

    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch models: HTTP ${response.status} - ${errorBody}`);
    }

    const rawText = await response.text();
    
    let rawModels: any[];
    try {
      const parsed = JSON.parse(rawText);
      rawModels = Array.isArray(parsed) ? parsed : (parsed.data || []);
    } catch {
      const jsonStr = rawText.replace(/^data: /gm, '').trim();
      const parsed = JSON.parse(jsonStr);
      rawModels = Array.isArray(parsed) ? parsed : (parsed.data || []);
    }

    const models: FetchedModel[] = rawModels.map((m: any) => {
      const id = m.id || '';
      const name = m.name || id;
      const provider = id.includes('/') ? id.split('/')[0] : (m.owned_by || 'Unknown');
      return {
        id,
        name: name.replace(/^.*\//, ''),
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
        description: m.description || '',
        maxTokens: m.context_length || m.max_tokens || 4096,
        isFavorite: false,
      };
    });

    const existingFavorites = new Set(
      settings.fetchedModels.filter(m => m.isFavorite).map(m => m.id)
    );

    return models.map(m => ({
      ...m,
      isFavorite: existingFavorites.has(m.id),
    }));
  }

  static async queryModels(
    message: string,
    models: string[]
  ): Promise<ModelResponse[]> {
    const settings = SettingsService.getSettings();
    const baseUrl = settings.apiBaseUrl.replace(/\/+$/, '');
    const apiKey = settings.openRouterApiKey;
    const endpointType = settings.apiEndpointType;
    const timeout = settings.remoteModelTimeout || 30000;

    const endpoint = `${baseUrl}/${endpointType === 'chat-completions' ? 'chat/completions' : 'responses'}`;

    if (!apiKey) {
      console.error('API key is not set. Cannot query remote models.');
      return models.map(model => ({
        model,
        content: '',
        error: 'API Key is missing in settings.'
      }));
    }

    const promises = models.map(async (model) => {
      try {
        let body: string;
        if (endpointType === 'responses') {
          body = JSON.stringify({
            model: model,
            input: message,
          });
        } else {
          body = JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: message }],
            stream: false,
          });
        }

        const data = await ApiService.makeRequest<any>(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body,
          signal: AbortSignal.timeout(timeout)
        });

        let content: string;
        if (endpointType === 'responses') {
          content = data.output?.[0]?.content?.[0]?.text
            || data.choices?.[0]?.message?.content
            || 'No response content';
        } else {
          content = data.choices?.[0]?.message?.content || 'No response content';
        }

        return {
          model: model,
          content,
          usage: data.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        };
      } catch (error) {
        console.error(`Error querying model ${model}:`, error);
        return {
          model: model,
          content: '',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    });

    return Promise.all(promises);
  }

  // Fallback method for development/testing without serverless function
  static async mockQueryModels(
    message: string,
    models: string[]
  ): Promise<ModelResponse[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return models.map(model => ({
      model,
      content: `This is a mock response from ${model} for: "${message}"\n\nThis would be the actual AI response in a real implementation. The model would process your question and provide a thoughtful answer based on its training data and capabilities.`,
      usage: {
        prompt_tokens: Math.floor(Math.random() * 100) + 50,
        completion_tokens: Math.floor(Math.random() * 200) + 100,
        total_tokens: Math.floor(Math.random() * 300) + 150,
      }
    }));
  }

  // Query local models
  static async queryLocalModels(
    message: string,
    localModels: LocalModelConfig[]
  ): Promise<ModelResponse[]> {
    const enabledModels = localModels.filter(model => model.isEnabled);

    if (enabledModels.length === 0) {
      console.log('No enabled local models found');
      return [];
    }

    console.log('Querying local models:', enabledModels.map(m => m.name));

    const promises = enabledModels.map(async (model) => {
      try {
        if (model.modelType === 'ollama') {

          let endpointToUse = model.endpoint;
          if (!endpointToUse.includes('/api/')) {
            endpointToUse = new URL('/api/chat', endpointToUse).href;
          }
          const isChatEndpoint = endpointToUse.includes('/api/chat');

          const response = await fetch(endpointToUse, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: model.name,
              ...(isChatEndpoint
                ? { messages: [{ role: 'user', content: message }] }
                : { prompt: message }
              ),
              stream: false,
              options: {
                temperature: model.temperature,
                num_predict: model.maxTokens
              }
            }),
            signal: AbortSignal.timeout(SettingsService.getSettings().localModelTimeout)
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown Ollama error'}`);
          }

          const content = isChatEndpoint ? data.message?.content : data.response;

          return {
            model: model.id,
            content: content || 'No response content',
            usage: {
              prompt_tokens: data.prompt_eval_count || 0,
              completion_tokens: data.eval_count || 0,
              total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
            }
          };

        } else {
          // OpenAI-compatible or custom
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (model.apiKey) {
            headers['Authorization'] = `Bearer ${model.apiKey}`;
          }

          const response = await fetch(model.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: model.name, // SERVER-FACING: Use name
              messages: [{ role: 'user', content: message }],
              max_tokens: model.maxTokens,
              temperature: model.temperature,
              stream: false
            }),
            signal: AbortSignal.timeout(SettingsService.getSettings().localModelTimeout)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
          }

          const data = await response.json();
          console.log(`Response from ${model.name}:`, data);

          // Parse the OpenAI-compatible response structure
          const content = data.choices?.[0]?.message?.content || 'No response content';

          return {
            model: model.id,
            content,
            usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          };
        }
      } catch (error) {
        console.error(`Error querying local model ${model.name}:`, error);
        return {
          model: model.id,
          content: '',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    });

    return Promise.all(promises);
  }
}
