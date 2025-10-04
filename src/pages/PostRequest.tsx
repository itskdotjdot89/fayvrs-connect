import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
export default function PostRequest() {
  const navigate = useNavigate();
  const [promptText, setPromptText] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ promptText });
    navigate("/feed");
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-center mb-8">
          What do you need?
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            placeholder="Describe what you're looking for..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="min-h-[200px] text-base resize-none"
            required
          />
          
          <Button type="submit" size="lg" className="w-full">
            Post Request
          </Button>
        </form>
      </div>
    </div>
  );
}