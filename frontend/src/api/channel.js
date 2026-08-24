import client from './client'

export const getJoinedChannels = () => client.get('/channels').then((r) => r.data)
export const getExploreChannels = (category, search) =>
  client.get('/channels/explore', { params: { category, search } }).then((r) => r.data)
export const getMyChannels = () => client.get('/channels/mine').then((r) => r.data)
export const getChannel = (id) => client.get(`/channels/${id}`).then((r) => r.data)
export const createChannel = (payload) => client.post('/channels', payload).then((r) => r.data)
export const updateChannel = (id, payload) => client.patch(`/channels/${id}`, payload).then((r) => r.data)
export const deleteChannel = (id) => client.delete(`/channels/${id}`)
export const joinChannel = (id) => client.post(`/channels/${id}/join`).then((r) => r.data)
export const leaveChannel = (id) => client.post(`/channels/${id}/leave`).then((r) => r.data)
export const toggleLiveChannel = (id) => client.post(`/channels/${id}/toggle-live`).then((r) => r.data)
export const getInviteLink = (id) => client.get(`/channels/${id}/invite`).then((r) => r.data)
export const joinByInvite = (code) => client.post(`/channels/join/${code}`).then((r) => r.data)
export const inviteUserToChannel = (channelId, userId) =>
  client.post(`/channels/${channelId}/invite-user`, { user_id: userId }).then((r) => r.data)
export const reportUserInChannel = (channelId, reportedUserId, reason) =>
  client.post(`/channels/${channelId}/report`, { reported_user_id: reportedUserId, reason }).then((r) => r.data)
export const getInvitations = () => client.get('/channels/invitations').then((r) => r.data)
export const respondInvitation = (id, action) =>
  client.post(`/channels/invitations/${id}/respond`, { action }).then((r) => r.data)