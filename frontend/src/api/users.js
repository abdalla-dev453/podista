import client from "./client";

export const updateProfile = (payload) =>
  client.patch("/users/profile", payload).then((r) => r.data);
export const searchUsers = (q) =>
  client.get("/users/search", { params: { q } }).then((r) => r.data);
