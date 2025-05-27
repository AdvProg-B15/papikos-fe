import apiClient from './apiClient';
import {
  ApiGeneralResponse,
  ChatMessage,
  SendMessageRequest,
  EditMessageRequest,
} from '@/types';

// Note: GET /{roomId}/messages is SSE, so it won't use standard apiClient.post/get for the stream itself.
// We'll handle EventSource directly in the component.
// This function could be for fetching initial batch of messages if SSE is only for new ones,
// or if EventSource handles the full history. The spec doesn't clarify initial load vs. stream.
// Assuming EventSource will provide all messages or we fetch initial batch then listen.
// For now, this service will focus on POST, PUT, DELETE.

// POST /{roomId}/messages (Send message)
export const sendMessage = async (roomId: string, data: SendMessageRequest): Promise<ApiGeneralResponse<ChatMessage>> => {
  const response = await apiClient.post<ApiGeneralResponse<ChatMessage>>(`/api/v1/${roomId}/messages`, data);
  return response.data;
};

// PUT /{roomId}/message/{messageId} (Edit Message)
export const editMessage = async (roomId: string, messageId: string, data: EditMessageRequest): Promise<ApiGeneralResponse<ChatMessage>> => {
  // Spec shows empty requestBody, but typically new content is sent.
  // Assuming 'data' contains { content: "new message" }
  const response = await apiClient.put<ApiGeneralResponse<ChatMessage>>(`/api/v1/${roomId}/message/${messageId}`, data);
  return response.data;
};

// DELETE /{roomId}/message/{messageId} (Delete Message)
export const deleteMessage = async (roomId: string, messageId: string): Promise<ApiGeneralResponse<ChatMessage>> => {
  // Response shows the deleted message object (marked as deleted)
  const response = await apiClient.delete<ApiGeneralResponse<ChatMessage>>(`/api/v1/${roomId}/message/${messageId}`);
  return response.data;
};