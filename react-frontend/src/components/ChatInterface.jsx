import React, { useState, useRef, useEffect } from 'react';
import { Send, Sun, Moon, Volume2, MessageSquare, StopCircle } from 'lucide-react';

const ChatInterface = ({ isDarkMode, onToggleDarkMode, resetCounter }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // Track speech status
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // === IMPROVED TEXT TO SPEECH ===
    const speakText = (text) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Optional: Choose a better voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0; 
        utterance.pitch = 1.0;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage.content })
            });

            const data = await response.json();

            if (data.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data.answer,
                    sources: data.sources || [],
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: "I'm having trouble connecting to the database. Please try again.",
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Error: Could not connect to the backend. Is server.py running?",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const hasMessages = messages.length > 0;

    // Reset conversation whenever the parent increments resetCounter
    useEffect(() => {
        setMessages([]);
        setInputValue('');
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [resetCounter]);

    return (
        <div className={`flex flex-col h-screen w-full ${isDarkMode ? 'bg-[#18191A]' : 'bg-gray-50'}`}>
            
            {/* Top Navigation */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-[#2A2B32] bg-[#18191A]' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h1 className={`text-lg font-bold font-inter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        NutriBot AI
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={onToggleDarkMode} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#2A2B32] text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {!hasMessages && (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                        <MessageSquare className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Ask me for a personalized diet plan!
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] md:max-w-[75%] rounded-2xl px-6 py-4 shadow-sm ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : isDarkMode ? 'bg-[#242526] text-white border border-[#2A2B32]' : 'bg-white text-gray-900 border border-gray-200'
                            }`}>
                            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>

                            {/* === READ ALOUD BUTTON AT THE END === */}
                            {message.role === 'assistant' && (
                                <div className="mt-4 pt-3 border-t border-gray-500/20 flex items-center justify-between">
                                    <button 
                                        onClick={() => speakText(message.content)}
                                        className={`flex items-center space-x-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-full ${
                                            isSpeaking 
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                    >
                                        {isSpeaking ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                        <span>{isSpeaking ? "Stop Speaking" : "Read Aloud"}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className={`max-w-[70%] rounded-2xl px-6 py-4 shadow-sm ${
                            isDarkMode ? 'bg-[#242526] text-white border border-[#2A2B32]' : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                            <div className="flex items-center space-x-2">
                                {[0, 1, 2].map((dot) => (
                                    <span
                                        key={dot}
                                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                                        style={{ animationDelay: `${dot * 0.15}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 md:p-6 border-t ${isDarkMode ? 'border-[#2A2B32] bg-[#18191A]' : 'border-gray-200 bg-white'}`}>
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center space-x-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="I am 21, 75kg. Suggest a high protein lunch..."
                        className={`flex-1 px-6 py-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all ${
                            isDarkMode
                            ? 'border-[#2A2B32] bg-[#242526] text-white placeholder-gray-500'
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                    />
                    <button type="submit" disabled={!inputValue.trim() || isLoading} className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;