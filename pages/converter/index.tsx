
import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Languages, 
  User, 
  Play, 
  Pause, 
  Loader2, 
  AlertTriangle,
  AudioWaveform,
  Download,
  Sparkles,
  Settings,
  Sliders,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../component/navbar';

import { GiMicrophone } from "react-icons/gi";


const Converter = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [pitch, setPitch] = useState(0);
  const [speakingRate, setSpeakingRate] = useState(1);
  const [voiceName, setVoiceName] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [languages, setLanguages] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isConversionSuccess, setIsConversionSuccess] = useState(false);
  const audioRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        // Animation for loading state
        setIsLoading(true);
        
        // Note: Replace with your actual API endpoint and authentication
        const response = await fetch('https://texttospeech.googleapis.com/v1/voices', {
          method: 'GET',
          headers: {
                'X-Goog-User-Project': 'silken-obelisk-454907-v9',
                'Authorization': `Bearer ya29.a0AeXRPp5UVdAQ8nBuNG0U0HN1yfFnAhrjMyDy_gkBa8Sb1Jqnk_KR1AGfNcJj3Ul9I-5y9xjOr5IHsUD0M_2fMfb6iTpnNECBnAGUBs5YURSxkdkx8SLMrgFncr7eLdwsxTWRgbvg4__oMBzPgD977TaejsLMPbUputfzck_h6PozLP0_QL3nRvMle4Zv9Z6UuOBHwdcLZu89iRTdJuLEUrKmXj2zFgwo_OwzutUSVaugKKqeYVf8N6yjF6Qhh_6SRwYEpM0Tpclzgn7Xpi4Ao4isHUeiLTyGX5Ps8wcY3u9HSiC18sfFE4UXlQ8oC-4JrLWOdfYn1rSvFTqRFec6R5evt1-PYzMgXZ8rB7uBscsqcRrmgfv8iBc0xFj0FDGQ0pshJ88iLmhB2GvDeovPilPMRLwjtZuXAye1fwaCgYKAUwSAQ4SFQHGX2MitY2F8w3geVY7L16aFcNGwA0429`,
                'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }

        const data = await response.json();
        const voiceList = data.voices;

        // Extract supported languages from the voices list
        const languageSet = new Set(
          voiceList.map((voice) => voice.languageCodes[0])
        );

        setLanguages(Array.from(languageSet));
        setVoices(voiceList);

        // Set default language and voice
        if (voiceList.length > 0) {
          const defaultLanguage = voiceList[0].languageCodes[0];
          setSelectedLanguage(defaultLanguage);
          
          const defaultVoice = voiceList.find(
            (voice) => voice.languageCodes.includes(defaultLanguage)
          );
          
          if (defaultVoice) {
            setVoiceName(defaultVoice.name);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load voices and languages: ' + (err instanceof Error ? err.message : String(err)));
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  // Update audio time
  useEffect(() => {
    if (audioRef.current) {
      const updateTime = () => {
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
      };
      
      audioRef.current.addEventListener('timeupdate', updateTime);
      audioRef.current.addEventListener('loadedmetadata', updateTime);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updateTime);
          audioRef.current.removeEventListener('loadedmetadata', updateTime);
        }
      };
    }
  }, [audioUrl]);

  const handleConvert = async () => {
    // Reset previous states
    setAudioUrl('');
    setError('');
    setIsConversionSuccess(false);

    // Validate input
    if (!text.trim()) {
      setError('Please enter some text to convert.');
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        audioConfig: {
          audioEncoding: "LINEAR16",
          effectsProfileId: [
            "small-bluetooth-speaker-class-device"
          ],
          pitch: Number(pitch),
          speakingRate: Number(speakingRate)
        },
        input: {
          text: text
        },
        voice: {
          languageCode: selectedLanguage,
          name: voiceName
        }
      };

      // Note: Replace with your actual API endpoint and authentication
      const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
                'X-Goog-User-Project': 'silken-obelisk-454907-v9',
                'Authorization': `Bearer ya29.a0AeXRPp5UVdAQ8nBuNG0U0HN1yfFnAhrjMyDy_gkBa8Sb1Jqnk_KR1AGfNcJj3Ul9I-5y9xjOr5IHsUD0M_2fMfb6iTpnNECBnAGUBs5YURSxkdkx8SLMrgFncr7eLdwsxTWRgbvg4__oMBzPgD977TaejsLMPbUputfzck_h6PozLP0_QL3nRvMle4Zv9Z6UuOBHwdcLZu89iRTdJuLEUrKmXj2zFgwo_OwzutUSVaugKKqeYVf8N6yjF6Qhh_6SRwYEpM0Tpclzgn7Xpi4Ao4isHUeiLTyGX5Ps8wcY3u9HSiC18sfFE4UXlQ8oC-4JrLWOdfYn1rSvFTqRFec6R5evt1-PYzMgXZ8rB7uBscsqcRrmgfv8iBc0xFj0FDGQ0pshJ88iLmhB2GvDeovPilPMRLwjtZuXAye1fwaCgYKAUwSAQ4SFQHGX2MitY2F8w3geVY7L16aFcNGwA0429`,
                'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to convert text to speech');
      }

      const data = await response.json();
      
      // Decode the base64 audio content
      const audioContent = atob(data.audioContent);
      const bytes = new Uint8Array(audioContent.length);
      for (let i = 0; i < audioContent.length; i++) {
        bytes[i] = audioContent.charCodeAt(i);
      }

      // Create a blob URL
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      // Revoke previous URL to prevent memory leaks
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      setIsLoading(false);
      setIsConversionSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setIsConversionSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to convert text to speech: ' + (err instanceof Error ? err.message : String(err)));
      setIsLoading(false);
    }
  };

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Audio controls
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  
  // Format time in mm:ss
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle downloading audio
  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'synthesized-speech.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  // Focus input with effect
  const focusTextInput = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <>
    <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-12 px-4">
        <motion.div 
          className="max-w-lg mx-auto"
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
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            >
              <div className="flex items-center justify-center">
                <motion.div 
                  className="rounded-full bg-white bg-opacity-20 p-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AudioWaveform className="text-red w-8 h-8" />
                </motion.div>
                <motion.h1 
                  className="text-3xl font-bold text-white ml-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Voice Synthesizer
                </motion.h1>
              </div>
              <motion.p 
                className="text-white text-opacity-80 text-center mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Convert your text into natural-sounding speech
              </motion.p>
            </motion.div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
              {/* Success message */}
              <AnimatePresence>
                {isConversionSuccess && (
                  <motion.div 
                    className="flex items-center bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg space-x-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Check className="w-6 h-6 text-green-500" />
                    <p className="text-sm">Speech successfully generated!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Handling */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="flex items-center bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg space-x-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <p className="text-sm">{error}</p>
                    <motion.button 
                      className="ml-auto text-red-500 hover:text-red-700"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setError('')}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Text Input */}
              <motion.div 
                className="space-y-2"
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
                  rows="4"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md resize-none"
                  placeholder="Type or paste your text here..."
                />
              </motion.div>

              {/* Language and Voice Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    id="language"
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      // Update voice to a default voice for the selected language
                      const defaultVoice = voices.find(
                        (voice) => voice.languageCodes.includes(e.target.value)
                      );
                      if (defaultVoice) {
                        setVoiceName(defaultVoice.name);
                      }
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {languages.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="voice" className="block text-sm font-medium text-gray-700">Voice</label>
                  <select
                    id="voice"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {voices
                      .filter((voice) => voice.languageCodes.includes(selectedLanguage))
                      .map((voice) => (
                        <option key={voice.name} value={voice.name}>{voice.name}</option>
                      ))}
                  </select>
                </motion.div>
              </div>

              {/* Advanced Settings Toggle */}
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button 
                  type="button"
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center space-x-2"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Advanced Settings</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </motion.div>

              {/* Advanced Settings Panel */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    className="space-y-4 border-t border-gray-200 pt-4"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Pitch */}
                    <div>
                      <label htmlFor="pitch" className="block text-sm font-medium text-gray-700">Pitch</label>
                      <input
                        type="range"
                        id="pitch"
                        min="-20"
                        max="20"
                        step="1"
                        value={pitch}
                        onChange={(e) => setPitch(e.target.value)}
                        className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-sm text-gray-500">Adjust voice pitch (-20 to 20)</p>
                    </div>

                    {/* Speaking Rate */}
                    <div>
                      <label htmlFor="speakingRate" className="block text-sm font-medium text-gray-700">Speaking Rate</label>
                      <input
                        type="range"
                        id="speakingRate"
                        min="0.25"
                        max="4.0"
                        step="0.05"
                        value={speakingRate}
                        onChange={(e) => setSpeakingRate(e.target.value)}
                        className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-sm text-gray-500">Adjust speaking rate (0.25 to 4.0)</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Convert Button */}
              <motion.button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                onClick={handleConvert}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    <span>Converting...</span>
                  </div>
                ) : (
                  'Convert to Speech'
                )}
              </motion.button>

              {/* Audio Player */}
              {audioUrl && (
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <audio ref={audioRef} src={audioUrl} preload="metadata"  />
                  <div className="flex items-center justify-between">
                    {/* Play/Pause Button */}
                    <button 
                      className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-700 text-white"
                      onClick={handlePlayPause}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    {/* Time Display */}
                    <div className="text-sm text-gray-700">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    {/* Volume Control (Example - Implementation needed) */}
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-gray-500" />
                    </div>

                    {/* Download Button */}
                    <button 
                      className="p-2 rounded-full bg-green-500 hover:bg-green-700 text-white"
                      onClick={handleDownload}
                      aria-label="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Converter;
