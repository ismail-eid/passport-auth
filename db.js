const users = [
  {
    id: 1,
    name: 'Ismail Eid',
    username: 'ismacileid',
    password: '123'
  },
  {
    id: 2,
    name: 'Daahir Abdi',
    username: 'daahirabdi',
    password: '123'
  }
]
const findByUsername = (username) => {
  for (const user of users) {
    if (user.username === username) return user;
  }
  return null;
}
const findById = (id) => {
  for (const user of users) {
    if (user.id === id) return user;
  }
  return null;
}
module.exports = {
  users,
  findByUsername,
  findById
}