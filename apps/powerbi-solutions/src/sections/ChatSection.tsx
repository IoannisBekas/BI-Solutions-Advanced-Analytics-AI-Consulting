import { useState, useRef, useEffect, useCallback } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { MessageSquare, Send, Bot, User, Database, Calculator, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { askClaude } from '@/utils/claude';
import type { AnalysisResult, ChatMessage } from '@/types';

interface ChatSectionProps {
  result: AnalysisResult | null;
  chatRef: React.RefObject<HTMLDivElement | null>;
}

const MAX_MESSAGES = 100;

const suggestedQuestions = [
  'How many tables are in the model?',
  'List all tables',
  'How many measures?',
  'What relationships exist?',
  'Give me a model summary'
];

/** Sanitize text to prevent XSS when rendering API responses */
function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function ChatSection({ result, chatRef }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: result?.model
        ? `Hello! I've analyzed your model "${result.model.name || 'Unnamed Model'}". Ask me anything about tables, columns, measures, or relationships!`
        : "Hello! Upload a TMDL file first, then ask me anything about your Power BI model.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: chatContainerRef, isVisible: chatContainerVisible } = useScrollAnimation<HTMLDivElement>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Abort in-flight request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!result?.model) {
      return;
    }

    const modelName = result.model.name || 'Unnamed Model';
    const summaryText = `${result.summary.tableCount} tables, ${result.summary.measureCount} measures, and ${result.summary.relationshipCount} relationships`;

    setMessages((currentMessages) => {
      if (currentMessages.length !== 1) {
        return currentMessages;
      }

      return [
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I've analyzed your model "${modelName}" with ${summaryText}. Ask me anything!`,
          timestamp: new Date()
        }
      ];
    });
  }, [result]);

  const handleSendMessage = useCallback(async (question: string = inputValue) => {
    if (!question.trim()) return;

    // Abort any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      if (updated.length > MAX_MESSAGES) {
        return [updated[0], ...updated.slice(updated.length - (MAX_MESSAGES - 1))];
      }
      return updated;
    });
    setInputValue('');
    setIsTyping(true);

    try {
      const answer = await askClaude(question, result?.model || null, controller.signal);

      // Don't update state if aborted
      if (controller.signal.aborted) return;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: sanitizeText(answer),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (!controller.signal.aborted) {
        setIsTyping(false);
      }
    }
  }, [inputValue, result?.model]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section
      ref={chatRef}
      className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Shape */}
      <div className="abstract-bg">
        <div className="abstract-shape shape-2" style={{ opacity: 0.2 }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`scroll-hidden ${headerVisible ? 'scroll-visible' : ''} text-center mb-12`}
        >
          <div className="badge mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>Ask Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-black mb-4">
            Chat With Your Model
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ask anything about your Power BI model. Get instant answers about tables, measures, relationships, and more.
          </p>
        </div>

        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          className={`scroll-hidden-scale stagger-1 ${chatContainerVisible ? 'scroll-visible-scale' : ''} card-light overflow-hidden`}
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-black font-medium">TMDL Assistant</h3>
              <p className="text-xs text-muted-foreground">Powered by AI</p>
            </div>
            {result?.model && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Model Loaded
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="h-[250px] sm:h-[400px] overflow-y-auto p-4 space-y-4 bg-secondary/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${message.role === 'user'
                    ? 'bg-black'
                    : 'bg-white border border-border'
                  }
                `}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-black" />
                  )}
                </div>
                <div className={`
                  max-w-[80%] p-3 rounded-2xl text-sm
                  ${message.role === 'user'
                    ? 'bg-black text-white rounded-tr-sm'
                    : 'bg-white border border-border rounded-tl-sm'
                  }
                `}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center">
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div className="bg-white border border-border rounded-tl-sm rounded-2xl p-3 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length < 3 && result?.model && (
            <div className="px-4 py-3 bg-white border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSendMessage(question)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:bg-black hover:text-white transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={result?.model ? "Ask about your model..." : "Upload a TMDL file first..."}
                disabled={!result?.model || isTyping}
                aria-label="Ask a question about your Power BI model"
                className="flex-1 bg-secondary border-0 focus:ring-2 focus:ring-black/10 rounded-full px-4"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || !result?.model || isTyping}
                aria-label="Send message"
                className="bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 w-11 h-11 sm:w-10 sm:h-10 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Database, label: 'Table Analysis', desc: 'Get details about any table' },
            { icon: Calculator, label: 'Measure Info', desc: 'Learn about DAX measures' },
            { icon: GitBranch, label: 'Relationships', desc: 'Understand model connections' }
          ].map((feature, index) => (
            <div
              key={feature.label}
              className={`scroll-hidden stagger-${index + 2} ${chatContainerVisible ? 'scroll-visible' : ''} card-light p-4 text-center`}
            >
              <feature.icon className="w-5 h-5 text-black mx-auto mb-2" />
              <p className="text-black font-medium text-sm">{feature.label}</p>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
