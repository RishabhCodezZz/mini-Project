import React, { useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [resetCounter, setResetCounter] = useState(0);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleNewChat = async () => {
    // Clears backend chat history and triggers a frontend reset
    try {
      await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'RESET_CHAT' }),
      });
    } catch (e) {
      // Non-blocking; UI still resets
      console.warn('Failed to reset backend history', e);
    } finally {
      setResetCounter((prev) => prev + 1);
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#18191A]' : 'bg-gray-50'}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isDarkMode={isDarkMode} onNewChat={handleNewChat} />
      <div className="flex-1 flex flex-col">
        <ChatInterface isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} resetCounter={resetCounter} />
      </div>
    </div>
  );
}

export default App;
