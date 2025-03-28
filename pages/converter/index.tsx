import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AudioWaveform,
  Check,
  AlertTriangle,
  X,
  Settings,
  ChevronUp,
  ChevronDown,
  Loader2,
  Sparkles,
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Cpu
} from 'lucide-react';

const VoiceSynthesizer = () => {
  // State management
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [pitch, setPitch] = useState(0);
  const [speakingRate, setSpeakingRate] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [showDetailedError, setShowDetailedError] = useState(false);
  const [isConversionSuccess, setIsConversionSuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Comprehensive list of languages with labels
  const languagesWithLabels = [
    { code: 'ar-XA', label: 'Arabic' },
    { code: 'bn-IN', label: 'Bengali (India)' },
    { code: 'cmn-CN', label: 'Chinese (Mandarin)' },
    { code: 'cs-CZ', label: 'Czech' },
    { code: 'da-DK', label: 'Danish' },
    { code: 'nl-NL', label: 'Dutch' },
    { code: 'en-AU', label: 'English (Australia)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'en-IN', label: 'English (India)' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'fil-PH', label: 'Filipino' },
    { code: 'fi-FI', label: 'Finnish' },
    { code: 'fr-CA', label: 'French (Canada)' },
    { code: 'fr-FR', label: 'French (France)' },
    { code: 'de-DE', label: 'German' },
    { code: 'el-GR', label: 'Greek' },
    { code: 'gu-IN', label: 'Gujarati' },
    { code: 'hi-IN', label: 'Hindi' },
    { code: 'hu-HU', label: 'Hungarian' },
    { code: 'is-IS', label: 'Icelandic' },
    { code: 'id-ID', label: 'Indonesian' },
    { code: 'it-IT', label: 'Italian' },
    { code: 'ja-JP', label: 'Japanese' },
    { code: 'kn-IN', label: 'Kannada' },
    { code: 'ko-KR', label: 'Korean' },
    { code: 'ml-IN', label: 'Malayalam' },
    { code: 'mr-IN', label: 'Marathi' },
    { code: 'nb-NO', label: 'Norwegian' },
    { code: 'pl-PL', label: 'Polish' },
    { code: 'pt-BR', label: 'Portuguese (Brazil)' },
    { code: 'pt-PT', label: 'Portuguese (Portugal)' },
    { code: 'pa-IN', label: 'Punjabi' },
    { code: 'ro-RO', label: 'Romanian' },
    { code: 'ru-RU', label: 'Russian' },
    { code: 'sr-RS', label: 'Serbian' },
    { code: 'sk-SK', label: 'Slovak' },
    { code: 'es-ES', label: 'Spanish (Spain)' },
    { code: 'es-US', label: 'Spanish (US)' },
    { code: 'sv-SE', label: 'Swedish' },
    { code: 'ta-IN', label: 'Tamil' },
    { code: 'te-IN', label: 'Telugu' },
    { code: 'th-TH', label: 'Thai' },
    { code: 'tr-TR', label: 'Turkish' },
    { code: 'uk-UA', label: 'Ukrainian' },
    { code: 'vi-VN', label: 'Vietnamese' }
  ];
  
  // Extract just the language codes for backward compatibility
  const languages = languagesWithLabels.map(lang => lang.code);
  
  // Comprehensive list of voices with language codes
  const voices = [
    // English (US) voices
    { name: 'en-US-Standard-A', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Standard-B', ssmlGender: 'MALE', languageCodes: ['en-US'] },
    { name: 'en-US-Standard-C', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Standard-D', ssmlGender: 'MALE', languageCodes: ['en-US'] },
    { name: 'en-US-Standard-E', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Standard-F', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Wavenet-A', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Wavenet-B', ssmlGender: 'MALE', languageCodes: ['en-US'] },
    { name: 'en-US-Wavenet-C', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Wavenet-D', ssmlGender: 'MALE', languageCodes: ['en-US'] },
    { name: 'en-US-Wavenet-E', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Wavenet-F', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-A', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-C', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-D', ssmlGender: 'MALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-E', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-F', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-G', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-H', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-I', ssmlGender: 'MALE', languageCodes: ['en-US'] },
    { name: 'en-US-Neural2-J', ssmlGender: 'MALE', languageCodes: ['en-US'] },
    
    // Hindi voices
    { name: 'hi-IN-Standard-A', ssmlGender: 'FEMALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Standard-B', ssmlGender: 'MALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Standard-C', ssmlGender: 'MALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Standard-D', ssmlGender: 'FEMALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Wavenet-A', ssmlGender: 'FEMALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Wavenet-B', ssmlGender: 'MALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Wavenet-C', ssmlGender: 'MALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Wavenet-D', ssmlGender: 'FEMALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Neural2-A', ssmlGender: 'FEMALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Neural2-B', ssmlGender: 'MALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Neural2-C', ssmlGender: 'MALE', languageCodes: ['hi-IN'] },
    { name: 'hi-IN-Neural2-D', ssmlGender: 'FEMALE', languageCodes: ['hi-IN'] },
    
    // Spanish voices
    { name: 'es-ES-Standard-A', ssmlGender: 'FEMALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Standard-B', ssmlGender: 'MALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Standard-C', ssmlGender: 'FEMALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Standard-D', ssmlGender: 'FEMALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Wavenet-B', ssmlGender: 'MALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Neural2-A', ssmlGender: 'FEMALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Neural2-B', ssmlGender: 'MALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Neural2-C', ssmlGender: 'FEMALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Neural2-D', ssmlGender: 'FEMALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Neural2-E', ssmlGender: 'FEMALE', languageCodes: ['es-ES'] },
    { name: 'es-ES-Neural2-F', ssmlGender: 'MALE', languageCodes: ['es-ES'] },
    
    // French voices
    { name: 'fr-FR-Standard-A', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Standard-B', ssmlGender: 'MALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Standard-C', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Standard-D', ssmlGender: 'MALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Standard-E', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Wavenet-A', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Wavenet-B', ssmlGender: 'MALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Wavenet-C', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Wavenet-D', ssmlGender: 'MALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Wavenet-E', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Neural2-A', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Neural2-B', ssmlGender: 'MALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Neural2-C', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Neural2-D', ssmlGender: 'MALE', languageCodes: ['fr-FR'] },
    { name: 'fr-FR-Neural2-E', ssmlGender: 'FEMALE', languageCodes: ['fr-FR'] },
    
    // German voices
    { name: 'de-DE-Standard-A', ssmlGender: 'FEMALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Standard-B', ssmlGender: 'MALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Standard-C', ssmlGender: 'FEMALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Standard-D', ssmlGender: 'MALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Standard-E', ssmlGender: 'MALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Standard-F', ssmlGender: 'FEMALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Wavenet-A', ssmlGender: 'FEMALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Wavenet-B', ssmlGender: 'MALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Wavenet-C', ssmlGender: 'FEMALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Wavenet-D', ssmlGender: 'MALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Wavenet-E', ssmlGender: 'MALE', languageCodes: ['de-DE'] },
    { name: 'de-DE-Wavenet-F', ssmlGender: 'FEMALE', languageCodes: ['de-DE'] },
    
    // Add more voices for other languages as needed
  ];

  // Refs
  const audioRef = useRef(null);
  const textareaRef = useRef(null);

  // Filter voices based on selected language
  const filteredVoices = voices.filter(
    (voice) => voice.languageCodes.includes(selectedLanguage)
  );

  // Format time for audio player
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Update audio player time
  useEffect(() => {
    if (audioRef.current) {
      const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [audioUrl]);

  // Apply volume settings to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle theme change
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
  }, [isDarkMode]);

  // Handle play/pause button
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // Handle download button
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'synthesized-speech.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle detailed error toggle
  const handleShowDetailedError = () => {
    setShowDetailedError(!showDetailedError);
  };

  // Handle text conversion
  const handleConvert = async () => {
    if (!text.trim() || !voiceName) return;

    setIsLoading(true);
    setError('');
    setIsConversionSuccess(false);

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, create a blob URL from a base64 audio string
      // In a real app, this would come from your TTS API
      const audioBlob = new Blob([new Uint8Array(10).fill(0)], { type: 'audio/mp3' });
      const url = URL.createObjectURL(audioBlob);
      
      setAudioUrl(url);
      setIsConversionSuccess(true);
      
      // Simulate actual audio for demo purposes
      // In a real app, the API would return actual audio data
      if (audioRef.current) {
        // This is just for the demo - replace with actual API response
        audioRef.current.src = 'https://audio-samples.github.io/samples/mp3/blizzard_primed.mp3';
      }
    } catch (err) {
      setError('Failed to convert text to speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Main renderer
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-indigo-300 via-purple-100 to-blue-50'}`}>
      {/* Header Bar */}
      <header className={`fixed top-0 left-0 right-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white bg-opacity-80 backdrop-blur-md'} shadow-md`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              className={`rounded-full ${isDarkMode ? 'bg-indigo-700' : 'bg-indigo-600'} p-2`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <AudioWaveform className="text-white w-5 h-5" />
            </motion.div>
            <h1 className="text-xl font-bold">Voice Synthesizer Pro</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 mt-16">
        <motion.div
          className="w-full max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white bg-opacity-90 backdrop-blur-lg border border-gray-200'} shadow-xl`}>
            
            {/* Left Panel - Controls */}
            <div className={`lg:col-span-2 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white bg-opacity-80'}`}>
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="space-y-1">
                  <label htmlFor="text" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Text to Convert
                  </label>
                  <textarea
                    id="text"
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'} rounded-md resize-vertical p-3`}
                    placeholder="Type or paste your text here..."
                  />
                  <div className="flex justify-between items-center">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {text.length === 0 ? 'Enter some text to convert' : `${text.length} characters`}
                    </p>
                    {text.length > 0 && (
                      <motion.button
                        className={`text-xs ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                        onClick={() => setText('')}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear text
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Success message */}
                <AnimatePresence>
                  {isConversionSuccess && (
                    <motion.div
                      className={`flex items-center ${isDarkMode ? 'bg-green-900 border-green-700 text-green-300' : 'bg-green-100 border border-green-300 text-green-800'} p-3 rounded-lg space-x-3 text-sm`}
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'} flex-shrink-0`} />
                      <span>Speech successfully generated!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Handling */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className={`flex items-start ${isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-100 border border-red-300 text-red-800'} p-3 rounded-lg space-x-3 text-sm`}
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0 mt-0.5`} />
                      <div className="flex flex-col">
                        {showDetailedError ? (
                          <>
                            <p className="flex-grow">Something wrong with the Authorization</p>
                            <p 
                              onClick={handleShowDetailedError} 
                              className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} cursor-pointer`}>
                              Hide Details
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="flex-grow">{error}</p>
                            <p 
                              onClick={handleShowDetailedError} 
                              className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} cursor-pointer`}>
                              Show Details
                            </p>
                          </>
                        )}
                      </div>
                      
                      <motion.button
                        className={`ml-auto ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} flex-shrink-0`}
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

                {/* Language and Voice Selection */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="language" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Language
                    </label>
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
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500' 
                          : 'border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500'
                        } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:cursor-not-allowed`}
                    >
                      <option value="">Select language</option>
                      {languages.length === 0 && <option>Loading languages...</option>}
                      {languagesWithLabels.map((language) => (
                        <option key={language.code} value={language.code}>
                          {language.label} ({language.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="voice" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Voice
                    </label>
                    <select
                      id="voice"
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      disabled={isLoading || filteredVoices.length === 0}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500' 
                          : 'border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500'
                        } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:cursor-not-allowed`}
                    >
                      <option value="">Select voice</option>
                      {filteredVoices.length === 0 && selectedLanguage && <option disabled>No voices for {selectedLanguage}</option>}
                      {filteredVoices.length === 0 && !selectedLanguage && <option disabled>Select language first</option>}
                      {filteredVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name.split('-').pop()} - {voice.ssmlGender.charAt(0) + voice.ssmlGender.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    className={`${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium text-sm flex items-center space-x-1.5 group`}
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
                </div>

                {/* Advanced Settings Panel */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      className={`space-y-4 border rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                        }`}
                      initial={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem', paddingTop: '1rem', paddingBottom: '1rem' }}
                      exit={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {/* Pitch */}
                      <div className="grid grid-cols-6 items-center gap-2">
                        <label htmlFor="pitch" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}>
                          Pitch
                        </label>
                        <input
                          type="range"
                          id="pitch"
                          min="-20"
                          max="20"
                          step="1"
                          value={pitch}
                          onChange={(e) => setPitch(Number(e.target.value))}
                          className={`mt-1 w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4`}
                          aria-valuetext={`${pitch}`}
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-right col-span-1 w-10`}>
                          {pitch.toFixed(0)}
                        </span>
                      </div>

                      {/* Speaking Rate */}
                      <div className="grid grid-cols-6 items-center gap-2">
                        <label htmlFor="speakingRate" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}>
                          Rate
                        </label>
                        <input
                          type="range"
                          id="speakingRate"
                          min="0.25"
                          max="4.0"
                          step="0.05"
                          value={speakingRate}
                          onChange={(e) => setSpeakingRate(Number(e.target.value))}
                          className={`mt-1 w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4`}
                          aria-valuetext={`${speakingRate.toFixed(2)}x`}
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-right col-span-1 w-10`}>
                          {speakingRate.toFixed(2)}x
                        </span>
                      </div>

                      {/* Volume Control */}
                      <div className="grid grid-cols-6 items-center gap-2">
                        <label htmlFor="volume" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}>
                          Volume
                        </label>
                        <input
                          type="range"
                          id="volume"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          disabled={isMuted}
                          className={`mt-1 w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4 ${isMuted ? 'opacity-50' : ''}`}
                        />
                        <button
                          onClick={handleMuteToggle}
                          className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} col-span-1 w-10 flex justify-center`}
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Model Quality */}
                      <div className="grid grid-cols-6 items-center gap-2">
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-2`}>
                          Model Quality
                        </label>
                        <div className="col-span-4 flex space-x-2">
                          <button
                            className={`px-3 py-1 text-xs rounded-full ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'} flex items-center space-x-1`}
                          >
                            <span>Standard</span>
                          </button>
                          <button
                            className={`px-3 py-1 text-xs rounded-full ${isDarkMode ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800'} flex items-center space-x-1`}
                          >
                            <span>Neural</span>
                          </button>
                          <button
                            className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 ${isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-600 text-white'}`}
                          >
                            <Cpu className="w-3 h-3" />
                            <span>Premium</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Convert Button */}
                <motion.button
                  className={`w-full font-bold py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center space-x-2 mt-4
                    ${isLoading
                      ? isDarkMode ? 'bg-indigo-700 cursor-not-allowed text-white' : 'bg-indigo-400 cursor-not-allowed text-white'
                      : isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
              </motion.div>
            </div>

            {/* Right Panel - Visualization & Player */}
            <div className={`lg:col-span-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-600 to-purple-600'} p-6`}>
              <motion.div
                className="h-full flex flex-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
              {/* Visualization Header */}
<div className="flex items-center justify-between mb-4">
  <h2 className="text-white text-xl font-bold">Audio Synthesis</h2>
  <div className={`px-3 py-1 rounded-full ${audioUrl ? 'bg-green-500' : 'bg-gray-500'} text-white text-xs font-medium flex items-center space-x-1.5`}>
    <span>{audioUrl ? 'Ready to play' : 'Waiting for conversion'}</span>
  </div>
</div>

{/* Visualization Area */}
<div className="flex-grow flex items-center justify-center mb-6">
  {audioUrl ? (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full h-40 mb-4 relative">
        {/* Audio waveform visualization - simplified for demo */}
        <motion.div 
          className="absolute inset-0 flex items-end justify-around"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-white text-black bg-opacity-80 w-1.5 rounded-t-sm"
              initial={{ height: 0 }}
              animate={{ 
                height: isPlaying 
                  ? Math.random() * 80 + 20 
                  : Math.sin(i * 0.2) * 40 + 50
              }}
              transition={{ 
                duration: 0.2, 
                repeat: isPlaying ? Infinity : 0,
                repeatType: "mirror"
              }}
            />
          ))}
        </motion.div>
      </div>
      
      {/* Playback progress */}
      <div className="w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
    </div>
  ) : (
    <div className="text-center py-10">
      <motion.div
        className="inline-block mb-4 p-4 rounded-full bg-white bg-opacity-10"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity
        }}
      >
        <AudioWaveform className="w-12 h-12 text-white opacity-75" />
      </motion.div>
      <p className="text-white text-opacity-70 max-w-md mx-auto">
        Enter your text, select language and voice, then click "Convert to Speech" to generate audio
      </p>
    </div>
  )}
</div>

{/* Audio Player Controls */}
{audioUrl && (
  <motion.div
    className="rounded-xl bg-white text-black bg-opacity-10 p-5"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    {/* Hidden audio element controlled by custom UI */}
    <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />
    
    <div className="flex flex-col space-y-4">
      {/* Time display */}
      <div className="flex justify-between text-xs text-black text-opacity-80 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      {/* Control buttons */}
      <div className="flex items-center justify-between space-x-6">
        {/* Play/Pause */}
        <motion.button
          className="p-4 rounded-full bg-white hover:bg-opacity-100 bg-opacity-90 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 shadow-lg"
          onClick={handlePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying 
            ? <Pause className="w-6 h-6" /> 
            : <Play className="w-6 h-6 ml-1" />
          }
        </motion.button>
        
        {/* Mute button */}
        <motion.button
          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-black focus:outline-none"
          onClick={handleMuteToggle}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMuted 
            ? <VolumeX className="w-5 h-5" /> 
            : <Volume2 className="w-5 h-5" />
          }
        </motion.button>
        
        {/* Download button */}
        <motion.button
          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-black focus:outline-none"
          onClick={handleDownload}
          aria-label="Download Audio"
          title="Download MP3"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Download className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  </motion.div>
)}

{/* Info cards */}
<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
  <motion.div 
    className="bg-white bg-opacity-10 p-4 rounded-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <h3 className="text-black text-sm font-semibold mb-2">Available Voices</h3>
    <p className="text-black text-opacity-70 text-xs">
      {selectedLanguage 
        ? `${filteredVoices.length} voices available for ${selectedLanguage}` 
        : 'Select a language to see available voices'
      }
    </p>
  </motion.div>
  
  <motion.div 
    className="bg-white bg-opacity-10 p-4 rounded-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <h3 className="text-black text-sm font-semibold mb-2">Character Limit</h3>
    <p className="text-black text-opacity-70 text-xs">
      Standard quality: 5,000 characters
      <br />
      Neural quality: 3,000 characters
    </p>
  </motion.div>
</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>

    {/* Footer */}
    <footer className={`py-4 px-6 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white bg-opacity-70 text-gray-600'}`}>
      <div className="container mx-auto text-center text-sm">
        <p>Voice Synthesizer Pro • Convert text to lifelike speech</p>
      </div>
    </footer>
  </div>
);
};

export default VoiceSynthesizer;