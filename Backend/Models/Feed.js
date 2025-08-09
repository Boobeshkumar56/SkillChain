const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const FeedSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ["post", "question", "achievement", "project-showcase"],
    default: "post",
  },
  tags: [String],
  category: { type: String },
  media: [{
    type: { type: String, enum: ["image", "video", "document"] },
    url: { type: String, required: true },
    caption: { type: String },
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPublic: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  
  // For questions/doubts
  isResolved: { type: Boolean, default: false },
  bestAnswer: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  
  // Analytics
  views: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 },
}, { timestamps: true });

// Index for better performance
FeedSchema.index({ author: 1, createdAt: -1 });
FeedSchema.index({ type: 1, createdAt: -1 });
FeedSchema.index({ tags: 1 });
FeedSchema.index({ category: 1 });

module.exports = mongoose.model("Feed", FeedSchema);
