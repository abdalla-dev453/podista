import client from './client'

const upload = (endpoint, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client
    .post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.url)
}

export const uploadImage = (file) => upload('/uploads/image', file)
export const uploadAudio = (file) => upload('/uploads/audio', file)