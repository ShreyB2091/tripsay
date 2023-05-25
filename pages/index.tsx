import React, { useRef, useState, useCallback } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";

interface Conversation {
  role: string;
  content: string;
}

export default function Home() {

  const [isLoading, setLoading] = useState(false);
  const [value, setValue] = useState<string>("");
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const summarize = async (chat: string) => {
    
    const input = await fetch("/api/textSummarizer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: chat }),
    });
    const text = await input.json();
    console.log(text.result);
    return text.result;
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === "Enter") {
      setLoading(true);

      const chatHistory: Conversation[] = [...conversation, { role: "user", content: value }];
      let chat: Conversation[] = [{ role: "system", content: "You are a travel assistant friend, who is a travel expert." }, ...chatHistory];
      
      const tokenCount = await fetch("/api/countTokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: chat }),
      });
      const tokens = await tokenCount.json();
      console.log(tokens.result);
      const numTokens = tokens.result;

      if(numTokens + 256 > 4096) {
        chat = chatHistory;
        let userChat = '', assistantChat = '';
        for(const item of chat) {
          if(item.role === 'user' && item.content !== value) userChat += item.content;
          else if(item.role === 'assistant') assistantChat += item.content;
        }
        const userHistory: string = await summarize(userChat);
        const assistantHistory: string = await summarize(assistantChat);
        chat = [{ role: "user", content: userHistory }, { role: "assistant", content: assistantHistory }, { role: "user", content: value }];
      }

      const response = await fetch("/api/openAIChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: chat }),
      });
      const data = await response.json();

      setValue("");
      setConversation([
        ...chatHistory,
        { role: "assistant", content: data.result.choices[0].message.content },
      ]);
    }

    setLoading(false);
  };

  const handleRefresh = () => {
    inputRef.current?.focus();
    setValue("");
    setConversation([]);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center w-2/3 mx-auto mt-40 text-center">
        <h1 className="text-6xl text-slate-300">Hi there, I am EDA</h1>
        <div className="my-12">
          <div className="flex flex-col space-y-4 items-center">
            <p className="mb-6 font-bold text-slate-300">Please type your query</p>
            <input placeholder="Type Here" className="w-full max-w-xs input input-bordered input-ghost" value={value} onChange={handleInput} onKeyDown={handleKeyDown} />
            <VoiceRecorder/>
            <button className="mx-auto mt-6 btn btn-primary btn-xs" onClick={handleRefresh} >
              Start New Conversation
            </button>
          </div>
          <div className="textarea-ghost mt-10">
            {conversation?.map((item, index) => (
              <React.Fragment key={index}>
                <br />
                {item.role === "assistant" ? (
                  <div className="chat chat-end">
                    <div className="chat-bubble chat-bubble-secondary">
                      <strong className="badge badge-primary">EDA</strong>
                      <br />
                      {item.content}
                    </div>
                  </div>
                ) : (
                  <div className="chat chat-start">
                    <div className="chat-bubble chat-bubble-primary">
                      <strong className="badge badge-secondary">User</strong>
                      <br />
                      {item.content}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          {
            isLoading && 
            <div>
              <div className="modal modal-bottom modal-open">
                <div className="alert alert-info shadow-lg w-1/3 mb-10 m-auto">
                  <div>
                    <progress className="progress w-64"></progress>
                    <span className="ml-12">Please wait ... Processing your query</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
