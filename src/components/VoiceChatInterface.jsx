import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Mic, 
  MicOff, 
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Loader2,
  User
} from "lucide-react";
import Avatar3D from "./Avatar3D";

export default function VoiceChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading,
  agentName = "Agent",
  agentType = "aura",
  placeholder = "Type your message..."
}) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const streamRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setInputValue(transcript);

        // If final result, send message
        if (event.results[event.results.length - 1].isFinal) {
          handleSend(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      stopCamera();
    };
  }, []);

  // Speak assistant responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && audioEnabled && synthRef.current) {
      speakText(lastMessage.content);
    }
  }, [messages, audioEnabled]);

  const speakText = (text) => {
    if (!synthRef.current || !audioEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on agent type
    const voices = synthRef.current.getVoices();
    
    if (agentType === 'aura') {
      // FEMALE voice for Aura - prioritize natural female voices
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Google UK English Female') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Moira') ||
        voice.name.includes('Female') ||
        voice.name.includes('female') ||
        (voice.lang.includes('en') && voice.name.includes('woman'))
      ) || voices.find(voice => voice.name.toLowerCase().includes('female'));
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      // Feminine voice parameters
      utterance.rate = 0.95; // Slightly slower, more articulate
      utterance.pitch = 1.2; // Higher pitch for female voice
      utterance.volume = 1;
      
    } else {
      // MALE voice for Boltz - prioritize natural male voices
      const maleVoice = voices.find(voice => 
        voice.name.includes('Google UK English Male') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Fred') ||
        voice.name.includes('Male') ||
        voice.name.includes('male') ||
        (voice.lang.includes('en') && voice.name.includes('man'))
      ) || voices.find(voice => voice.name.toLowerCase().includes('male'));
      
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
      
      // Masculine voice parameters
      utterance.rate = 1.0; // Normal speed, confident
      utterance.pitch = 0.8; // Lower pitch for male voice
      utterance.volume = 1;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleCamera = async () => {
    if (cameraEnabled) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraEnabled(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  const toggleAudio = () => {
    if (audioEnabled && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleSend = (messageText = inputValue) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) return;

    onSendMessage(trimmedMessage);
    setInputValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get agent image with proper positioning
  const getAgentImage = () => {
    const baseUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/a5a6b8d86_boltz_arua_we_got_it_from_here.png";
    
    // Aura is the girl on the left (30% position)
    // Boltz is the robot on the right (70% position)
    const objectPosition = agentType === 'aura' ? '30% center' : '70% center';
    
    return { url: baseUrl, position: objectPosition };
  };

  const agentImage = getAgentImage();

  return (
    <Card className="border-2 border-yellow-500/30 bg-gray-900">
      <CardContent className="p-6 space-y-4">
        {/* Control Panel */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {/* Agent Profile Image */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-500/30">
                <img 
                  src={agentImage.url}
                  alt={agentName}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: agentImage.position }}
                />
              </div>
              {/* 3D Avatar */}
              <Avatar3D agentType={agentType} isSpeaking={isSpeaking} />
            </div>
            <div>
              <h3 className="font-bold text-yellow-400">{agentName}</h3>
              <p className="text-xs text-gray-400">
                {isSpeaking ? `Speaking (${agentType === 'aura' ? 'Female' : 'Male'} voice)...` : isListening ? 'Listening...' : 'Ready'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleListening}
              className={`${isListening ? 'bg-red-600 text-white border-red-600' : 'border-yellow-500/30 text-yellow-400'}`}
              title={isListening ? "Stop Listening" : "Start Voice Input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleCamera}
              className={`${cameraEnabled ? 'bg-green-600 text-white border-green-600' : 'border-yellow-500/30 text-yellow-400'}`}
              title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
            >
              {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleAudio}
              className={`${audioEnabled ? 'bg-blue-600 text-white border-blue-600' : 'border-yellow-500/30 text-gray-400'}`}
              title={audioEnabled ? "Mute Voice" : "Unmute Voice"}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Camera Feed */}
        {cameraEnabled && (
          <div className="rounded-lg overflow-hidden border-2 border-green-500/30 bg-gray-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Messages */}
        <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-800 rounded-lg border border-yellow-500/20">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-yellow-600 text-black'
                    : agentType === 'aura'
                    ? 'bg-green-600 text-white'
                    : 'bg-yellow-500 text-black'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`p-4 rounded-lg ${agentType === 'aura' ? 'bg-green-600' : 'bg-yellow-500'} text-white`}>
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : placeholder}
            disabled={isLoading || isListening}
            className="flex-1 bg-gray-800 border-yellow-500/30 text-white"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="gold-gradient text-black hover:opacity-90"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}