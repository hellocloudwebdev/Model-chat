import { useState } from 'react';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { ModelSelector } from './components/ModelSelector';
import { SettingsPage } from './components/SettingsPage';
import { useChat } from './hooks/useChat';
import { Trash2, Settings, Sparkles } from 'lucide-react';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    messages,
    selectedModels,
    isLoading,
    sendMessage,
    clearMessages,
    setModels,
  } = useChat();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Model Chat
              </h1>
              <p className="text-xs text-gray-500">
                Compare AI models side by side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full min-h-0">
        {/* Model Selector */}
        <div className="flex-shrink-0 px-4 pt-4">
          <ModelSelector
            selectedModels={selectedModels}
            onModelSelectionChange={setModels}
            maxModels={5}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-t-xl border border-gray-200/80 mx-4 mt-3 mb-0 overflow-hidden shadow-sm min-h-0">
          <ChatContainer messages={messages} />
          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            disabled={selectedModels.length === 0}
            placeholder={
              selectedModels.length === 0
                ? "Select at least one model to start..."
                : "Ask anything to multiple AI models..."
            }
          />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPage onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
