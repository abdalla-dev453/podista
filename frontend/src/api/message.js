import client from "./client";

export const getMessages = (channelId) =>
  client.get(`/messages/channel/${channelId}`).then((r) => r.data);

export const sendMessage = (channelId, payload) =>
  client.post(`/messages/channel/${channelId}`, payload).then((r) => r.data);

export const toggleReaction = (messageId, emoji) =>
  client.post(`/messages/${messageId}/react`, { emoji }).then((r) => r.data);
