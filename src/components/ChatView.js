'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTasks } from '@/context/TaskContext';
import { useRoutines } from '@/context/RoutineContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, User, Bot, Lightbulb, XCircle, CheckCircle2, Mic } from 'lucide-react';
import { marked } from 'marked';

const SUGGESTIONS = [
  'What should I focus on right now?',
  'Help me plan my day',
  'Which tasks are most urgent?',
  "I'm feeling overwhelmed, help me prioritize",
  'Create a study schedule for this week',
  'Draft an email to request a deadline extension',
];

const WELCOME_MESSAGE = {
  role: 'ai',
  content:
    "Hey! 👋 I'm your LifeLine AI assistant. I can see all your tasks and help you stay on top of things. What would you like to work on?",
  timestamp: new Date(),
};

export default function ChatView() {
  const { tasks, addTask } = useTasks();
  const { routines, addRoutine } = useRoutines();

  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lifeline_chat_history');
      if (saved) {
        const { messages: savedMessages, lastUpdated } = JSON.parse(saved);
        // Only keep if within the last 1 hour (3600000 ms)
        if (Date.now() - lastUpdated < 3600000) {
          setMessages(savedMessages);
        } else {
          localStorage.removeItem('lifeline_chat_history');
        }
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  }, []);

  // Save chat history on update
  useEffect(() => {
    if (messages.length > 1) { // Don't save if it's just the welcome message
      localStorage.setItem('lifeline_chat_history', JSON.stringify({
        messages,
        lastUpdated: Date.now()
      }));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || isLoading) return;

      const userMsg = { role: 'user', content: trimmed, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);
      setError('');

      try {
        const historyToSend = messages.slice(-20); // Send last 20 messages for context
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history: historyToSend, tasks, routines, context: '', currentTime: new Date().toString() }),
        });

        if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'chat_failed');

        const data = await res.json();
        
        const aiMsg = {
          role: 'ai',
          content: data.response || data.message || 'Sorry, I didn\'t get a response.',
          timestamp: new Date(),
          actions: data.actions || [],
        };
        
        // Execute any actions returned by the AI
        if (data.actions && data.actions.length > 0) {
          for (const action of data.actions) {
            if (action.type === 'add_task' && action.payload) {
              addTask(action.payload);
            } else if (action.type === 'add_routine' && action.payload) {
              addRoutine(action.payload);
            }
          }
        }
        
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        if (err.message === 'rate_limit') {
          setError('AI is currently handling too many requests. Taking a quick breather...');
        } else {
          setError('Failed to get a response. Please try again.');
        }
        const errorMsg = {
          role: 'ai',
          content: "I'm having trouble connecting right now. Please try again in a moment. 🔄",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, tasks, routines, addTask, addRoutine],
  );

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
           transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const showSuggestions = messages.length <= 1;

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem('lifeline_chat_history');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Chat Container */}
      <div className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {messages.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
            <button 
              onClick={clearChat}
              style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <XCircle size={12} /> Clear Chat
            </button>
          </div>
        )}
        {/* Messages */}
        <div className="chat-messages p-4" style={{ flex: 1, overflowY: 'auto' }}>
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}
              >
                <div className={`chat-avatar flex items-center justify-center ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="chat-bubble">
                  <div 
                    className="prose prose-sm max-w-none prose-p:text-sm prose-p:leading-relaxed prose-headings:text-base prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-li:my-1"
                    dangerouslySetInnerHTML={{ __html: msg.role === 'ai' ? marked.parse(msg.content) : msg.content }} 
                  />
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {msg.actions.map((action, i) => (
                        <div key={i} style={{ 
                          display: 'flex', alignItems: 'center', gap: '4px', 
                          background: 'rgba(16, 185, 129, 0.1)', 
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          color: 'var(--accent-green)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          <CheckCircle2 size={12} />
                          Added {action.type === 'add_task' ? 'Task' : 'Routine'}: {action.payload?.title || (action.type === 'add_task' ? 'New Task' : 'New Routine')}
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-tertiary)',
                      marginTop: 6,
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="chat-message ai"
              >
                <div className="chat-avatar flex items-center justify-center ai"><Bot size={16} /></div>
                <div className="chat-bubble">
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggested Prompts */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-sm)',
                  marginTop: 'var(--space-md)',
                  justifyContent: 'center',
                }}
              >
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="quick-action flex items-center gap-2"
                    onClick={() => handleSuggestion(s)}
                  >
                    <Lightbulb size={14} className="text-orange" /> {s}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                background: 'rgba(239,68,68,0.1)',
                borderTop: '1px solid rgba(239,68,68,0.2)',
                fontSize: 13,
                color: 'var(--accent-red)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span><XCircle size={14} className="inline mr-1" /> {error}</span>
              <button className="btn btn-ghost" onClick={() => setError('')} style={{ fontSize: 12, color: 'var(--accent-red)' }}>
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="chat-input-area p-4 border-t border-border-color">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Ask me anything about your tasks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`btn btn-icon ${isListening ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'btn-ghost'}`}
              onClick={toggleListening}
              disabled={isLoading}
              title={isListening ? "Stop listening" : "Start Voice Typing"}
              style={{
                color: isListening ? 'var(--accent-red)' : 'var(--text-secondary)',
                background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                border: isListening ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
              }}
            >
              <Mic size={18} className={isListening ? 'animate-pulse' : ''} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              title="Send message"
            >
              {isLoading ? (
                <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} />
              ) : (
                <Send size={18} />
              )}
            </motion.button>
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
