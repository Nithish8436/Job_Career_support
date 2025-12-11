import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';

const ChatPage = () => {
    const location = useLocation();
    const initialMessage = location.state?.initialMessage;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { token, user } = useAuth();
    const messagesEndRef = useRef(null);
    const initialMessageSent = useRef(false);

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

    const handleSendMessage = async (messageText = input) => {
        if (!messageText.trim() || loading) return;

        const userMessage = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    message: messageText,
                    history: messages
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
        <div className="flex flex-col h-screen bg-gray-50">
            <Navbar rightContent={
                <div className="text-sm text-slate-600">
                    <span className="font-medium text-indigo-600">AI Coach</span>
                </div>
            } />

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <BackButton />
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">How can I help you today?</h2>
                            <p className="text-gray-600 text-center max-w-md mb-8">
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
                                        className="p-4 text-left border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                                    >
                                        <p className="text-sm font-medium text-gray-700 group-hover:text-primary">{suggestion}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex-shrink-0 mr-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white border border-gray-200 shadow-sm'
                                            }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-base max-w-none 
                                                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-6 first:prose-headings:mt-0
                                                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                                                prose-p:text-gray-700 prose-p:leading-loose prose-p:mb-6 last:prose-p:mb-0
                                                prose-strong:text-gray-900 prose-strong:font-semibold
                                                prose-em:text-gray-700 prose-em:italic
                                                prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                                                prose-code:text-primary prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                                                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-6 prose-pre:overflow-x-auto
                                                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-3
                                                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-3
                                                prose-li:text-gray-700 prose-li:leading-loose prose-li:my-2
                                                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-6
                                                prose-hr:my-8 prose-hr:border-gray-300
                                                prose-table:my-6 prose-table:border-collapse
                                                prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left
                                                prose-td:border prose-td:border-gray-300 prose-td:p-3">
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
                                            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                                You
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex-shrink-0 mr-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            <span className="text-sm text-gray-600">Thinking...</span>
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
            <div className="border-t border-gray-200 bg-white shadow-lg">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-end gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-900 placeholder-gray-400 shadow-sm"
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
                                disabled={loading}
                            />
                        </div>
                        <Button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || loading}
                            size="icon"
                            className="rounded-2xl w-12 h-12 shadow-md hover:shadow-lg transition-all"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
