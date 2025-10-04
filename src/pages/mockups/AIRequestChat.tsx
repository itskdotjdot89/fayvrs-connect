import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, MapPin, DollarSign } from "lucide-react";

export default function AIRequestChat() {
  const [input, setInput] = useState("");

  const examplePrompts = [
    "Need a logo designer",
    "Looking for a plumber",
    "Web development help",
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">AI Request Helper</h1>
            <p className="text-xs text-muted-foreground">Tell me what you need</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Bot Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm">
                <p className="text-foreground text-sm">
                  Hi! I'm here to help you find the perfect service or product. What are you looking for today?
                </p>
              </div>
            </div>
          </div>

          {/* Example Chips */}
          <div className="flex gap-2 flex-wrap pl-11">
            {examplePrompts.map((prompt) => (
              <Badge 
                key={prompt} 
                variant="outline" 
                className="rounded-full px-3 py-1.5 cursor-pointer hover:bg-accent hover:border-primary transition-colors"
              >
                {prompt}
              </Badge>
            ))}
          </div>

          {/* User Message (example) */}
          <div className="flex gap-3 justify-end">
            <div className="flex-1 max-w-[80%]">
              <div className="bg-primary text-white rounded-2xl rounded-tr-md p-4 shadow-sm">
                <p className="text-sm">
                  I need a logo designer for my startup
                </p>
              </div>
            </div>
          </div>

          {/* Bot Response with Parsed Info */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm space-y-3">
                <p className="text-foreground text-sm">
                  Great! I've prepared your request. Here's what I understood:
                </p>
                <div className="bg-surface rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="default" className="rounded-full">Service</Badge>
                    <span className="text-muted-foreground">Logo Design</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Your Location</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>Budget: To be discussed</span>
                  </div>
                </div>
                <p className="text-foreground text-sm">
                  Ready to post this request?
                </p>
              </div>
            </div>
          </div>

          {/* Typing Indicator */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-border p-4">
        <div className="max-w-md mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you need..."
            className="min-h-[48px] max-h-[120px] rounded-2xl resize-none"
            rows={1}
          />
          <Button size="icon" className="w-12 h-12 rounded-xl flex-shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}