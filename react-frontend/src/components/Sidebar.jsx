import React, { useState } from 'react';
import {
    Plus,
    MessageSquare,
    Trash2,
    Settings,
    User,
    PanelLeftClose,
    PanelLeft,
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, isDarkMode = true, onNewChat }) => {
    const [conversations, setConversations] = useState([
        { id: 1, title: 'Diet Plan', active: true },
    ]);

    const handleNewChat = () => {
        const newConversation = {
            id: Date.now(),
            title: 'New Chat',
            active: true,
        };
        setConversations((prev) =>
            prev.map((conv) => ({ ...conv, active: false })).concat(newConversation)
        );
        onNewChat?.();
    };

    const handleConversationClick = (id) => {
        setConversations((prev) =>
            prev.map((conv) => ({ ...conv, active: conv.id === id }))
        );
    };

    const handleDeleteConversation = (id) => {
        setConversations((prev) => prev.filter((conv) => conv.id !== id));
    };

    if (!isOpen) {
        // COLLAPSED
        return (
            <div className={`w-14 flex flex-col h-full items-center py-4 justify-between ${isDarkMode ? 'bg-[#18191A]' : 'bg-gray-50'}`}>
                <div className="space-y-4 w-full items-center flex flex-col">
                    <button
                        onClick={onToggle}
                        className={`p-3 rounded-2xl transition ${isDarkMode ? 'hover:bg-[#2A2B32] text-slate-300 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
                    >
                        <PanelLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNewChat}
                        className={`p-3 rounded-2xl transition ${isDarkMode ? 'hover:bg-[#2A2B32] text-slate-300 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 items-center mt-2 w-full">
                        {conversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => handleConversationClick(conversation.id)}
                                className={`p-3 rounded-2xl w-11 h-11 flex items-center justify-center transition-all duration-200 ${conversation.active
                                    ? isDarkMode
                                        ? 'bg-[#2A2B32] text-white'
                                        : 'bg-blue-500 text-white'
                                    : isDarkMode
                                        ? 'text-slate-300 hover:bg-[#2A2B32] hover:text-white'
                                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-4 w-full items-center flex flex-col">
                    <button className={`p-3 rounded-2xl transition ${isDarkMode ? 'hover:bg-[#2A2B32] text-slate-300 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}>
                        <User className="w-5 h-5" />
                    </button>
                    <button className={`p-3 rounded-2xl transition ${isDarkMode ? 'hover:bg-[#2A2B32] text-slate-300 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}>
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // EXPANDED
    return (
        <div className={`w-72 flex flex-col h-full shadow-xl ${isDarkMode ? 'bg-[#18191A]' : 'bg-gray-50'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-[#2A2B32]' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onToggle}
                        className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-[#2A2B32] text-slate-300 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
                    >
                        <PanelLeftClose className="w-5 h-5" />
                    </button>
                </div>
                <button
                    onClick={handleNewChat}
                    className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-200 font-inter shadow-sm hover:shadow-md ${isDarkMode
                        ? 'bg-[#2A2B32] hover:bg-[#3A3B42] text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">New Chat</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 ${conversation.active
                                ? isDarkMode
                                    ? 'bg-[#2A2B32] text-white shadow-sm'
                                    : 'bg-blue-500 text-white shadow-sm'
                                : isDarkMode
                                    ? 'text-slate-300 hover:bg-[#2A2B32] hover:text-white'
                                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                }`}
                            onClick={() => handleConversationClick(conversation.id)}
                        >
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate text-sm font-inter">
                                    {conversation.title}
                                </span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteConversation(conversation.id);
                                }}
                                className={`opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all duration-200 ${isDarkMode
                                    ? 'hover:bg-[#3A3B42]'
                                    : 'hover:bg-gray-300'
                                    }`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'border-[#2A2B32]' : 'border-gray-200'}`}>
                <div className="space-y-3">
                    <button className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 font-inter ${isDarkMode
                        ? 'text-slate-300 hover:bg-[#2A2B32] hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}>
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">My Account</span>
                    </button>
                    <button className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 font-inter ${isDarkMode
                        ? 'text-slate-300 hover:bg-[#2A2B32] hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}>
                        <Settings className="w-5 h-5" />
                        <span className="text-sm font-medium">Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
