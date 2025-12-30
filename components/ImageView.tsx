
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{url: string, prompt: string}[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const url = await GeminiService.generateImage(prompt);
      setGeneratedImages(prev => [{ url, prompt }, ...prev]);
      setPrompt('');
    } catch (error) {
      alert("Failed to generate image.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Imagine & Create
        </h2>
        <p className="text-slate-400 mb-8">
          Describe what you want to see, and Gemini will bring it to life using advanced multimodal synthesis.
        </p>
        <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-2xl">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city with flying neon cars at sunset..."
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <><i className="fa-solid fa-spinner animate-spin"></i> Painting...</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {generatedImages.map((img, idx) => (
          <div key={idx} className="glass rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="relative aspect-square">
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <p className="text-xs text-slate-300 italic mb-2">"{img.prompt}"</p>
                <a 
                  href={img.url} 
                  download="gemini-art.png" 
                  className="bg-white/10 hover:bg-white/20 text-white text-center py-2 rounded-lg backdrop-blur-md transition-colors text-sm"
                >
                  <i className="fa-solid fa-download mr-2"></i> Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {generatedImages.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-600 opacity-50">
          <i className="fa-solid fa-image text-6xl mb-4"></i>
          <p>Your masterpieces will appear here</p>
        </div>
      )}
    </div>
  );
};

export default ImageView;
