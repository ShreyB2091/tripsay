import React, { useRef, useState, useCallback } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import Loader from "@/components/Loader";

interface Conversation {
  role: string;
  content: string;
}

const cleanText = (txtin: string) => {

  txtin = txtin.replace(/\'m/g,` am`);
  txtin = txtin.replace(/\'re/g,` are`);
  txtin = txtin.replace(/\blet\'s\b/g,`let us`);
  txtin = txtin.replace(/\'s/g,` is`);
  txtin = txtin.replace(/ain\'t/g,` is not it`);
  txtin = txtin.replace(/n\'t/g,` not`);
  txtin = txtin.replace(/\'ll/g,` will`)
  txtin = txtin.replace(/\'d/g,` would`);
  txtin = txtin.replace(/\'ve/g,` have`);
  txtin = txtin.replace(/\lemme/g,` let me`);
  txtin = txtin.replace(/\gimme/g,` give me`);
  txtin = txtin.replace(/\wanna/g,` want to`);
  txtin = txtin.replace(/\gonna/g,` going to`);
  txtin = txtin.replace(/r u /g,`are you`);
  txtin = txtin.replace(/\bim\b/g,`i am`);
  txtin = txtin.replace(/\bwhats\b/g,`what is`);
  txtin = txtin.replace(/\bwheres\b/g,`where is`);
  txtin = txtin.replace(/\bwhos\b/g,`who is`);
  
  txtin = txtin.replace(/(^\s*)|(\s*$)/gi,"");
  txtin = txtin.replace(/[ ]{2,}/gi," ");
  txtin = txtin.replace(/\n /,"\n");

  const stopwordsymbols = ["+","-","*","%","/","?","!","^","'","\"",",",";","\\","."];
  for (let i = 0; i < stopwordsymbols.length; i++)
  {
    var re = new RegExp("\\" + stopwordsymbols[i], 'g');
    txtin = txtin.replace(re,"");
  }
  return txtin;
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

      if(numTokens + 256 > 4096) {
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
      <div className="flex flex-col items-center justify-center w-2/3 mx-auto mt-40 text-center">
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
