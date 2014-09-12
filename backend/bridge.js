var mongoose = require('mongoose');

exports.setupMongooseConnection = function(callback) {
  mongoose.connect('mongodb://localhost:27017/maidsafe_logs');
  db = mongoose.connection;
  db.on('error', function(){
    console.error.bind(console, 'connection error:');
    callback(false)
  });
  db.once('open', function() {
    console.log('Mongodb connected successfully');
    callback(true);
  });
};