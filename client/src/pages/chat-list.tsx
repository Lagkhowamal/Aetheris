import { useState } from "react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { MessageSquare, Plus, ArrowRight, Bot } from "lucide-react";
import { useConversations, useCreateConversation } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ChatList() {
  const [, setLocation] = useLocation();
  const { data: conversations, isLoading } = useConversations();
  const createConversation = useCreateConversation();
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createConversation.mutate(newTitle, {
      onSuccess: (data) => {
        setLocation(`/chat/${data.id}`);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop')] bg-cover opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-500/20 p-2 rounded-xl backdrop-blur-md border border-teal-400/20">
              <Bot className="w-6 h-6 text-teal-300" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight font-display">Clinical AI Assistant</h1>
          </div>
          <p className="text-slate-300 max-w-lg">Consult with our advanced medical AI for diagnosis support, drug interaction checks, and clinical guidelines.</p>
        </div>

        <div className="relative z-10 w-full sm:w-auto flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
          <Input 
            placeholder="New topic..." 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="bg-transparent border-none text-white placeholder:text-white/50 h-10 w-48 focus-visible:ring-0"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <Button 
            onClick={handleCreate} 
            disabled={createConversation.isPending || !newTitle.trim()}
            className="bg-teal-500 hover:bg-teal-400 text-white rounded-xl shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" /> Start Chat
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-foreground px-1">Recent Consultations</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-border/50"></div>)}
          </div>
        ) : conversations?.length === 0 ? (
          <div className="text-center p-12 bg-card border-dashed border-2 rounded-3xl">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold">No history found</h3>
            <p className="text-muted-foreground">Start a new conversation above to consult the AI.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversations?.map((conv) => (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <Card className="cursor-pointer hover-elevate border-border/50 bg-card shadow-sm rounded-2xl group transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{conv.title}</h4>
                        <p className="text-sm text-muted-foreground">{format(new Date(conv.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
