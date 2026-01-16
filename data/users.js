const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    id: 2,
    username: 'contractor1',
    password: bcrypt.hashSync('contractor123', 10),
    role: 'contractor'
  },
  {
    id: 3,
    username: 'supplier1',
    password: bcrypt.hashSync('supplier123', 10),
    role: 'supplier'
  }
];

// Admin will push new USER objects here
module.exports = users;
