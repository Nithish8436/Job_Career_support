import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Send, Loader2, Sparkles, Menu, Paperclip, X, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Sidebar from '../components/Sidebar';
import SidebarOverlay from '../components/SidebarOverlay';
import ProfileModal from '../components/ProfileModal';

const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialMessage = location.state?.initialMessage;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [resumeContext, setResumeContext] = useState(''); // Store resume text here
    const { token, user, logout } = useAuth();
    const messagesEndRef = useRef(null);
    const initialMessageSent = useRef(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialMessage && messages.length === 0 && !initialMessageSent.current) {
            initialMessageSent.current = true;
            handleSendMessage(initialMessage);
        }
    }, [initialMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogout = () => {
        navigate('/');
        setTimeout(() => {
            logout();
        }, 100);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (messageText = input) => {
        if ((!messageText.trim() && !selectedFile) || loading || uploading) return;

        setLoading(true);
        const currentMessage = messageText; // Capture current input
        setInput(''); // Clear input early for better UX

        // 1. Handle File Upload if exists
        if (selectedFile) {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('resume', selectedFile);
                formData.append('userId', user.id);

                const response = await fetch('http://localhost:5000/api/upload/resume', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();

                    const systemMessage = {
                        role: 'system',
                        content: `Resume "${selectedFile.name}" uploaded successfully. I can now provide personalized advice based on this resume.`
                    };

                    setResumeContext(data.text);  // Store text for future context
                    setMessages(prev => [...prev, systemMessage]);
                    setSelectedFile(null); // Clear selected file after success
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                const errorMessage = {
                    role: 'system',
                    content: 'Failed to upload resume. Please try again.'
                };
                setMessages(prev => [...prev, errorMessage]);
                setLoading(false);
                setUploading(false);
                setInput(currentMessage); // Restore input on failure
                return; // Stop processing
            } finally {
                setUploading(false);
            }
        }

        // 2. Handle Text Message
        if (!currentMessage.trim()) {
            setLoading(false);
            return;
        }

        const userMessage = { role: 'user', content: currentMessage };
        setMessages(prev => [...prev, userMessage]);

        // Check if user is asking for suggestion/feedback and append instruction
        let finalMessage = currentMessage;
        if (currentMessage.toLowerCase().includes('suggestion') || currentMessage.toLowerCase().includes('feedback') || currentMessage.toLowerCase().includes('review')) {
            finalMessage += " (Please provide a short explanation)";
        }

        try {
            // Construct history for API
            let apiHistory = messages.filter(m => !m.hidden).map(({ role, content }) => ({ role, content }));

            // Inject resume context at the START of history if available
            if (resumeContext) {
                apiHistory.unshift({
                    role: 'system',
                    content: `RESUME CONTEXT (Uploaded by user):\n${resumeContext}\n\nINSTRUCTION: Use this resume to answer the user's questions.`
                });
            }

            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    message: finalMessage,
                    history: apiHistory
                })
            });

            const data = await response.json();

            if (data.success) {
                const aiMessage = { role: 'assistant', content: data.message };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
            {/* Mobile Sidebar Overlay */}
            <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                <Sidebar
                    user={user}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                    onLogout={handleLogout}
                    onProfileClick={() => setShowProfileModal(true)}
                    sidebarOpen={sidebarOpen}
                    onCloseSidebar={() => setSidebarOpen(false)}
                />
            </SidebarOverlay>

            {/* Desktop Sidebar */}
            <Sidebar
                user={user}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
                onProfileClick={() => setShowProfileModal(true)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <nav className="border-b border-slate-200/50 bg-white sticky top-0 z-20 backdrop-blur-sm bg-white/80">
                    <div className="px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5 text-slate-700" />
                            </button>
                            <span className="text-lg font-semibold text-slate-900">AI Chat</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                                <span className="font-medium">Welcome, {user?.name?.split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-20">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-3">How can I help you today?</h2>
                                <p className="text-slate-600 text-center max-w-md mb-8">
                                    Ask me anything about your career, resume, interview prep, or job search strategy.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                    {[
                                        "Help me improve my resume",
                                        "Prepare for behavioral interviews",
                                        "Career transition advice",
                                        "Salary negotiation tips"
                                    ].map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(suggestion)}
                                            className="p-4 text-left border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group"
                                        >
                                            <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{suggestion}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-4">
                                {messages.filter(m => !m.hidden).map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="flex-shrink-0 mr-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                                                    <Sparkles className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-md shadow-blue-600/25'
                                                : 'bg-white border border-slate-200 shadow-sm'
                                                }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-base max-w-none 
                                                    prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-6 first:prose-headings:mt-0
                                                    prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                                                    prose-p:text-slate-700 prose-p:leading-loose prose-p:mb-6 last:prose-p:mb-0
                                                    prose-strong:text-slate-900 prose-strong:font-semibold
                                                    prose-em:text-slate-700 prose-em:italic
                                                    prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700
                                                    prose-code:text-blue-700 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                                                    prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-6 prose-pre:overflow-x-auto
                                                    prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-3
                                                    prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-3
                                                    prose-li:text-slate-700 prose-li:leading-loose prose-li:my-2
                                                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:my-6
                                                    prose-hr:my-8 prose-hr:border-slate-300
                                                    prose-table:my-6 prose-table:border-collapse
                                                    prose-th:border prose-th:border-slate-300 prose-th:bg-slate-50 prose-th:p-3 prose-th:text-left
                                                    prose-td:border prose-td:border-slate-300 prose-td:p-3">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                return !inline && match ? (
                                                                    <SyntaxHighlighter
                                                                        style={oneDark}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        className="rounded-lg my-4"
                                                                        {...props}
                                                                    >
                                                                        {String(children).replace(/\n$/, '')}
                                                                    </SyntaxHighlighter>
                                                                ) : (
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="flex-shrink-0 ml-3">
                                                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                                    You
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="flex-shrink-0 mr-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-slate-600">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-200 bg-white shadow-lg">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-end gap-3">
                            <div className="flex-1 relative bg-slate-50 rounded-2xl border border-slate-300 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all shadow-sm flex flex-col justify-end">
                                {selectedFile && (
                                    <div className="px-4 pt-3 pb-1">
                                        <div className="flex items-center gap-2 bg-blue-100/50 text-blue-700 px-3 py-2 rounded-xl text-sm w-fit border border-blue-200">
                                            <FileText className="w-4 h-4" />
                                            <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                                            <button
                                                onClick={() => setSelectedFile(null)}
                                                className="p-1 hover:bg-blue-200 rounded-full transition-colors ml-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-end w-full">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me anything..."
                                        className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-slate-900 placeholder-slate-400"
                                        rows="1"
                                        style={{
                                            minHeight: '52px',
                                            maxHeight: '200px',
                                            height: 'auto'
                                        }}
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        disabled={loading || uploading}
                                    />
                                    <div className="pb-2 pr-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf,.docx,.doc"
                                            onChange={handleFileSelect}
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${selectedFile ? 'text-blue-600 bg-blue-50' : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Upload Resume"
                                            disabled={loading || uploading}
                                        >
                                            <Paperclip className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleSendMessage()}
                                disabled={(!input.trim() && !selectedFile) || loading || uploading}
                                size="icon"
                                className="rounded-2xl w-12 h-12 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white flex-shrink-0"
                            >
                                {loading || uploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            AI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default ChatPage;