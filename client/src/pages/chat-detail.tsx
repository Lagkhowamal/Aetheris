import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Send, Bot, User, Loader2 } from "lucide-react";
import { useConversation, useChatStream } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export default function ChatDetail() {
  const [, params] = useRoute("/chat/:id");
  const conversationId = parseInt(params?.id || "0");
  const { user } = useAuth();
  
  const { data: conversation, isLoading } = useConversation(conversationId);
  const { messages, sendMessage, isStreaming, resetMessages } = useChatStream(
    conversationId,
    conversation?.messages || []
  );

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync initial messages when conversation loads
  useEffect(() => {
    if (conversation?.messages && !isStreaming) {
      resetMessages(conversation.messages);
    }
  }, [conversation, isStreaming, resetMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  if (isLoading) return <div className="flex items-center justify-center h-[calc(100vh-100px)]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!conversation) return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Chat not found</h2></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 relative">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="mr-4 shrink-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="truncate">
            <h2 className="font-bold text-foreground truncate">{conversation.title}</h2>
            <p className="text-xs text-muted-foreground font-medium flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> AI Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30 dark:bg-background relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
            <Bot className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-xl font-bold font-display text-foreground">How can I assist you clinically today?</h3>
            <p className="max-w-sm mt-2 text-muted-foreground">Ask about diagnoses, drug interactions, or general medical knowledge.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className={`w-10 h-10 shrink-0 border-2 ${msg.role === 'user' ? 'border-primary/20' : 'border-purple-500/20 shadow-sm'}`}>
                {msg.role === 'user' ? (
                  <>
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {user?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div 
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-white dark:bg-slate-900 border border-border/50 text-foreground rounded-tl-sm'
                }`}
              >
                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content || (msg.role === 'assistant' && isStreaming && idx === messages.length - 1 ? (
                    <span className="flex items-center gap-1.5 h-5">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </span>
                  ) : '')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-card z-10">
        <div className="relative flex items-center max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900 border border-border/80 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all p-1">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your medical query..."
            className="flex-1 border-none bg-transparent h-12 px-4 shadow-none focus-visible:ring-0 text-base"
            disabled={isStreaming}
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground ml-1"
          >
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
