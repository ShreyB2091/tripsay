import React, { useRef, useState, useCallback } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import Loader from "@/components/Loader";
const cleanText = require('./../app/cleanText');

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
    
    const input = await fetch("/api/cohereAISummary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: chat }),
    });
    const text = await input.json();

    return text.result;
  }

  const handleKeyDown = async () => {

    setLoading(true);

    if (value !== "") {
      let text = value;

      text = cleanText(text);

      if(text.split(' ').filter(String).length > 144) {
        const trim: string = await summarize(text);
        text = trim;
      }
      
      let chatHistory: Conversation[] = [...conversation, { role: "user", content: text }];
      let chat: Conversation[] = [{ role: "system", content: "You are EDA, a travel assistant friend, who is a travel expert. You will talk in a natural friendly manner." }, ...chatHistory];
      
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

      if(numTokens + 512 > 4096) {
        chat = chatHistory;
        let userChat = '', assistantChat = '';
        for(const item of chat) {
          if(item.role === 'user' && item.content !== value) userChat += item.content;
          else if(item.role === 'assistant') assistantChat += item.content;
        }
        const userHistory: string = await summarize(userChat);
        const assistantHistory: string = await summarize(assistantChat);
        chat = [
          { role: "system", content: "You are EDA, a travel assistant friend, who is a travel expert. You will talk in a natural friendly manner." },
          { role: "user", content: userHistory },
          { role: "assistant", content: assistantHistory },
          { role: "user", content: value },
        ];
        chatHistory = chat;
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

  const handleTranscript = (transcript: string) => {
    setValue(transcript);
  }

  const handleRefresh = () => {
    inputRef.current?.focus();
    setValue("");
    setConversation([]);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center w-2/3 mx-auto mt-20 text-center">
        <h1 className="text-6xl text-slate-300">Hi there, I am EDA</h1>
        <div className="my-12 w-full">
          <div className="flex flex-col space-y-4 items-center w-auto">
            <p className="mb-6 font-bold text-slate-300">Please type your query</p>
            <div className="flex flex-row space-x-10 justify-center items-center w-full">
              <input placeholder="Type Here" className="w-full max-w-xs input input-bordered input-ghost" value={value} onChange={handleInput}/>
              <AudioRecorder onTranscript={handleTranscript} />
            </div>
            <button className="btn btn-sm btn-accent my-10" onClick={handleKeyDown}>Submit</button>
            <button className="mx-auto mt-6 btn btn-primary btn-xs" onClick={handleRefresh} >
              Start New Conversation
            </button>
          </div>
          <div className="textarea-ghost mt-10">
            {conversation?.map((item, index) => (
              <React.Fragment key={index}>
                <br />
                {item.role === "assistant" ? (
                  <div className="chat chat-start">
                    <div className="chat-bubble chat-bubble-secondary">
                      <strong className="badge badge-primary">EDA</strong>
                      <br />
                      {item.content}
                    </div>
                  </div>
                ) : (
                  <div className="chat chat-end">
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
          {isLoading && <Loader />}
        </div>
      </div>
    </div>
  );
}
