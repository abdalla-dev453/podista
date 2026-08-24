import client from './client'

export const getOverview = () => client.get('/admin/overview').then((r) => r.data)
export const getModerationQueue = () => client.get('/admin/moderation-queue').then((r) => r.data)
export const banReportedUser = (reportId) =>
  client.post(`/admin/moderation-queue/${reportId}/ban`).then((r) => r.data)
export const dismissReport = (reportId) =>
  client.post(`/admin/moderation-queue/${reportId}/dismiss`).then((r) => r.data)
export const getBannedUsers = () => client.get('/admin/banned-users').then((r) => r.data)
export const unbanUser = (banId) => client.post(`/admin/banned-users/${banId}/unban`).then((r) => r.data)