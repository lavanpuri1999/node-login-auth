const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
      },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Number,
      default: null
    },
    _creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }
});

var Notes = mongoose.model('Notes',NoteSchema);

module.exports = {Notes}
