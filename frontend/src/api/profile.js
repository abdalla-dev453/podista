import client from './client'

export const getPublicProfile = (username) => client.get(`/users/${username}`).then((r) => r.data)

export const followUser = (username) => client.post(`/users/${username}/follow`).then((r) => r.data)

export const unfollowUser = (username) => client.post(`/users/${username}/unfollow`).then((r) => r.data)

export const getFollowers = (username) => client.get(`/users/${username}/followers`).then((r) => r.data)

export const getFollowing = (username) => client.get(`/users/${username}/following`).then((r) => r.data)