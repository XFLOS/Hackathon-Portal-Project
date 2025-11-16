const { Schema } = require('mongoose');

module.exports = function (mongoose) {
  const TeamSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    leaderId: { type: Schema.Types.ObjectId, ref: 'User' },
    memberEmails: [{ type: String }],
    joinCode: { type: String, index: true },
    capacity: { type: Number, default: 4 },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User' },
    presentationTime: { type: Date },
  }, { timestamps: true });

  return mongoose.model('Team', TeamSchema);
};
