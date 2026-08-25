import client from './client'

export const getBookmarks = () => client.get('/bookmarks').then((r) => r.data)

export const addBookmark = (episodeId) => client.post(`/bookmarks/${episodeId}`).then((r) => r.data)

export const removeBookmark = (episodeId) => client.delete(`/bookmarks/${episodeId}`);  