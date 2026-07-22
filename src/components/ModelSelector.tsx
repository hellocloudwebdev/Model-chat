import React, { useMemo } from 'react';
import { AVAILABLE_MODELS } from '../config/models';
import { SettingsService } from '../services/settings';
import { Star, Check } from 'lucide-react';

interface ModelSelectorProps {
  selectedModels: string[];
  onModelSelectionChange: (modelIds: string[]) => void;
  maxModels?: number;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModels,
  onModelSelectionChange,
  maxModels = 5
}) => {
  const settings = SettingsService.getSettings();
  const allModels = useMemo(() => {
    const enabledLocalModels = settings.localModels.filter(model => model.isEnabled);
    const favoritedFetched = settings.fetchedModels
      .filter(m => m.isFavorite)
      .map(m => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        description: m.description,
        maxTokens: m.maxTokens,
        costPer1kTokens: 0,
        type: 'remote' as const,
      }));
    return [...AVAILABLE_MODELS, ...favoritedFetched, ...enabledLocalModels];
  }, [settings.localModels, settings.fetchedModels]);

  const handleModelToggle = (modelId: string) => {
    const isSelected = selectedModels.includes(modelId);
    if (isSelected) {
      onModelSelectionChange(selectedModels.filter(id => id !== modelId));
    } else if (selectedModels.length < maxModels) {
      onModelSelectionChange([...selectedModels, modelId]);
    }
  };

  const handleQuickSelect = (count: number) => {
    onModelSelectionChange(allModels.slice(0, count).map(m => m.id));
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Models
          <span className="ml-2 text-xs font-normal text-gray-400">
            {selectedModels.length}/{maxModels}
          </span>
        </h3>
        <div className="flex gap-1.5">
          {[1, 3, 5].map(n => (
            <button
              key={n}
              onClick={() => handleQuickSelect(n)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedModels.length === n
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {n === 5 ? 'All' : `${n}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {allModels.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const isFetched = settings.fetchedModels.some(f => f.id === model.id);
          return (
            <button
              key={model.id}
              onClick={() => handleModelToggle(model.id)}
              className={`relative p-3 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? 'border-violet-400 bg-violet-50 shadow-sm ring-1 ring-violet-400/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? 'border-violet-500 bg-violet-500'
                    : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900 truncate block">
                      {model.name}
                    </span>
                    {isFetched && <Star className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" />}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {'provider' in model ? model.provider : 'Local'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedModels.length === 0 && (
        <p className="text-center text-sm text-gray-400 mt-3">
          Select at least one model to start chatting
        </p>
      )}
    </div>
  );
};
