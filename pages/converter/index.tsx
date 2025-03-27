import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Volume2,
  Play,
  Pause,
  Loader2,
  AlertTriangle,
  AudioWaveform,
  Download,
  Sparkles,
  Settings,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../../component/navbar';

// Define types for voice and language data
interface Voice {
  name: string;
  languageCodes: string[];
  ssmlGender?: string;
  naturalSampleRateHertz?: number;
}

const Converter: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [pitch, setPitch] = useState<number>(0);
  const [speakingRate, setSpeakingRate] = useState<number>(1);
  const [voiceName, setVoiceName] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isConversionSuccess, setIsConversionSuccess] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDetailedError, setShowDetailedError] = useState(false);
  
  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      setIsLoading(true);
      setError(''); // Clear previous errors
      try {
        // Use the correct endpoint based on your Next.js API route structure
        const response = await axios.get('/api/tts');
        console.log('API Response:', response);
        
        const data = response.data;
        const voiceList: Voice[] = data.voices || [];
    
        // Extract supported languages
        const languageCodes = voiceList
          .map(voice => voice.languageCodes?.[0])
          .filter((code): code is string => typeof code === 'string' && code.length > 0);
    
        const languageSet = new Set(languageCodes);
        const sortedLanguages = Array.from(languageSet).sort();
        setLanguages(sortedLanguages);
        setVoices(voiceList);
    
        // Set default language and voice
        if (sortedLanguages.length > 0) {
          const defaultLanguage = sortedLanguages[0];
          setSelectedLanguage(defaultLanguage);
    
          const defaultVoice = voiceList.find(
            (voice) => voice.languageCodes.includes(defaultLanguage)
          );
    
          if (defaultVoice) {
            setVoiceName(defaultVoice.name);
          } else if (voiceList.length > 0) {
            setVoiceName(voiceList[0].name);
            if (!voiceList[0].languageCodes.includes(defaultLanguage) && voiceList[0].languageCodes.length > 0) {
              setSelectedLanguage(voiceList[0].languageCodes[0]);
            }
          }
        }
      } catch (err) {
        console.error("Voice fetch error:", err);
        setError('Failed to load voices. Please check if the API is configured correctly.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  // Update audio time and duration
  useEffect(() => {
    const audioElement = audioRef.current;

    const handleTimeUpdate = () => {
      if (audioElement) {
        setCurrentTime(audioElement.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioElement) {
        setDuration(audioElement.duration || 0);
      }
    };

    if (audioElement) {
      // Reset times when new audio loads
      setCurrentTime(0);
      setDuration(audioElement.duration || 0);

      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      const handleAudioEnd = () => setIsPlaying(false);
      audioElement.addEventListener('ended', handleAudioEnd);

      return () => {
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, [audioUrl]);

  const handleConvert = async () => {
    // Reset previous states
    setAudioUrl('');
    setError('');
    setIsConversionSuccess(false);
    setIsPlaying(false);
  
    // Validate input
    if (!text.trim()) {
      setError('Please enter some text to convert.');
      return;
    }
    if (!selectedLanguage || !voiceName) {
      setError('Please select a language and voice.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Use the correct endpoint for synthesis
      const response = await axios.post('/api/tts', {
        text,
        languageCode: selectedLanguage,
        voiceName,
        pitch,
        speakingRate
      });
      
      const data = response.data;
      
      if (!data.audioContent) {
        throw new Error("API response did not contain audio content.");
      }
  
      // Create a blob from the base64 audio content
      const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
      const audioObjectUrl = URL.createObjectURL(audioBlob);
      
      setAudioUrl(audioObjectUrl);
      setIsConversionSuccess(true);
  
      // If audio player exists, load and play the new audio
      if (audioRef.current) {
        audioRef.current.load();
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setIsConversionSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Conversion failed:", err);
      setError('Conversion failed. Please check the API configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // Clean up blob URL when component unmounts OR when audioUrl changes
  useEffect(() => {
    let currentAudioUrl = audioUrl;
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [audioUrl]);

  // Audio controls
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Ensure audio starts from the beginning if it ended
        if (audioRef.current.currentTime >= audioRef.current.duration - 0.1) {
            audioRef.current.currentTime = 0;
        }
        audioRef.current.play().catch(err => {
          setError("Playback failed. Browser might require user interaction first.");
          console.error("Playback error:", err);
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Format time in mm:ss
  const formatTime = (time: number): string => {
    if (isNaN(time) || time === Infinity) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle downloading audio
  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'synthesized-speech.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Filter voices based on selected language
  const filteredVoices = voices.filter((voice) =>
    voice.languageCodes.includes(selectedLanguage)
  );

  const handleShowDetailedError = () => {
    setShowDetailedError(!showDetailedError);
  };

  return (
    <>
      <NavBar scrolled={false} showMenu={showMenu} setShowMenu={setShowMenu} />

      <div className="min-h-screen bg-gradient-to-br mt-16 from-indigo-50 via-purple-50 to-blue-50 py-12 px-4">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Card with glass effect */}
          <div className="bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Header */}
            <motion.div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            >
              <div className="flex items-center justify-center space-x-4">
                <motion.div
                  className="rounded-full bg-white bg-opacity-20 p-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AudioWaveform className="text-indigo-800 w-8 h-8" />
                </motion.div>
                <motion.h1
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Voice Synthesizer
                </motion.h1>
              </div>
              <motion.p
                className="text-white text-opacity-80 text-center mt-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Convert your text into natural-sounding speech effortlessly.
              </motion.p>
            </motion.div>

            {/* Main Content */}
            <div className="p-6 space-y-5">
              {/* Success message */}
              <AnimatePresence>
                {isConversionSuccess && (
                  <motion.div
                    className="flex items-center bg-green-100 border border-green-300 text-green-800 p-3 rounded-lg space-x-3 text-sm"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Speech successfully generated!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Handling */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="flex items-start bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg space-x-3 text-sm"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      {showDetailedError ? (
                        <>
                          <p className="flex-grow">Something wrong with the Authorization</p>
                          <p 
                            onClick={handleShowDetailedError} 
                            className="text-blue-500 cursor-pointer">
                            Hide Details
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="flex-grow">{error}</p>
                          <p 
                            onClick={handleShowDetailedError} 
                            className="text-blue-500 cursor-pointer">
                            Show Details
                          </p>
                        </>
                      )}
                    </div>
                    
                    <motion.button
                      className="ml-auto text-red-600 hover:text-red-800 flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setError('')}
                      aria-label="Close error message"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Text Input */}
              <motion.div
                className="space-y-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                  Enter Text
                </label>
                <textarea
                  id="text"
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md resize-vertical"
                  placeholder="Type or paste your text here..."
                />
                <p className="text-xs text-gray-500 text-right">{text.length} characters</p>
              </motion.div>

              {/* Language and Voice Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    id="language"
                    value={selectedLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setSelectedLanguage(newLang);
                      // Update voice to the first available voice for the selected language
                      const firstVoice = voices.find(
                        (voice) => voice.languageCodes.includes(newLang)
                      );
                      setVoiceName(firstVoice ? firstVoice.name : '');
                    }}
                    disabled={isLoading || languages.length === 0}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {languages.length === 0 && <option>Loading languages...</option>}
                    {languages.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="voice" className="block text-sm font-medium text-gray-700">Voice</label>
                  <select
                    id="voice"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    disabled={isLoading || filteredVoices.length === 0}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                     {filteredVoices.length === 0 && selectedLanguage && <option>No voices for {selectedLanguage}</option>}
                     {filteredVoices.length === 0 && !selectedLanguage && <option>Select language first</option>}
                     {filteredVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} {voice.ssmlGender ? `(${voice.ssmlGender.toLowerCase()})` : ''}
                        </option>
                      ))}
                  </select>
                </motion.div>
              </div>

              {/* Advanced Settings Toggle */}
              <motion.div
                className="flex items-center justify-start pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <button
                  type="button"
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center space-x-1.5 group"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  aria-expanded={showAdvanced}
                >
                  <Settings className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Advanced Settings</span>
                  {showAdvanced
                    ? <ChevronUp className="w-4 h-4 text-gray-500" />
                    : <ChevronDown className="w-4 h-4 text-gray-500" />
                  }
                </button>
              </motion.div>

              {/* Advanced Settings Panel */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    className="space-y-4 border rounded-lg p-4 bg-gray-50 border-gray-200"
                    initial={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem', paddingTop: '1rem', paddingBottom: '1rem' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {/* Pitch */}
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 col-span-1">Pitch</label>
                      <input
                        type="range"
                        id="pitch"
                        min="-20"
                        max="20"
                        step="1"
                        value={pitch}
                        onChange={(e) => setPitch(Number(e.target.value))}
                        className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-1"
                        aria-valuetext={`${pitch}`}
                      />
                      <span className="text-sm text-gray-600 text-right col-span-1 w-10">{pitch.toFixed(0)}</span>
                    </div>

                    {/* Speaking Rate */}
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label htmlFor="speakingRate" className="block text-sm font-medium text-gray-700 col-span-1">Rate</label>
                      <input
                        type="range"
                        id="speakingRate"
                        min="0.25"
                        max="4.0"
                        step="0.05"
                        value={speakingRate}
                        onChange={(e) => setSpeakingRate(Number(e.target.value))}
                        className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-1"
                        aria-valuetext={`${speakingRate.toFixed(2)}x`}
                      />
                      <span className="text-sm text-gray-600 text-right col-span-1 w-10">{speakingRate.toFixed(2)}x</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Convert Button */}
              <motion.button
                className={`w-full font-bold py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center space-x-2
                  ${isLoading
                    ? 'bg-indigo-400 cursor-not-allowed text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                onClick={handleConvert}
                disabled={isLoading || !text.trim() || !voiceName}
                whileHover={!isLoading ? { scale: 1.03, boxShadow: "0px 5px 15px rgba(99, 102, 241, 0.4)" } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Convert to Speech</span>
                  </>
                )}
              </motion.button>

              {/* Audio Player */}
              <AnimatePresence>
                {audioUrl && (
                  <motion.div
                    className="mt-5 border-t border-gray-200 pt-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Playback</h3>
                    {/* Hidden audio element controlled by custom UI */}
                    <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />
                    <div className="flex items-center justify-between space-x-3 bg-gray-100 p-3 rounded-lg">
                      {/* Play/Pause Button */}
                      <motion.button
                        className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        onClick={handlePlayPause}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                      </motion.button>

                      {/* Time Display & Progress */}
                      <div className="flex-grow text-center text-xs text-gray-600 font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                        <div className="w-full bg-gray-300 rounded-full h-1 mt-1">
                          <div
                            className="bg-indigo-500 h-1 rounded-full"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Download Button */}
                      <motion.button
                        className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-green-300"
                        onClick={handleDownload}
                        aria-label="Download Audio"
                        title="Download MP3"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Converter;