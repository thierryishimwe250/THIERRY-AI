
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // MANDATORY Key Selection flow for Veo
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      await (window as any).aistudio?.openSelectKey();
    }

    setIsGenerating(true);
    setStatus('Initiating generation pipeline...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Processing creative frames (this can take 1-2 mins)...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        setStatus(`Generating... ${Math.floor(Math.random() * 100)}% complete`);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus('Finalizing video download...');
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        alert("API key error. Please select a valid paid project key.");
        await (window as any).aistudio?.openSelectKey();
      } else {
        alert("Video generation failed. Please ensure you have a billing-enabled API key.");
      }
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-4">Veo Cinema</h2>
        <p className="text-slate-400">
          State-of-the-art video generation. Note: Requires a selected API key from a billing-enabled GCP project.
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-400 hover:underline ml-2">Learn more</a>
        </p>
      </div>

      <div className="glass rounded-3xl p-6 mb-8">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A cinematic drone shot of a hidden temple in a jungle, waterfalls cascading down mossy cliffs..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 min-h-[120px] outline-none focus:border-indigo-500 transition-colors mb-4 resize-none"
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-500 flex items-center gap-2">
             <i className="fa-solid fa-circle-info"></i>
             <span>Generates 720p @ 16:9</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 px-10 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            {isGenerating ? (
              <><i className="fa-solid fa-film animate-pulse"></i> Generating...</>
            ) : (
              <><i className="fa-solid fa-clapperboard"></i> Create Video</>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 glass rounded-3xl overflow-hidden flex items-center justify-center relative min-h-[400px]">
        {isGenerating ? (
          <div className="text-center z-10 px-8">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <i className="fa-solid fa-camera-movie absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-indigo-400"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Lights, Camera, Action!</h3>
            <p className="text-slate-400 max-w-sm mx-auto">{status}</p>
          </div>
        ) : videoUrl ? (
          <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
        ) : (
          <div className="text-slate-600 flex flex-col items-center opacity-40">
            <i className="fa-solid fa-film text-8xl mb-6"></i>
            <p>Your cinematic vision starts here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoView;
