import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LoadingDots } from './LoadingDots';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="space-y-2">
      {message.isLoading ? (
        <div className="flex items-center gap-2 text-gray-500 py-4">
          <LoadingDots size="sm" />
          <span className="text-sm font-medium">Thinking...</span>
        </div>
      ) : message.error ? (
        <div className="text-red-500 text-sm font-medium py-2">
          {message.error}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed">
          <MarkdownRenderer content={message.content} />
        </div>
      )}
    </div>
  );
};
