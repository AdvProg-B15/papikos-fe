"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useAuth } from '@/store/authStore';
import { ChatMessage, EditMessageRequest } from '@/types';
import { sendMessage, editMessage, deleteMessage } from '@/services/chatService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast as sonnerToast } from 'sonner';
import { ArrowLeft, Send, Edit2, Trash2, UserCircle, MoreVertical, AlertCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// Helper to get initials
const getInitials = (id: string = "U") => id.substring(0, 2).toUpperCase();


export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = params.roomId as string; // This roomId might be the other user's ID or a combined ID.

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!roomId || !user) return;

    // Close existing EventSource if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Establish SSE connection
    // The URL needs to be absolute for EventSource.
    // We need to construct the full URL including the base CHAT_URL.
    const chatServiceUrl = process.env.NEXT_PUBLIC_CHAT_URL;
    if (!chatServiceUrl) {
        console.error("Chat service URL is not configured.");
        sonnerToast.error("Chat service is unavailable.");
        return;
    }
    
    const fullUrl = `${chatServiceUrl}/api/v1/${roomId}/messages`;
    
    // Add Authorization header for EventSource (if backend supports it via query param or custom header handling)
    // Standard EventSource does not support custom headers directly.
    // Common workarounds:
    // 1. Pass token as a query parameter (less secure for GET).
    // 2. Use a library that wraps EventSource or use fetch with stream reader.
    // For simplicity, assuming the backend can authenticate SSE via cookies or a session
    // established through normal API calls, or the interceptor handles it if the EventSource request goes via it (unlikely).
    // If your backend requires a token for SSE, this needs a more complex setup.
    // One approach is to pass it as a query param if your backend supports it:
    // const fullUrlWithToken = `${fullUrl}?token=${localStorage.getItem('accessToken')}`;
    // This is NOT standard and depends on backend.
    
    const es = new EventSource(fullUrl, { withCredentials: true }); // withCredentials for cookies/session
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("SSE connection opened for room:", roomId);
      setMessages([]); // Clear previous messages on new room open
    };

    es.onmessage = (event) => {
      try {
        const newMessage: ChatMessage = JSON.parse(event.data);
        setMessages((prevMessages) => {
          // Avoid duplicates and handle updates (edit/delete)
          const existingIndex = prevMessages.findIndex(m => m.messageId === newMessage.messageId);
          if (existingIndex > -1) {
            const updatedMessages = [...prevMessages];
            updatedMessages[existingIndex] = newMessage;
            return updatedMessages;
          }
          return [...prevMessages, newMessage];
        });
      } catch (error) {
        console.error("Failed to parse SSE message:", event.data, error);
      }
    };

    es.onerror = (error) => {
      console.error("EventSource failed for room:", roomId, error);
      sonnerToast.error("Chat connection error. Please try refreshing.");
      es.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        console.log("SSE connection closed for room:", roomId);
      }
    };
  }, [roomId, user]);


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !user) return;

    try {
      await sendMessage(roomId, { content: newMessageContent.trim() });
      setNewMessageContent("");
      // SSE should deliver the new message, no need to add manually
    } catch (error: any) {
      sonnerToast.error(error.response?.data?.message || "Failed to send message.");
    }
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessage(message);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim() || !user) return;

    try {
      const payload: EditMessageRequest = { content: editContent.trim() };
      await editMessage(roomId, editingMessage.messageId, payload);
      // SSE should deliver the updated message
      setEditingMessage(null);
      setEditContent("");
      sonnerToast.success("Message edited.");
    } catch (error: any) {
      sonnerToast.error(error.response?.data?.message || "Failed to edit message.");
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
     try {
      await deleteMessage(roomId, messageId);
      // SSE should deliver the updated (deleted flag) message
      sonnerToast.success("Message deleted.");
    } catch (error: any) {
      sonnerToast.error(error.response?.data?.message || "Failed to delete message.");
    }
  };

  if (!user) {
    return <div className="p-4 text-center">Please login to use chat.</div>;
  }
  if (!roomId) {
    return <div className="p-4 text-center text-red-500">Chat room ID is missing.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--navbar-height,4rem)-1px)]"> {/* Adjust navbar height */}
      <header className="p-4 border-b flex items-center bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft />
        </Button>
        <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback><UserCircle /></AvatarFallback> {/* Placeholder for room avatar/icon */}
        </Avatar>
        <h1 className="text-lg font-semibold">Chat with {roomId.substring(0,8)}...</h1> {/* Display part of roomId or a fetched name */}
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/40">
        {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
                <MessageSquare className="mx-auto h-12 w-12 mb-2"/>
                No messages yet. Start the conversation!
            </div>
        )}
        {messages.map((msg) => {
          const isSender = msg.senderUserId === user.userId;
          if (msg.deleted) {
             return (
                <div key={msg.messageId} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                    <div className={`italic p-2 rounded-lg text-xs max-w-[70%] text-gray-500 dark:text-gray-400 ${
                        isSender ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                        Message deleted
                    </div>
                </div>
             );
          }
          return (
            <div key={msg.messageId} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
              {!isSender && (
                <Avatar className="h-8 w-8 self-start">
                  {/* <AvatarImage src={msg.senderAvatarUrl} /> */}
                  <AvatarFallback>{getInitials(msg.senderUserId)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`group relative p-3 rounded-lg max-w-[70%] ${
                  isSender ? 'bg-primary text-primary-foreground' : 'bg-card border'
              }`}>
                {!isSender && <p className="text-xs font-semibold mb-1 text-muted-foreground">{msg.senderUserId.substring(0,8)}...</p>}
                {editingMessage?.messageId === msg.messageId ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] bg-background text-foreground"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingMessage(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                <p className={`text-xs mt-1 ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {formatDistanceToNow(parseISO(msg.createdAt), { addSuffix: true })}
                  {msg.edited && " (edited)"}
                </p>
                {isSender && editingMessage?.messageId !== msg.messageId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleStartEdit(msg)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive"/> <span className="text-destructive">Delete</span>
                        </DropdownMenuItem></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete Message?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteMessage(msg.messageId)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {isSender && (
                 <Avatar className="h-8 w-8 self-start">
                  {/* <AvatarImage src={user.avatarUrl} /> */}
                  <AvatarFallback>{getInitials(user.userId || undefined)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-3 border-t bg-card">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Textarea
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow resize-none min-h-[40px] max-h-[120px]"
            rows={1}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                }
            }}
          />
          <Button type="submit" size="icon" disabled={!newMessageContent.trim()}>
            <Send className="h-5 w-5"/>
          </Button>
        </form>
      </footer>
    </div>
  );
}