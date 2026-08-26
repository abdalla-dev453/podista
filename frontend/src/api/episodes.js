import client from './client'

export const getChannelEpisodes = (channelId) =>
  client.get(`/episodes/channel/${channelId}`).then((r) => r.data)

export const createEpisode = (channelId, payload) =>
  client.post(`/episodes/channel/${channelId}`, payload).then((r) => r.data)

export const getEpisode = (id) => client.get(`/episodes/${id}`).then((r) => r.data)

export const playEpisode = (id) => client.post(`/episodes/${id}/play`).then((r) => r.data)

export const deleteEpisode = (id) => client.delete(`/episodes/${id}`)
                                                   
export const getFeedEpisodes = () => client.get('/episodes/feed').then((r) => r.data)

export const getTrendingEpisodes = () => client.get('/episodes/trending').then((r) => r.data)