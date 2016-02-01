var Users = {
  prod: {
    1: {
      name: 'Sergey',
      role: 'dev'
    },
    2: {
      name: 'Max',
      role: 'dev'
    }
  },
  ci: {
    1: {
      name: 'Alex',
      role: 'PM'
    }
  }
};

function getMockUser(event, cb) {
  if (!Users[event.stage] || !Users[event.stage][event.id]) return cb('Current user doesn\'t exist.');

  cb(null, Users[event.stage][event.id]);
}

exports.getMockUser = getMockUser;
