"use client";
import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Send, Bot, User, Terminal, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import vscDarkPlus from 'react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // LOCALSTORAGE'DAN YÜKLEME
  useEffect(() => {
    const savedChats = localStorage.getItem('ai-code-chats');
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChats(parsed);
      if (parsed.length > 0) setActiveChatId(parsed[0].id);
    } else {
      createNewChat();
    }
  }, []);

  // LOCALSTORAGE'A KAYDETME
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('ai-code-chats', JSON.stringify(chats));
    }
  }, [chats]);

  const createNewChat = () => {
    const newId = Date.now();
    const newChat: Chat = { id: newId, title: `Yeni Sohbet`, messages: [] };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
  };

  const deleteChat = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Butona tıklayınca sohbetin seçilmesini engelle
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    localStorage.setItem('ai-code-chats', JSON.stringify(updatedChats));
    if (activeChatId === id) {
      setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    let currentChatId = activeChatId;

    // 1. EĞER SEÇİLİ SOHBET YOKSA VEYA LİSTE BOŞSA YENİ OLUŞTUR
    if (!currentChatId) {
      const newId = Date.now();
      const newChat: Chat = { 
        id: newId, 
        title: input.substring(0, 30), 
        messages: [] 
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newId);
      currentChatId = newId;
    }

    const currentInput = input;
    const userMsg: Message = { role: 'user', content: currentInput };
    setInput('');
    setIsLoading(true);

    // 2. MESAJI İLGİLİ SOHBETE EKLE
    setChats(prev => prev.map(c => {
      if (c.id === currentChatId) {
        // İlk mesajda başlığı güncelle (Eğer zaten oluşturulurken güncellenmediyse diye çift kontrol)
        const newTitle = c.messages.length === 0 ? currentInput.substring(0, 30) : c.title;
        return { 
          ...c, 
          title: newTitle,
          messages: [...c.messages, userMsg] 
        };
      }
      return c;
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });
      
      const data = await res.json();
      
      setChats(prev => prev.map(c => 
        c.id === currentChatId ? { 
          ...c, 
          messages: [...c.messages, { role: 'bot', content: data.reply }]
        } : c
      ));
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#131314] text-gray-200">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1e1f20] p-4 flex flex-col border-r border-gray-800">
        <button 
          onClick={createNewChat}
          className="flex items-center gap-3 bg-[#2b2c2f] hover:bg-[#37393b] p-3 rounded-xl text-sm mb-6 transition-all"
        >
          <Plus size={20} /> Yeni Sohbet
        </button>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                activeChatId === chat.id ? 'bg-[#2d2f31] text-white' : 'text-gray-400 hover:bg-[#2d2f31]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <MessageSquare size={16} />
                <span className="truncate text-sm">{chat.title}</span>
              </div>
              <button 
                onClick={(e) => deleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#131314]/50 backdrop-blur-md">
          <h2 className="font-medium text-sm text-gray-400">Sohbet Geçmişi • {activeChat?.title}</h2>
          <div className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">AI Engine Ready</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 pb-40">
          {activeChat?.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Terminal size={64} />
              <p className="mt-4">Bir soru sorarak başlayın...</p>
            </div>
          )}

          {activeChat?.messages.map((msg, i) => (
            <div key={i} className={`flex gap-5 max-w-4xl mx-auto mb-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'bot' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className={`inline-block p-4 rounded-2xl ${
                  msg.role === 'user' ? 'bg-[#2b2c2f] float-right' : 'bg-transparent'
                }`}>
                  {msg.role === 'bot' ? (
                    <div className="prose prose-invert max-w-none prose-pre:p-0">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-xl border border-gray-800 !bg-[#0d0d0d] my-4"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-[#2d2f31] px-1.5 py-0.5 rounded text-blue-300" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && <div className="max-w-4xl mx-auto animate-pulse text-blue-500">Düşünüyor...</div>}
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#131314] to-transparent">
          <div className="max-w-4xl mx-auto relative flex items-center bg-[#1e1f20] rounded-2xl border border-gray-700 p-2">
            <input
              className="flex-1 bg-transparent border-none outline-none px-4"
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}