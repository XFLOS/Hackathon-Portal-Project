const { Schema } = require('mongoose');

// Minimal schema — app will tolerate absence of DB by falling back
module.exports = function (mongoose) {
  const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    role: { type: String, default: 'student' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    firebaseUid: { type: String },
  }, { timestamps: true });

  return mongoose.model('User', UserSchema);
};
