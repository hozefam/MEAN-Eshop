const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
  },
});

categorySchema.virtual('id', function () {
  return this._id.toHexString();
});

categorySchema.set('toJSON', {
  virtuals: true,
});

exports.Category = mongoose.model('Category', categorySchema);
