import React, { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { ChatMessage } from './ChatMessage';
import { getModelById } from '../config/models';
import { SettingsService } from '../services/settings';
import { Zap, Clock, Hash, AlertCircle } from 'lucide-react';

interface ChatContainerProps {
  messages: ChatMessageType[];
}

const getGridColsClass = (count: number) => {
  if (count === 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2';
  if (count === 3) return 'grid-cols-1 md:grid-cols-3';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
};

const formatLatency = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const formatTokens = (tokens: number) => {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return tokens.toString();
};

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const groupedMessages = React.useMemo(() => {
    const groups: Array<{
      id: string;
      userMessage: ChatMessageType;
      modelResponses: ChatMessageType[];
    }> = [];

    let currentGroup: {
      id: string;
      userMessage: ChatMessageType;
      modelResponses: ChatMessageType[];
    } | null = null;

    messages.forEach((message) => {
      if (message.role === 'user') {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          id: message.id,
          userMessage: message,
          modelResponses: []
        };
      } else if (message.role === 'assistant' && currentGroup) {
        currentGroup.modelResponses.push(message);
      }
    });

    if (currentGroup) groups.push(currentGroup);
    return groups;
  }, [messages]);

  const getModelName = (modelId: string) => {
    const settings = SettingsService.getSettings();
    const remoteModel = getModelById(modelId);
    const localModel = settings.localModels.find(local => local.id === modelId);
    const fetchedModel = settings.fetchedModels.find(f => f.id === modelId);

    if (remoteModel) return remoteModel.name;
    if (localModel) return localModel.name;
    if (fetchedModel) return fetchedModel.name;
    return modelId.split('/').pop() || modelId;
  };

  const getModelProvider = (modelId: string) => {
    const settings = SettingsService.getSettings();
    const remoteModel = getModelById(modelId);
    const localModel = settings.localModels.find(local => local.id === modelId);
    const fetchedModel = settings.fetchedModels.find(f => f.id === modelId);

    if (remoteModel) return remoteModel.provider;
    if (localModel) return 'Local';
    if (fetchedModel) return fetchedModel.provider;
    return modelId.includes('/') ? modelId.split('/')[0] : 'Unknown';
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Multi-Model Chat
          </h3>
          <p className="text-gray-500 leading-relaxed">
            Select AI models above and compare their responses side by side.
            Supports OpenRouter, Groq, Together AI, and any OpenAI-compatible API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
      {groupedMessages.map((group) => (
        <div key={group.id} className="space-y-3 animate-fadeIn">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-2xl">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-br-md px-5 py-3 shadow-lg shadow-violet-500/10">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{group.userMessage.content}</p>
              </div>
              <div className="text-xs text-gray-400 mt-1.5 text-right">
                {group.userMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Model responses */}
          {group.modelResponses.length > 0 && (() => {
            const gridClass = getGridColsClass(group.modelResponses.length);
            return (
              <div className={`grid ${gridClass} gap-3`}>
                {group.modelResponses.map((response) => {
                  const hasError = !!response.error;
                  const hasContent = !response.isLoading && !response.error;
                  return (
                    <div
                      key={response.model}
                      className={`relative bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                        hasError ? 'border-red-200 bg-red-50/30' : 'border-gray-200/80'
                      }`}
                    >
                      {/* Model header */}
                      <div className={`px-4 py-3 border-b ${hasError ? 'border-red-100 bg-red-50/50' : 'border-gray-100 bg-gray-50/50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              response.isLoading ? 'bg-amber-400 animate-pulse' :
                              hasError ? 'bg-red-400' : 'bg-emerald-400'
                            }`} />
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {getModelName(response.model || '')}
                            </h4>
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 bg-gray-200/70 px-2 py-0.5 rounded-full flex-shrink-0">
                            {getModelProvider(response.model || '')}
                          </span>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-2">
                          {response.latencyMs != null && (
                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatLatency(response.latencyMs)}</span>
                            </div>
                          )}
                          {response.usage && (
                            <>
                              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <Hash className="w-3 h-3" />
                                <span>{formatTokens(response.usage.total_tokens)} tokens</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-400" title={`Prompt: ${response.usage.prompt_tokens}, Completion: ${response.usage.completion_tokens}`}>
                                <Zap className="w-3 h-3" />
                                <span>{formatTokens(response.usage.completion_tokens)} out</span>
                              </div>
                            </>
                          )}
                          {!response.isLoading && !response.error && response.latencyMs == null && (
                            <span className="text-[11px] text-gray-400">—</span>
                          )}
                        </div>
                      </div>

                      {/* Response content */}
                      <div className="p-4 min-h-[120px]">
                        {response.isLoading ? (
                          <div className="flex items-center justify-center h-24">
                            <div className="flex flex-col items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-violet-600 animate-spin" />
                              </div>
                              <span className="text-sm text-gray-400 font-medium">Thinking...</span>
                            </div>
                          </div>
                        ) : hasError ? (
                          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-600">{response.error}</span>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <ChatMessage message={response} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Loading state */}
          {group.modelResponses.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-violet-600 animate-spin" />
                  <span className="text-sm text-gray-400 font-medium">Waiting for responses...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
