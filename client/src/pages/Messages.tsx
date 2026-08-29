import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import PageLayout from '../components/PageLayout';
import '../styles/messages.css';

interface Conversation {
  id: number;
  fresherUserId: number;
  clientUserId: number;
  fresher: { id: number; name: string };
  client: { id: number; name: string };
  application: { job: { id: number; title: string } };
  messages: { id: number; content: string; createdAt: string; senderId: number }[];
  updatedAt: string;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  sender: { id: number; name: string };
}

export default function Messages() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);
      pollingRef.current = setInterval(() => {
        loadMessages(activeConv.id);
      }, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConv?.id]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/messages');
      const data = res.data as { conversations: Conversation[] };
      setConversations(data.conversations);
      if (data.conversations.length > 0 && !activeConv) {
        setActiveConv(data.conversations[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const res = await api.get(`/messages/${convId}`);
      const data = res.data as { messages: Message[] };
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/messages/${activeConv.id}`, {
        content: newMessage.trim(),
      });
      const data = res.data as { message: Message };
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    return user?.id === conv.fresherUserId ? conv.client : conv.fresher;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <PageLayout>
      <div className="msg-main">
        <div className="msg-conversations">
          <div className="msg-conv-header">
            <div className="msg-conv-title">Messages</div>
            <div className="msg-conv-count">{conversations.length}</div>
          </div>

          {loading ? (
            <div className="msg-conv-loading">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="msg-conv-empty">
              <div className="msg-conv-empty-icon">💬</div>
              <div className="msg-conv-empty-title">No messages yet</div>
              <div className="msg-conv-empty-sub">
                Conversations appear here when a client accepts your application.
              </div>
            </div>
          ) : (
            <div className="msg-conv-list">
              {conversations.map(conv => {
                const other = getOtherUser(conv);
                const lastMsg = conv.messages[0];
                return (
                  <div
                    key={conv.id}
                    className={`msg-conv-item ${activeConv?.id === conv.id ? 'active' : ''}`}
                    onClick={() => setActiveConv(conv)}
                  >
                    <div className="msg-conv-avatar">
                      {other.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="msg-conv-info">
                      <div className="msg-conv-name">{other.name}</div>
                      <div className="msg-conv-job">{conv.application?.job?.title}</div>
                      {lastMsg && (
                        <div className="msg-conv-preview">
                          {lastMsg.content.slice(0, 40)}{lastMsg.content.length > 40 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    {lastMsg && (
                      <div className="msg-conv-time">{timeAgo(lastMsg.createdAt)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="msg-chat">
          {!activeConv ? (
            <div className="msg-chat-empty">
              <div className="msg-chat-empty-icon">💬</div>
              <div className="msg-chat-empty-title">Select a conversation</div>
              <div className="msg-chat-empty-sub">Choose a conversation from the left to start messaging.</div>
            </div>
          ) : (
            <>
              <div className="msg-chat-header">
                <div className="msg-chat-header-avatar">
                  {getOtherUser(activeConv).name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="msg-chat-header-name">{getOtherUser(activeConv).name}</div>
                  <div className="msg-chat-header-job">{activeConv.application?.job?.title}</div>
                </div>
              </div>

              <div className="msg-chat-messages">
                {messages.length === 0 ? (
                  <div className="msg-no-messages">
                    No messages yet — say hello! 👋
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`msg-bubble-wrap ${isMe ? 'me' : 'them'}`}>
                        {!isMe && (
                          <div className="msg-bubble-avatar">
                            {msg.sender.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`msg-bubble ${isMe ? 'me' : 'them'}`}>
                          <div className="msg-bubble-content">{msg.content}</div>
                          <div className="msg-bubble-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="msg-input-area" onSubmit={handleSend}>
                <input
                  className="msg-input"
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="msg-send-btn"
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? '...' : '→'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}