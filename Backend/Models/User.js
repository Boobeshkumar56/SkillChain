const mongoose = require("mongoose");

const SkillExperienceSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  experience: {
    type: String,
    enum: ["beginner", "intermediate", "experienced", "expert"],
    default: "beginner",
  },
});

const CurrentLearningSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  startDate: { type: Date, default: Date.now },
  targetDate: { type: Date },
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["planning", "active", "completed", "on-hold"],
    default: "planning",
  },
  technologies: [String],
  github: { type: String },
  liveUrl: { type: String },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const DoubtSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved"],
    default: "open",
  },
  responses: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    response: { type: String, required: true },
    helpful: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const ConnectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "connected", "blocked"],
    default: "pending",
  },
  connectedAt: { type: Date },
}, { timestamps: true });

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  duration: { type: Number, default: 0 }, // in minutes
  thumbnailUrl: { type: String },
  videoUrl: { type: String },
  tags: [String],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  aiAnalysis: {
    complexity: { type: Number, min: 1, max: 10 },
    suggestedTokens: { type: Number, default: 0 },
    feedback: { type: String }
  },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
}, { timestamps: true });

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String },
    photoURL: { type: String },
    uid: { type: String }, // Firebase UID (optional)
    authProvider: { type: String, enum: ["google", "email"], default: "email" },

    // Skills
    knownSkills: [SkillExperienceSchema],
    learningSkills: [String], // Keep for backward compatibility
    currentLearnings: [CurrentLearningSchema],
    completedSkills: [SkillExperienceSchema],
    
    // Profile Info
    selectedRole: { type: String },
    customRole: { type: String },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "experienced", "expert"],
    },
    company: { type: String },

    // Projects & Doubts
    projects: [ProjectSchema],
    doubts: [DoubtSchema],

    // Connections
    connections: [ConnectionSchema],
    
    // Video Content (for educators)
    videos: [VideoSchema],
    
    // Social Profiles
    socialProfiles: {
      github: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      website: { type: String },
    },
    
    // System fields
    tokens: { type: Number, default: 0 },
    certificates: [{ type: String }],
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
