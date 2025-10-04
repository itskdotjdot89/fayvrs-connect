import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Paperclip, Send, Phone, Video } from "lucide-react";

export default function Messaging() {
  const [message, setMessage] = useState("");

  const messages = [
    { id: 1, sender: "provider", text: "Hi! Thanks for selecting me for your logo design project.", time: "10:30 AM" },
    { id: 2, sender: "user", text: "Great! When can you start?", time: "10:32 AM" },
    { id: 3, sender: "provider", text: "I can start right away. Do you have any specific color schemes or style preferences?", time: "10:33 AM" },
    { id: 4, sender: "user", text: "I'm thinking modern and minimalist, maybe teal and navy colors", time: "10:35 AM" },
    { id: 5, sender: "provider", text: "Perfect! I'll send you some initial concepts by tomorrow.", time: "10:36 AM" },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Avatar className="w-10 h-10 border-2 border-accent">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white font-semibold">
                SJ
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground text-sm">Sarah Johnson</h2>
              <p className="text-xs text-muted-foreground">Logo Designer</p>
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9">
                <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Unlocked Banner */}
      <div className="bg-gradient-to-r from-verified to-primary text-white">
        <div className="max-w-md mx-auto px-4 py-2">
          <p className="text-sm text-center">
            ✓ Contact info unlocked - You can now exchange details
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] space-y-1 ${msg.sender === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-md"
                      : "bg-white text-foreground rounded-tl-md shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-border p-4">
        <div className="max-w-md mx-auto flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="h-11 rounded-2xl"
          />
          
          <Button size="icon" className="w-11 h-11 rounded-xl flex-shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}