const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Feed = require("../Models/Feed");
const authMiddleware = require("../Middlewares/Auth.middle");
const router = express.Router();

// JWT secret key (store in .env file for security)
const JWT_SECRET = process.env.JWT_SECRET;
// @route   POST /api/auth/signup
// @desc    Register new user and return token
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, ...rest } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      onboardingComplete: false,
      isActive: true,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      ...rest,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Update last active time
    user.lastActiveAt = new Date();
    user.isActive = true;
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({ user: userResponse, token });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify JWT token
router.get("/verify-token", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ valid: true, user });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token is not valid" });
  }
});

// @route   POST /api/auth/onboarding
// @desc    Complete multi-step onboarding process
router.post("/onboarding", authMiddleware, async (req, res) => {
  try {
    const {
      selectedRole,
      experienceLevel,
      bio,
      location,
      knownSkills,
      currentLearnings,
      interests
    } = req.body;

    // Validate required fields
    if (!selectedRole || !experienceLevel || !bio || !knownSkills || knownSkills.length === 0) {
      return res.status(400).json({ 
        message: "Role, experience level, bio, and at least one skill are required" 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        selectedRole,
        experienceLevel,
        bio,
        location: location || '',
        knownSkills: knownSkills || [],
        currentLearnings: currentLearnings || [],
        interests: interests || [],
        onboardingComplete: true,
        isActive: true,
        lastActiveAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      user: updatedUser,
      message: "Onboarding completed successfully"
    });
  } catch (err) {
    console.error("Onboarding completion error:", err);
    return res.status(500).json({ error: "Failed to complete onboarding" });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile data (for profile page editing)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { 
      bio, 
      location,
      knownSkills, 
      currentLearnings, 
      interests,
      selectedRole,
      experienceLevel,
      socialProfiles
    } = req.body;
    
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (knownSkills !== undefined) updateData.knownSkills = knownSkills;
    if (currentLearnings !== undefined) updateData.currentLearnings = currentLearnings;
    if (interests !== undefined) updateData.interests = interests;
    if (selectedRole !== undefined) updateData.selectedRole = selectedRole;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (socialProfiles !== undefined) updateData.socialProfiles = socialProfiles;

    updateData.lastActiveAt = new Date();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({ 
      user,
      message: "Profile updated successfully" 
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ error: "Failed to update profile data" });
  }
});

// @route   PUT /api/auth/social-profiles
// @desc    Update user social profiles individually
router.put("/social-profiles", authMiddleware, async (req, res) => {
  try {
    const { github, linkedin, twitter, instagram, website } = req.body;
    
    const socialProfiles = {};
    if (github !== undefined) socialProfiles.github = github;
    if (linkedin !== undefined) socialProfiles.linkedin = linkedin;
    if (twitter !== undefined) socialProfiles.twitter = twitter;
    if (instagram !== undefined) socialProfiles.instagram = instagram;
    if (website !== undefined) socialProfiles.website = website;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        socialProfiles,
        lastActiveAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({ 
      user,
      message: "Social profiles updated successfully" 
    });
  } catch (err) {
    console.error("Social profiles update error:", err);
    return res.status(500).json({ error: "Failed to update social profiles" });
  }
});

// @route   GET /api/auth/dashboard
// @desc    Get dashboard data for user
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('projects.collaborators', 'name email')
      .populate('doubts.responses.user', 'name email');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const dashboardData = {
      user: {
        name: user.name,
        bio: user.bio,
        selectedRole: user.selectedRole,
        experienceLevel: user.experienceLevel,
      },
      stats: {
        totalProjects: user.projects.length,
        activeProjects: user.projects.filter(p => p.status === 'active').length,
        completedProjects: user.projects.filter(p => p.status === 'completed').length,
        totalSkills: user.knownSkills.length,
        currentLearnings: user.currentLearnings.length,
        completedSkills: user.completedSkills.length,
        openDoubts: user.doubts.filter(d => d.status === 'open').length,
        resolvedDoubts: user.doubts.filter(d => d.status === 'resolved').length,
      },
      recentProjects: user.projects.slice(-3),
      currentLearnings: user.currentLearnings,
      recentDoubts: user.doubts.slice(-3),
    };
    
    return res.status(200).json(dashboardData);
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// @route   POST /api/auth/current-learning
// @desc    Add a new current learning
router.post("/current-learning", authMiddleware, async (req, res) => {
  try {
    const { skill, level, targetDate } = req.body;
    
    if (!skill || !level) {
      return res.status(400).json({ message: "Skill and level are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newLearning = {
      skill,
      level,
      progress: 0,
      startDate: new Date(),
      targetDate: targetDate ? new Date(targetDate) : null,
    };

    user.currentLearnings.push(newLearning);
    await user.save();
    
    return res.status(201).json({ currentLearnings: user.currentLearnings });
  } catch (err) {
    console.error("Add learning error:", err);
    return res.status(500).json({ error: "Failed to add current learning" });
  }
});

// @route   PUT /api/auth/current-learning/:id
// @desc    Update current learning progress
router.put("/current-learning/:id", authMiddleware, async (req, res) => {
  try {
    const { progress, level } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const learning = user.currentLearnings.id(req.params.id);
    if (!learning) {
      return res.status(404).json({ message: "Learning not found" });
    }

    if (progress !== undefined) learning.progress = Math.min(100, Math.max(0, progress));
    if (level !== undefined) learning.level = level;
    
    // If progress is 100%, move to completed skills
    if (learning.progress === 100) {
      user.completedSkills.push({
        skill: learning.skill,
        experience: learning.level,
      });
      user.currentLearnings.id(req.params.id).remove();
    }

    await user.save();
    
    return res.status(200).json({ 
      currentLearnings: user.currentLearnings,
      completedSkills: user.completedSkills 
    });
  } catch (err) {
    console.error("Update learning error:", err);
    return res.status(500).json({ error: "Failed to update learning progress" });
  }
});

// @route   POST /api/auth/project
// @desc    Add a new project
router.post("/project", authMiddleware, async (req, res) => {
  try {
    const { title, description, status, technologies, github, liveUrl } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newProject = {
      title,
      description,
      status: status || 'planning',
      technologies: technologies || [],
      github,
      liveUrl,
      collaborators: [],
    };

    user.projects.push(newProject);
    await user.save();
    
    return res.status(201).json({ projects: user.projects });
  } catch (err) {
    console.error("Add project error:", err);
    return res.status(500).json({ error: "Failed to add project" });
  }
});

// @route   PUT /api/auth/project/:id
// @desc    Update project
router.put("/project/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, status, technologies, github, liveUrl } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = user.projects.id(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;
    if (technologies) project.technologies = technologies;
    if (github !== undefined) project.github = github;
    if (liveUrl !== undefined) project.liveUrl = liveUrl;

    await user.save();
    
    return res.status(200).json({ projects: user.projects });
  } catch (err) {
    console.error("Update project error:", err);
    return res.status(500).json({ error: "Failed to update project" });
  }
});

// @route   POST /api/auth/doubt
// @desc    Add a new doubt
router.post("/doubt", authMiddleware, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Title, description, and category are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newDoubt = {
      title,
      description,
      category,
      tags: tags || [],
      status: 'open',
      responses: [],
    };

    user.doubts.push(newDoubt);
    await user.save();
    
    return res.status(201).json({ doubts: user.doubts });
  } catch (err) {
    console.error("Add doubt error:", err);
    return res.status(500).json({ error: "Failed to add doubt" });
  }
});

// @route   GET /api/auth/feed
// @desc    Get community feed posts
router.get("/feed", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, search } = req.query;
    
    let query = { isPublic: true };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const feeds = await Feed.find(query)
      .populate('author', 'name email selectedRole photoURL')
      .populate('likes', 'name')
      .populate('comments.user', 'name email photoURL')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feed.countDocuments(query);
    
    return res.status(200).json({
      feeds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error("Feed fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// @route   POST /api/auth/feed
// @desc    Create a new feed post
router.post("/feed", authMiddleware, async (req, res) => {
  try {
    const { content, type, tags, category, media } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const newFeed = new Feed({
      author: req.user.id,
      content,
      type: type || 'post',
      tags: tags || [],
      category,
      media: media || [],
    });

    await newFeed.save();
    
    const populatedFeed = await Feed.findById(newFeed._id)
      .populate('author', 'name email selectedRole photoURL');
    
    return res.status(201).json(populatedFeed);
  } catch (err) {
    console.error("Create feed error:", err);
    return res.status(500).json({ error: "Failed to create feed post" });
  }
});

// @route   POST/DELETE /api/auth/feed/:id/like
// @desc    Like/Unlike a feed post
router.post("/feed/:id/like", authMiddleware, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Feed post not found" });
    }

    const userId = req.user.id;
    const isLiked = feed.likes.includes(userId);
    
    if (!isLiked) {
      feed.likes.push(userId);
      await feed.save();
      return res.status(200).json({ 
        likes: feed.likes.length,
        isLiked: true 
      });
    } else {
      return res.status(400).json({ message: "Post already liked" });
    }
  } catch (err) {
    console.error("Like feed error:", err);
    return res.status(500).json({ error: "Failed to like post" });
  }
});

router.delete("/feed/:id/like", authMiddleware, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Feed post not found" });
    }

    const userId = req.user.id;
    feed.likes.pull(userId);
    await feed.save();
    
    return res.status(200).json({ 
      likes: feed.likes.length,
      isLiked: false 
    });
  } catch (err) {
    console.error("Unlike feed error:", err);
    return res.status(500).json({ error: "Failed to unlike post" });
  }
});

// @route   POST/DELETE /api/auth/feed/:id/save
// @desc    Save/Unsave a feed post
router.post("/feed/:id/save", authMiddleware, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Feed post not found" });
    }

    const userId = req.user.id;
    const isSaved = feed.savedBy.includes(userId);
    
    if (!isSaved) {
      feed.savedBy.push(userId);
      await feed.save();
      return res.status(200).json({ isSaved: true });
    } else {
      return res.status(400).json({ message: "Post already saved" });
    }
  } catch (err) {
    console.error("Save feed error:", err);
    return res.status(500).json({ error: "Failed to save post" });
  }
});

router.delete("/feed/:id/save", authMiddleware, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Feed post not found" });
    }

    const userId = req.user.id;
    feed.savedBy.pull(userId);
    await feed.save();
    
    return res.status(200).json({ isSaved: false });
  } catch (err) {
    console.error("Unsave feed error:", err);
    return res.status(500).json({ error: "Failed to unsave post" });
  }
});

// @route   GET /api/auth/feed/saved
// @desc    Get user's saved feed posts
router.get("/feed/saved", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const feeds = await Feed.find({ savedBy: req.user.id })
      .populate('author', 'name email selectedRole photoURL')
      .populate('likes', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feed.countDocuments({ savedBy: req.user.id });
    
    return res.status(200).json({
      feeds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error("Saved feed fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch saved posts" });
  }
});

// @route   POST /api/auth/feed/:id/comment
// @desc    Add comment to a feed post
router.post("/feed/:id/comment", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Feed post not found" });
    }

    const newComment = {
      user: req.user.id,
      content,
      likes: [],
    };

    feed.comments.push(newComment);
    await feed.save();
    
    const populatedFeed = await Feed.findById(req.params.id)
      .populate('comments.user', 'name email photoURL');
    
    return res.status(201).json(populatedFeed.comments);
  } catch (err) {
    console.error("Add comment error:", err);
    return res.status(500).json({ error: "Failed to add comment" });
  }
});

// @route   POST /api/auth/connect-request
// @desc    Send connection request
router.post("/connect-request", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot connect to yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(userId)
    ]);

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize connections array if it doesn't exist
    if (!currentUser.connections) {
      currentUser.connections = [];
    }
    if (!targetUser.connections) {
      targetUser.connections = [];
    }

    // Check if connection already exists
    const existingConnection = currentUser.connections.find(
      conn => conn.user.toString() === userId
    );

    if (existingConnection) {
      return res.status(400).json({ 
        message: "Connection already exists",
        status: existingConnection.status 
      });
    }

    // Add connection request to both users
    currentUser.connections.push({
      user: userId,
      status: 'pending',
    });

    targetUser.connections.push({
      user: req.user.id,
      status: 'pending',
    });

    await Promise.all([currentUser.save(), targetUser.save()]);
    
    return res.status(201).json({ message: "Connection request sent" });
  } catch (err) {
    console.error("Connect request error:", err);
    return res.status(500).json({ error: "Failed to send connection request" });
  }
});

// @route   POST /api/auth/reject-connection
// @desc    Reject connection request
router.post("/reject-connection", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize connections array if it doesn't exist
    if (!currentUser.connections) {
      currentUser.connections = [];
    }
    if (!targetUser.connections) {
      targetUser.connections = [];
    }

    // Remove connection from both users
    currentUser.connections = currentUser.connections.filter(
      conn => conn.user.toString() !== userId
    );
    targetUser.connections = targetUser.connections.filter(
      conn => conn.user.toString() !== req.user.id
    );

    await Promise.all([currentUser.save(), targetUser.save()]);
    
    return res.status(200).json({ message: "Connection request rejected" });
  } catch (err) {
    console.error("Reject connection error:", err);
    return res.status(500).json({ error: "Failed to reject connection" });
  }
});

// @route   PUT /api/auth/connection/:id/accept
// @desc    Accept connection request
router.put("/connection/:id/accept", authMiddleware, async (req, res) => {
  try {
    const connectionUserId = req.params.id;
    
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(connectionUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update connection status for both users
    const currentUserConnection = currentUser.connections.find(
      conn => conn.user.toString() === connectionUserId
    );
    const targetUserConnection = targetUser.connections.find(
      conn => conn.user.toString() === req.user.id
    );

    if (!currentUserConnection || !targetUserConnection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    currentUserConnection.status = 'connected';
    currentUserConnection.connectedAt = new Date();
    targetUserConnection.status = 'connected';
    targetUserConnection.connectedAt = new Date();

    await Promise.all([currentUser.save(), targetUser.save()]);
    
    return res.status(200).json({ message: "Connection accepted" });
  } catch (err) {
    console.error("Accept connection error:", err);
    return res.status(500).json({ error: "Failed to accept connection" });
  }
});

// @route   GET /api/auth/connections
// @desc    Get user connections
router.get("/connections", authMiddleware, async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    const user = await User.findById(req.user.id)
      .populate('connections.user', 'name email selectedRole photoURL isActive lastSeen');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize connections array if it doesn't exist
    let connections = user.connections || [];
    
    if (status !== 'all') {
      connections = connections.filter(conn => conn.status === status);
    }
    
    return res.status(200).json(connections);
  } catch (err) {
    console.error("Get connections error:", err);
    return res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// @route   PUT /api/auth/accept-connection
// @desc    Accept connection request
router.put("/accept-connection", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize connections array if it doesn't exist
    if (!currentUser.connections) {
      currentUser.connections = [];
    }
    if (!targetUser.connections) {
      targetUser.connections = [];
    }

    // Update connection status for both users
    const currentUserConnection = currentUser.connections.find(
      conn => conn.user.toString() === userId
    );
    const targetUserConnection = targetUser.connections.find(
      conn => conn.user.toString() === req.user.id
    );

    if (!currentUserConnection || !targetUserConnection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    currentUserConnection.status = 'connected';
    currentUserConnection.connectedAt = new Date();
    targetUserConnection.status = 'connected';
    targetUserConnection.connectedAt = new Date();

    await Promise.all([currentUser.save(), targetUser.save()]);
    
    return res.status(200).json({ message: "Connection accepted" });
  } catch (err) {
    console.error("Accept connection error:", err);
    return res.status(500).json({ error: "Failed to accept connection" });
  }
});

// Get all users with filters and search
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, role, experienceLevel, skills, location, search } = req.query;
    const userId = req.user.id;

    let query = { _id: { $ne: userId }, isActive: true };

    // Apply filters
    if (role && role !== 'all') {
      query.selectedRole = role;
    }
    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }
    if (skills) {
      query['knownSkills.skill'] = { $regex: skills, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'knownSkills.skill': { $regex: search, $options: 'i' } },
        { selectedRole: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email selectedRole experienceLevel bio photoURL knownSkills location isActive lastActiveAt socialProfiles')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastActiveAt: -1 });

    // Get current user's connections
    const currentUser = await User.findById(userId).populate('connections.user');
    const connections = currentUser.connections || [];

    // Add connection status to each user
    const usersWithStatus = users.map(user => {
      const userObj = user.toObject();
      const connection = connections.find(
        conn => conn.user._id.toString() === user._id.toString()
      );
      
      userObj.connectionStatus = connection ? connection.status : 'none';
      return userObj;
    });

    res.json({ users: usersWithStatus, total: usersWithStatus.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI matching endpoint
router.post('/ai-match', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId).populate('connections.user');

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simple AI matching based on skills and role
    const userSkills = currentUser.knownSkills.map(skill => skill.skill.toLowerCase());
    const userRole = currentUser.selectedRole;

    const potentialMatches = await User.find({
      _id: { $ne: userId },
      isActive: true,
      $or: [
        { selectedRole: userRole },
        { 'knownSkills.skill': { $in: userSkills } }
      ]
    }).select('name email selectedRole experienceLevel bio photoURL knownSkills location isActive lastActiveAt socialProfiles');

    const connections = currentUser.connections || [];

    // Calculate match scores and add connection status
    const matches = potentialMatches.map(user => {
      let score = 0;
      
      // Role match
      if (user.selectedRole === userRole) {
        score += 30;
      }
      
      // Skill overlap
      const matchingSkills = user.knownSkills.filter(skill => 
        userSkills.includes(skill.skill.toLowerCase())
      ).length;
      score += matchingSkills * 10;
      
      // Activity bonus
      if (user.isActive) {
        score += 10;
      }

      // Check connection status
      const connection = connections.find(
        conn => conn.user._id.toString() === user._id.toString()
      );
      const connectionStatus = connection ? connection.status : 'none';

      return {
        ...user.toObject(),
        matchScore: Math.min(100, score),
        connectionStatus
      };
    });

    // Sort by match score and return top 10
    const topMatches = matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({ matches: topMatches });
  } catch (error) {
    console.error('Error in AI matching:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chat endpoints
router.get('/chat/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    // Check if users are connected
    const connection = await User.findOne({
      _id: currentUserId,
      'connections.user': userId,
      'connections.status': 'connected'
    });

    if (!connection) {
      return res.status(403).json({ message: 'You can only chat with connected users' });
    }

    // For now, return empty messages array since we don't have a Chat model
    // In a real app, you'd fetch from a Chat collection
    res.json({ messages: [] });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Check if users are connected
    const connection = await User.findOne({
      _id: senderId,
      'connections.user': receiverId,
      'connections.status': 'connected'
    });

    if (!connection) {
      return res.status(403).json({ message: 'You can only chat with connected users' });
    }

    // For now, just return success
    // In a real app, you'd save to a Chat collection
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/educator/videos
// @desc    Get educator's uploaded videos
router.get("/educator/videos", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize videos array if it doesn't exist
    const videos = user.videos || [];
    
    return res.status(200).json({ videos });
  } catch (err) {
    console.error("Get videos error:", err);
    return res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// @route   POST /api/auth/educator/upload-video
// @desc    Upload new video content
router.post("/educator/upload-video", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      estimatedDuration,
      tags
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: "Title, description, and category are required" 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize videos array if it doesn't exist
    if (!user.videos) {
      user.videos = [];
    }

    const newVideo = {
      title,
      description,
      category,
      difficulty: difficulty || 'beginner',
      duration: estimatedDuration || 0,
      tags: tags || [],
      status: 'pending',
      views: 0,
      likes: 0,
      uploadedAt: new Date()
    };

    user.videos.push(newVideo);
    await user.save();

    // Get the created video with its ID
    const createdVideo = user.videos[user.videos.length - 1];
    
    return res.status(201).json({ 
      video: createdVideo,
      message: "Video uploaded successfully" 
    });
  } catch (err) {
    console.error("Upload video error:", err);
    return res.status(500).json({ error: "Failed to upload video" });
  }
});

// @route   POST /api/auth/educator/analyze-video/:id
// @desc    AI analyze video content
router.post("/educator/analyze-video/:id", authMiddleware, async (req, res) => {
  try {
    const videoId = req.params.id;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const video = user.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Simulate AI analysis
    const aiAnalysis = {
      complexity: Math.floor(Math.random() * 10) + 1, // 1-10
      suggestedTokens: Math.floor(Math.random() * 100) + 50, // 50-150
      feedback: generateAIFeedback(video.difficulty, video.category)
    };

    video.aiAnalysis = aiAnalysis;
    video.status = 'approved'; // Auto-approve for demo
    video.approvedAt = new Date();
    
    await user.save();
    
    return res.status(200).json({ 
      aiAnalysis,
      message: "AI analysis completed" 
    });
  } catch (err) {
    console.error("AI analysis error:", err);
    return res.status(500).json({ error: "Failed to analyze video" });
  }
});

// @route   GET /api/auth/videos/feed
// @desc    Get approved videos for feed
router.get("/videos/feed", authMiddleware, async (req, res) => {
  try {
    const users = await User.find(
      { "videos.status": "approved" },
      { 
        name: 1, 
        selectedRole: 1, 
        photoURL: 1,
        videos: { $elemMatch: { status: "approved" } }
      }
    ).limit(10);

    const videos = users.flatMap(user => 
      user.videos.map(video => ({
        ...video.toObject(),
        educator: {
          _id: user._id,
          name: user.name,
          selectedRole: user.selectedRole,
          photoURL: user.photoURL
        }
      }))
    ).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return res.status(200).json({ videos });
  } catch (err) {
    console.error("Get feed videos error:", err);
    return res.status(500).json({ error: "Failed to fetch feed videos" });
  }
});

function generateAIFeedback(difficulty, category) {
  const feedbacks = {
    beginner: [
      "Great introductory content! Clear explanations and good pacing for beginners.",
      "Well-structured for newcomers. Consider adding more practical examples.",
      "Perfect for beginners! The step-by-step approach is very helpful."
    ],
    intermediate: [
      "Good intermediate-level content. Covers important concepts effectively.",
      "Well-balanced content for intermediate learners. Good depth of coverage.",
      "Solid intermediate material. Could benefit from more advanced examples."
    ],
    advanced: [
      "Excellent advanced content! Complex topics explained clearly.",
      "High-quality advanced material. Great for experienced learners.",
      "Outstanding depth and complexity. Perfect for advanced practitioners."
    ]
  };

  const categoryBonus = {
    'Web Development': "Great web development insights!",
    'Mobile Development': "Valuable mobile development techniques!",
    'Data Science': "Excellent data science methodology!",
    'Machine Learning': "Strong ML concepts and applications!",
    'DevOps': "Practical DevOps knowledge!",
    'UI/UX Design': "Great design principles!",
    'Programming Fundamentals': "Solid programming foundations!",
    'Database Management': "Excellent database concepts!",
    'Cybersecurity': "Important security insights!",
    'Other': "Valuable educational content!"
  };

  const baseFeedback = feedbacks[difficulty][Math.floor(Math.random() * feedbacks[difficulty].length)];
  const bonus = categoryBonus[category] || categoryBonus['Other'];
  
  return `${baseFeedback} ${bonus}`;
}

module.exports = router;
