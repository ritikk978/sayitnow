import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Check,
  AlertTriangle,
  X,
  Settings,
  ChevronUp,
  ChevronDown,
  Loader2,
  Sparkles,
  Download,
  ChevronsUpDown,
  Zap,
  Palette,
  Shuffle,
  Grid,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import IinternalNavbar from '@/component/internalNavbar';

// Interface definitions
interface ImagenRequest {
  endpoint: string;
  instances: {
    prompt: string;
  }[];
  parameters: {
    aspectRatio: string;
    sampleCount: number;
    negativePrompt: string;
    enhancePrompt: boolean;
    personGeneration: string;
    safetySetting: string;
    addWatermark: boolean;
    includeRaiReason: boolean;
    language: string;
  };
}

interface ImagenResponse {
  predictions: {
    bytesBase64Encoded: string;
    mimeType: string;
  }[];
}

const ImageGenerator: React.FC = () => {
  // State Management
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [sampleCount, setSampleCount] = useState<number>(4);
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [enhancePrompt, setEnhancePrompt] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<{url: string, index: number}[]>([]);
  const [error, setError] = useState<string>('');
  const [showDetailedError, setShowDetailedError] = useState<boolean>(false);
  const [isGenerationSuccess, setIsGenerationSuccess] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('generate');
  const [selectedImage, setSelectedImage] = useState<{url: string, index: number} | null>(null);

  // Refs
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Event Handlers
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value);
  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => setAspectRatio(e.target.value);
  const handleSampleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => setSampleCount(Number(e.target.value));
  const handleNegativePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setNegativePrompt(e.target.value);
  const handleEnhancePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => setEnhancePrompt(e.target.checked);
  const handleTabChange = (tab: string) => setActiveTab(tab);
  
  const selectImage = (image: {url: string, index: number}) => {
    setSelectedImage(image);
    setActiveTab('view');
  };
  
  const closeImageView = () => {
    setSelectedImage(null);
    setActiveTab('generate');
  };

  // Text area auto-resize
  useEffect(() => {
    if (promptTextareaRef.current) {
      promptTextareaRef.current.style.height = 'auto';
      promptTextareaRef.current.style.height = `${Math.max(promptTextareaRef.current.scrollHeight, 6 * 16)}px`;
    }
  }, [prompt]);

  // Theme Change Effect
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('light', !isDarkMode);
    }
  }, [isDarkMode]);

  // Scroll to top when images are generated
  useEffect(() => {
    if (images.length > 0 && mainContainerRef.current) {
      mainContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [images]);

  // Example prompts
  const examplePrompts = [
    "A hyperrealistic photo of a misty mountain landscape at sunrise",
    "A digital illustration of a futuristic cityscape with flying vehicles",
    "An oil painting of a serene beach with crashing waves at sunset",
    "A professional product photo of a sleek, modern smartphone on a minimalist background",
    "A whimsical watercolor painting of a fairy garden with tiny magical creatures"
  ];

  // Generate Images
  const handleGenerateImages = async () => {
    setImages([]);
    setError('');
    setIsGenerationSuccess(false);
    setSelectedImage(null);

    if (!prompt.trim()) {
      setError('Please enter a prompt to generate images.');
      return;
    }

    setIsLoading(true);

    try {
      const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
      const locationId = process.env.NEXT_PUBLIC_LOCATION_ID;
      const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const modelId = process.env.NEXT_PUBLIC_MODEL_ID;
      
      const requestData: ImagenRequest = {
        endpoint: `projects/${projectId}/locations/${locationId}/publishers/google/models/${modelId}`,
        instances: [
          {
            prompt: prompt,
          }
        ],
        parameters: {
          aspectRatio: aspectRatio,
          sampleCount: sampleCount,
          negativePrompt: negativePrompt,
          enhancePrompt: enhancePrompt,
          personGeneration: "",
          safetySetting: "",
          addWatermark: true,
          includeRaiReason: true,
          language: "auto",
        }
      };

      console.log('Sending to API:', requestData);
      
      // Use API route to securely make the request
      const response = await axios.post('/api/imagen', { 
        requestData 
      });

      const data = response.data as ImagenResponse;
      
      if (data.predictions && data.predictions.length > 0) {
        const imageData = data.predictions.map((prediction, index) => ({
          url: `data:${prediction.mimeType};base64,${prediction.bytesBase64Encoded}`,
          index
        }));
        setImages(imageData);
        setIsGenerationSuccess(true);
        
        setTimeout(() => {
          setIsGenerationSuccess(false);
        }, 3000);
      } else {
        throw new Error("No images were generated");
      }
    } catch (err: any) {
      console.error("Image generation failed:", err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate images. Check network and API configuration.';
      setError(`Generation failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Download Image
  const handleDownloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `imagen-${new Date().getTime()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Use example prompt
  const useExamplePrompt = (example: string) => {
    setPrompt(example);
    if (promptTextareaRef.current) {
      promptTextareaRef.current.focus();
    }
  };

  // Get gradient based on aspect ratio
  const getGradient = (ratio: string) => {
    switch (ratio) {
      case '1:1': return 'from-violet-500 to-indigo-600';
      case '16:9': return 'from-blue-500 to-purple-600';
      case '9:16': return 'from-indigo-500 to-pink-500';
      case '4:3': return 'from-fuchsia-500 to-blue-600';
      case '3:2': return 'from-purple-500 to-indigo-600';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  // JSX Rendering
  return (
    <>

    <IinternalNavbar/>
    <div 
      ref={mainContainerRef}
      className={`min-h-screen flex flex-col ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 to-black text-white' 
          : 'bg-gradient-to-b from-white to-gray-100 text-gray-900'
      }`}
    >
      {/* Header Bar */}
     

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
          {/* Selected Image View */}
          <AnimatePresence>
            {activeTab === 'view' && selectedImage && (
              <motion.div
                className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-2xl shadow-xl overflow-hidden`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold">Image Preview</h3>
                  <button 
                    onClick={closeImageView}
                    className={`p-2 rounded-full ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 flex flex-col items-center">
                  <img 
                    src={selectedImage.url} 
                    alt="Selected image" 
                    className="max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => handleDownloadImage(selectedImage.url, selectedImage.index)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      } transition-colors`}
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </button>
                    <button
                      onClick={closeImageView}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      } transition-colors`}
                    >
                      <Grid className="w-4 h-4" />
                      Back to Gallery
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          {!selectedImage && (
            <div className="mb-2">
              <div className={`inline-flex rounded-lg p-1 ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => handleTabChange('generate')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'generate'
                      ? isDarkMode 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-700 hover:text-black'
                  }`}
                >
                  Generate
                </button>
                {images.length > 0 && (
                  <button
                    onClick={() => handleTabChange('gallery')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'gallery'
                        ? isDarkMode 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-600 text-white'
                        : isDarkMode
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    Gallery ({images.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content based on active tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'generate' && !selectedImage && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`grid grid-cols-1 md:grid-cols-5 gap-6 rounded-2xl overflow-hidden ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'
                } shadow-xl`}
              >
                {/* Left Panel - Controls */}
                <div className={`md:col-span-2 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="space-y-6">
                    {/* Prompt Input Area */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="prompt" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Image Description
                        </label>
                        <div className="flex items-center gap-1 text-xs">
                          <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>AI-Powered</span>
                        </div>
                      </div>
                      <div className={`relative rounded-xl ${
                        isDarkMode 
                          ? 'bg-gray-900 ring-1 ring-gray-700 focus-within:ring-indigo-500' 
                          : 'bg-gray-50 ring-1 ring-gray-200 focus-within:ring-indigo-500'
                      } transition-all`}>
                        <textarea
                          id="prompt"
                          ref={promptTextareaRef}
                          value={prompt}
                          onChange={handlePromptChange}
                          rows={4}
                          className={`block w-full border-0 bg-transparent py-3 px-4 resize-none focus:ring-0 sm:text-sm ${
                            isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                          }`}
                          placeholder="Describe the image you want to generate in detail..."
                        />
                        <div className="flex justify-between items-center px-3 py-2 border-t border-gray-700">
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {prompt.length === 0 ? 'Be descriptive for best results' : `${prompt.length} characters`}
                          </p>
                          {prompt.length > 0 && (
                            <button
                              className={`text-xs ${
                                isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                              }`}
                              onClick={() => setPrompt('')}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Example prompts */}
                      <div className="space-y-2 pt-1">
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Need inspiration? Try one of these:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {examplePrompts.map((example, index) => (
                            <button
                              key={index}
                              onClick={() => useExamplePrompt(example)}
                              className={`text-xs px-3 py-1.5 rounded-full ${
                                isDarkMode
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {example.length > 30 ? example.substring(0, 30) + '...' : example}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Success Message */}
                    <AnimatePresence>
                      {isGenerationSuccess && (
                        <motion.div
                          className={`flex items-center ${
                            isDarkMode ? 'bg-green-900/30 border border-green-800 text-green-300' : 'bg-green-50 border border-green-200 text-green-800'
                          } p-3 rounded-xl space-x-3 text-sm`}
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Check className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'} flex-shrink-0`} />
                          <span>Images successfully generated!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error Handling */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          className={`flex items-start ${
                            isDarkMode ? 'bg-red-900/30 border border-red-800 text-red-300' : 'bg-red-50 border border-red-200 text-red-800'
                          } p-3 rounded-xl space-x-3 text-sm`}
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0 mt-0.5`} />
                          <div className="flex flex-col flex-grow">
                            <p className="flex-grow">{error}</p>
                          </div>
                          <motion.button
                            className={`ml-auto ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} flex-shrink-0`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setError('');
                              setShowDetailedError(false);
                            }}
                            aria-label="Close error message"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Image Settings */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label htmlFor="aspectRatio" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Aspect Ratio
                          </label>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {aspectRatio}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {['1:1', '16:9', '9:16', '4:3', '3:2'].map((ratio) => (
                            <button
                              key={ratio}
                              className={`relative rounded-lg p-2 flex items-center justify-center transition-all
                                ${aspectRatio === ratio 
                                  ? `bg-gradient-to-r ${getGradient(ratio)} text-white ring-2 ring-offset-2 ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'} ring-indigo-500` 
                                  : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              onClick={() => setAspectRatio(ratio)}
                            >
                              <div className={`
                                ${ratio === '1:1' && 'w-6 h-6 rounded'}
                                ${ratio === '16:9' && 'w-8 h-4.5 rounded'}
                                ${ratio === '9:16' && 'w-4.5 h-8 rounded'}
                                ${ratio === '4:3' && 'w-8 h-6 rounded'}
                                ${ratio === '3:2' && 'w-6 h-4 rounded'}
                                ${aspectRatio === ratio ? 'bg-white/30' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}
                              `}></div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Advanced Settings Toggle & Panel */}
                      <div className="pt-2">
                        <button
                          type="button"
                          className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                            isDarkMode 
                              ? 'border-gray-700 hover:border-gray-600 text-gray-200' 
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          } transition-colors`}
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          aria-expanded={showAdvanced}
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <span className="font-medium">Advanced Settings</span>
                          </div>
                          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            className={`space-y-4 rounded-xl p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            {/* Sample Count */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label htmlFor="sampleCount" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                  Number of Images
                                </label>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                  {sampleCount}
                                </span>
                              </div>
                              <input
                                type="range"
                                id="sampleCount"
                                min="1"
                                max="8"
                                step="1"
                                value={sampleCount}
                                onChange={handleSampleCountChange}
                                className={`w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg appearance-none cursor-pointer`}
                                aria-valuetext={`${sampleCount}`}
                                disabled={isLoading}
                              />
                              <div className="flex justify-between text-xs">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>1</span>
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>8</span>
                              </div>
                            </div>

                            {/* Negative Prompt */}
                            <div className="space-y-2">
                              <label htmlFor="negativePrompt" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Negative Prompt
                              </label>
                              <div className={`relative rounded-lg ${
                                isDarkMode 
                                  ? 'bg-gray-800 ring-1 ring-gray-700 focus-within:ring-indigo-500' 
                                  : 'bg-white ring-1 ring-gray-200 focus-within:ring-indigo-500'
                                } transition-all`}>
                                <textarea
                                  id="negativePrompt"
                                  value={negativePrompt}
                                  onChange={handleNegativePromptChange}
                                  rows={2}
                                  className={`block w-full border-0 bg-transparent py-2 px-3 resize-none focus:ring-0 sm:text-sm ${
                                    isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                                  }`}
                                  placeholder="Elements to exclude from the generated images..."
                                  disabled={isLoading}
                                />
                              </div>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Specify unwanted elements to avoid in the generated images
                              </p>
                            </div>

                            {/* Enhance Prompt */}
                            <div className="flex items-center justify-between p-3 rounded-lg border border-dashed">
                              <div className="flex items-center">
                                <div className={`p-1.5 rounded-md ${isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                                  <Wand2 className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                </div>
                                <div className="ml-3">
                                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    AI Prompt Enhancement
                                  </h4>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Let AI improve your description
                                  </p>
                                </div>
                              </div>
                              <div className="relative flex items-center">
                                <input
                                  id="enhancePrompt"
                                  type="checkbox"
                                  checked={enhancePrompt}
                                  onChange={handleEnhancePromptChange}
                                  className="sr-only"
                                  disabled={isLoading}
                                />
                                <div
                                  onClick={() => !isLoading && setEnhancePrompt(!enhancePrompt)}
                                  className={`w-11 h-6 ${
                                    enhancePrompt 
                                      ? 'bg-indigo-600' 
                                      : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                                  } rounded-full transition cursor-pointer flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <div
                                    className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                                      enhancePrompt ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Generate Button */}
                      <motion.button
                        className={`w-full py-4 px-6 rounded-xl font-semibold transition shadow-lg ${
                          isLoading
                            ? isDarkMode 
                              ? 'bg-indigo-800 text-indigo-200 cursor-not-allowed' 
                              : 'bg-indigo-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
                        } focus:ring-indigo-500`}
                        onClick={handleGenerateImages}
                        disabled={isLoading || !prompt.trim()}
                        whileHover={!isLoading && prompt.trim() ? { scale: 1.02 } : {}}
                        whileTap={!isLoading && prompt.trim() ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center justify-center gap-3">
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin w-5 h-5" />
                              <span>Generating Images...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              <span>Generate {sampleCount} Images</span>
                            </>
                          )}
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Preview & Usage */}
                <div className={`md:col-span-3 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30' 
                    : 'bg-gradient-to-br from-indigo-50 to-purple-50'
                } rounded-b-2xl md:rounded-b-none md:rounded-r-2xl p-6`}>
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Image Preview
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Your generated images will appear here
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium bg-opacity-90 ${
                        isLoading
                          ? 'bg-yellow-500 text-yellow-900'
                          : images.length > 0
                            ? 'bg-green-500 text-green-900'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                      }`}>
                        {isLoading ? 'Processing' : images.length > 0 ? `${images.length} Images` : 'Ready'}
                      </div>
                    </div>

                    <div className="flex-grow flex items-center justify-center rounded-xl overflow-hidden bg-gradient-to-r from-gray-900/20 to-black/20 backdrop-blur-sm border border-gray-800/50">
                      {isLoading ? (
                        <div className="text-center py-16 px-4">
                          <motion.div
                            className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 180, 360],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Sparkles className="w-8 h-8 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-bold mb-2 text-white">Generating images...</h3>
                          <p className="text-gray-400 max-w-md">
                            Our AI is creating {sampleCount} unique images based on your prompt. This may take a few moments.
                          </p>
                        </div>
                      ) : images.length > 0 ? (
                        <div className="p-4 w-full">
                          <div className="grid grid-cols-2 gap-4">
                            {images.slice(0, 4).map((image) => (
                              <div
                                key={image.index}
                                className="rounded-lg overflow-hidden cursor-pointer transform transition hover:scale-105 hover:shadow-xl"
                                onClick={() => handleTabChange('gallery')}
                              >
                                <img
                                  src={image.url}
                                  alt={`Generated image ${image.index + 1}`}
                                  className="w-full h-40 object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          {images.length > 4 && (
                            <div className="mt-4 text-center">
                              <button
                                onClick={() => handleTabChange('gallery')}
                                className={`px-4 py-2 rounded-lg text-sm ${
                                  isDarkMode 
                                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                                    : 'bg-black/10 hover:bg-black/20 text-gray-900'
                                } transition-colors`}
                              >
                                View all {images.length} images
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-16 px-4">
                          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
                            <Palette className="w-8 h-8 text-gray-300" />
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-white">No images yet</h3>
                          <p className="text-gray-400 max-w-md">
                            Enter a detailed prompt and click "Generate Images" to create AI art
                          </p>
                          <button
                            onClick={() => {
                              if (promptTextareaRef.current) {
                                promptTextareaRef.current.focus();
                              }
                            }}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
                          >
                            Start creating
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`rounded-xl p-4 ${
                        isDarkMode 
                          ? 'bg-gray-800/50 backdrop-blur-sm' 
                          : 'bg-white/70 backdrop-blur-sm'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                          }`}>
                            <Shuffle className={`w-5 h-5 ${
                              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`text-sm font-semibold ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              Variations & Styles
                            </h3>
                            <p className={`text-xs mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Generate multiple variations with different artistic styles
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`rounded-xl p-4 ${
                        isDarkMode 
                          ? 'bg-gray-800/50 backdrop-blur-sm' 
                          : 'bg-white/70 backdrop-blur-sm'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                          }`}>
                            <Image className={`w-5 h-5 ${
                              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`text-sm font-semibold ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              High Resolution
                            </h3>
                            <p className={`text-xs mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Images are suitable for professional use and printing
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && !selectedImage && images.length > 0 && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl overflow-hidden ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-xl p-6`}
              >
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Generated Images</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {images.length} images created from your prompt
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('generate')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } transition-colors`}
                  >
                    Back to Generator
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <motion.div
                      key={image.index}
                      className="rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all hover:shadow-xl bg-black"
                      whileHover={{ scale: 1.03, y: -5 }}
                      onClick={() => selectImage(image)}
                    >
                      <div className="relative group aspect-square">
                        <img
                          src={image.url}
                          alt={`Generated image ${image.index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white font-medium">Image {image.index + 1}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadImage(image.url, image.index);
                              }}
                              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-auto py-6 ${
        isDarkMode 
          ? 'bg-black/50 backdrop-blur-md border-t border-gray-800' 
          : 'bg-white/50 backdrop-blur-md border-t border-gray-200'
      }`}>
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Say It Now • Powered by Google's Imagen API
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}>
              Terms
            </a>
            <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}>
              Privacy
            </a>
            <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}>
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default ImageGenerator;