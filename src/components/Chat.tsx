import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "How can I help you today? I'm a smart genius assistant",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://abhijeetkalamkarai.app.n8n.cloud/webhook-test/mychatapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full webhook response:", data);

      // Extract only the output text from the response
      let assistantContent = "I'm sorry, I couldn't process your request.";
      
      if (data && typeof data.output === "string") {
        assistantContent = data.output;
      } else if (data && data.message) {
        assistantContent = data.message;
      } else if (typeof data === "string") {
        assistantContent = data;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center py-8 border-b border-border">
          <div className="text-center">
            <div className="w-16 h-16 bg-chat-logo rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-border">
              <Bot className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">A.S Chatbot</h1>
            <p className="text-chat-subtitle mt-2">
              Intelligent assistant designed for high-level reasoning and real-time assistance
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-slide-in ${
                  message.role === "user" ? "flex justify-end" : "flex justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-chat-bubble-user text-chat-bubble-user-foreground ml-12"
                      : "bg-chat-bubble-assistant text-chat-bubble-assistant-foreground mr-12"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start message-slide-in">
                <div className="bg-chat-bubble-assistant text-chat-bubble-assistant-foreground rounded-2xl px-4 py-3 mr-12">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full typing-animation"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full typing-animation" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full typing-animation" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  disabled={isLoading}
                  className="w-full bg-chat-input border-chat-input-border rounded-2xl px-6 py-4 text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-6 py-4 transition-all duration-200 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;