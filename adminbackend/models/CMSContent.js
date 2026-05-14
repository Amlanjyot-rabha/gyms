import mongoose from 'mongoose';

const CMSContentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Please add a content key'],
    unique: true,
    trim: true,
    maxlength: [100, 'Key cannot be more than 100 characters']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Please add content value']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'html', 'json', 'number', 'boolean'],
    default: 'text'
  },
  category: {
    type: String,
    default: 'general'
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get content by key
CMSContentSchema.statics.getContent = async function(key) {
  const content = await this.findOne({ key, isActive: true });
  return content ? content.value : null;
};

// Static method to get multiple contents by keys
CMSContentSchema.statics.getMultipleContents = async function(keys) {
  const contents = await this.find({ 
    key: { $in: keys }, 
    isActive: true 
  });
  
  const result = {};
  contents.forEach(content => {
    result[content.key] = content.value;
  });
  
  return result;
};

// Static method to get all contents by category
CMSContentSchema.statics.getContentsByCategory = async function(category) {
  const contents = await this.find({ category, isActive: true });
  
  const result = {};
  contents.forEach(content => {
    result[content.key] = content.value;
  });
  
  return result;
};

export default mongoose.model('CMSContent', CMSContentSchema);
