import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bookmark,
  Code,
  Filter,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Share,
  Users,
  Video
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SkillIcon } from '../components';
import { API_URL } from '../constants';

const { width, height } = Dimensions.get('window');

interface FeedProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface FeedPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
    selectedRole: string;
    photoURL?: string;
  };
  content: string;
  type: string;
  tags: string[];
  category?: string;
  likes: string[];
  comments: any[];
  shares: string[];
  savedBy: string[];
  createdAt: string;
  views: number;
}

interface VideoContent {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  thumbnailUrl?: string;
  tags: string[];
  educator: {
    _id: string;
    name: string;
    selectedRole: string;
    photoURL?: string;
  };
  views: number;
  likes: number;
  uploadedAt: string;
}

// Mock video data for UI demonstration
const mockVideos: VideoContent[] = [
  {
    _id: '1',
    title: 'React Native Navigation Fundamentals',
    description: 'Learn the basics of React Native navigation with practical examples',
    category: 'Mobile Development',
    difficulty: 'beginner',
    duration: 1200, // 20 minutes
    tags: ['React Native', 'Navigation', 'Mobile'],
    educator: {
      _id: 'edu1',
      name: 'Sarah Johnson',
      selectedRole: 'Educator',
      photoURL: undefined
    },
    views: 1250,
    likes: 89,
    uploadedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript patterns and best practices',
    category: 'Programming Fundamentals',
    difficulty: 'advanced',
    duration: 1800, // 30 minutes
    tags: ['TypeScript', 'Patterns', 'Advanced'],
    educator: {
      _id: 'edu2',
      name: 'Michael Chen',
      selectedRole: 'Senior Developer',
      photoURL: undefined
    },
    views: 2100,
    likes: 156,
    uploadedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    _id: '3',
    title: 'UI/UX Design Principles',
    description: 'Essential design principles every developer should know',
    category: 'UI/UX Design',
    difficulty: 'intermediate',
    duration: 900, // 15 minutes
    tags: ['Design', 'UI/UX', 'Principles'],
    educator: {
      _id: 'edu3',
      name: 'Emma Rodriguez',
      selectedRole: 'Designer',
      photoURL: undefined
    },
    views: 890,
    likes: 67,
    uploadedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    _id: '4',
    title: 'Node.js API Development',
    description: 'Build robust APIs with Node.js and Express',
    category: 'Web Development',
    difficulty: 'intermediate',
    duration: 2100, // 35 minutes
    tags: ['Node.js', 'API', 'Backend'],
    educator: {
      _id: 'edu4',
      name: 'David Kim',
      selectedRole: 'Backend Developer',
      photoURL: undefined
    },
    views: 1750,
    likes: 124,
    uploadedAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
  },
  {
    _id: '5',
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning concepts and algorithms',
    category: 'Machine Learning',
    difficulty: 'beginner',
    duration: 1500, // 25 minutes
    tags: ['ML', 'AI', 'Algorithms'],
    educator: {
      _id: 'edu5',
      name: 'Dr. Priya Patel',
      selectedRole: 'Data Scientist',
      photoURL: undefined
    },
    views: 3200,
    likes: 245,
    uploadedAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
  }
];

// Mock posts data for UI demonstration
const mockPosts: FeedPost[] = [
  {
    _id: 'post1',
    author: {
      _id: 'user1',
      name: 'Alex Thompson',
      email: 'alex@example.com',
      selectedRole: 'Full Stack Developer',
      photoURL: undefined
    },
    content: 'Just completed my first React Native app! 🚀 The learning curve was steep but totally worth it. The hot reload feature is a game-changer for mobile development. Any tips for optimizing performance?',
    type: 'post',
    tags: ['React Native', 'Mobile Development', 'Learning'],
    category: 'Mobile Development',
    likes: ['user2', 'user3', 'user4'],
    comments: [
      {
        _id: 'comment1',
        user: {
          _id: 'user2',
          name: 'Sarah Kim',
          email: 'sarah@example.com',
          photoURL: undefined
        },
        content: 'Congratulations! For performance, consider using FlatList for large lists and avoid anonymous functions in render methods.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likes: []
      }
    ],
    savedBy: [],
    shares: ['user3', 'user6', 'user9'],
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    views: 45
  },
  {
    _id: 'post2',
    author: {
      _id: 'user5',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      selectedRole: 'UI/UX Designer',
      photoURL: undefined
    },
    content: 'Working on a new design system for our startup. The challenge is balancing creativity with consistency. Here\'s what I\'ve learned so far:\n\n1. Start with typography and color palette\n2. Create reusable components\n3. Document everything!\n\nWhat are your thoughts on design tokens?',
    type: 'post',
    tags: ['Design System', 'UI/UX', 'Startup'],
    category: 'UI/UX Design',
    likes: ['user1', 'user3', 'user6', 'user7'],
    comments: [],
    savedBy: ['user1'],
    shares: ['user8', 'user12'],
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    views: 78
  },
  {
    _id: 'post3',
    author: {
      _id: 'user8',
      name: 'James Wilson',
      email: 'james@example.com',
      selectedRole: 'Data Scientist',
      photoURL: undefined
    },
    content: 'Excited to share my latest project! Built a machine learning model that predicts customer churn with 94% accuracy. Used Python, scikit-learn, and deployed it with FastAPI. \n\nKey takeaways:\n- Feature engineering is crucial\n- Cross-validation prevents overfitting\n- Model interpretability matters for business stakeholders',
    type: 'project',
    tags: ['Machine Learning', 'Python', 'Data Science', 'FastAPI'],
    category: 'Machine Learning',
    likes: ['user1', 'user2', 'user5', 'user9', 'user10'],
    comments: [
      {
        _id: 'comment2',
        user: {
          _id: 'user9',
          name: 'Lisa Chen',
          email: 'lisa@example.com',
          photoURL: undefined
        },
        content: 'Amazing work! What features did you find most predictive of churn?',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        likes: ['user8']
      }
    ],
    savedBy: ['user2', 'user5'],
    shares: ['user1', 'user4', 'user7', 'user11'],
    createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    views: 156
  },
  {
    _id: 'post4',
    author: {
      _id: 'user11',
      name: 'Robert Martinez',
      email: 'robert@example.com',
      selectedRole: 'DevOps Engineer',
      photoURL: undefined
    },
    content: 'PSA: Always backup your databases before major deployments! 😅 Learned this the hard way today. Spent 3 hours restoring from backup after a migration script went wrong.\n\nSilver lining: Our disaster recovery procedures worked perfectly. Time to automate this process even further.',
    type: 'post',
    tags: ['DevOps', 'Database', 'Backup', 'Lessons Learned'],
    category: 'DevOps',
    likes: ['user1', 'user5', 'user8', 'user12'],
    comments: [
      {
        _id: 'comment3',
        user: {
          _id: 'user12',
          name: 'Emma Davis',
          email: 'emma@example.com',
          photoURL: undefined
        },
        content: 'Been there! We use automated backups with point-in-time recovery. Game changer.',
        createdAt: new Date(Date.now() - 900000).toISOString(),
        likes: ['user11']
      }
    ],
    savedBy: ['user8'],
    shares: ['user5', 'user13'],
    createdAt: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
    views: 92
  }
];

const Feed: React.FC<FeedProps> = ({ theme, showToast }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [allPosts, setAllPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    initializeFeed();
  }, []);

  const initializeFeed = async () => {
    try {
      await fetchCurrentUser();
      await Promise.all([fetchFeed(), fetchVideos()]);
    } catch (error) {
      console.error('Error initializing feed:', error);
      showToast('Failed to load feed', 'error');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData._id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchFeed = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Use mock data when no token available
        setAllPosts(mockPosts);
        setPosts(mockPosts);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/feed?page=1&limit=20`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedPosts = data.feeds || [];
        
        // If no posts from API, use mock data for demonstration
        if (fetchedPosts.length === 0) {
          setAllPosts(mockPosts);
          setPosts(mockPosts);
        } else {
          setAllPosts(fetchedPosts);
          setPosts(fetchedPosts);
        }
        
        // Initialize liked and saved posts
        const liked = new Set<string>(fetchedPosts?.filter((post: FeedPost) => 
          post.likes.includes(currentUserId)).map((post: FeedPost) => post._id) || []);
        const saved = new Set<string>(fetchedPosts?.filter((post: FeedPost) => 
          post.savedBy.includes(currentUserId)).map((post: FeedPost) => post._id) || []);
        
        setLikedPosts(liked);
        setSavedPosts(saved);
      } else {
        // Use mock data for demonstration when API is not available
        setAllPosts(mockPosts);
        setPosts(mockPosts);
        showToast('Showing demo content', 'info');
      }
    } catch (error) {
      // Use mock data when there are network errors
      setAllPosts(mockPosts);
      setPosts(mockPosts);
      showToast('Showing demo content', 'info');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchVideos = async () => {
    // For now, just use mock data to demonstrate the UI
    // TODO: Uncomment API call when backend video endpoints are deployed
    
    /*
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setVideos(mockVideos);
        return;
      }

      const response = await fetch(`${API_URL}/videos/feed`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedVideos = data.videos || [];
        
        if (fetchedVideos.length === 0) {
          setVideos(mockVideos);
        } else {
          setVideos(fetchedVideos);
        }
      } else {
        console.error('Failed to fetch videos, using mock data');
        setVideos(mockVideos);
      }
    } catch (error) {
      console.error('Error fetching videos, using mock data:', error);
      setVideos(mockVideos);
    }
    */
    
    // Use mock data for demonstration
    setVideos(mockVideos);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchFeed(), fetchVideos()]);
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const isLiked = likedPosts.has(postId);
      const method = isLiked ? 'DELETE' : 'POST';
      
      // Optimistic update
      const newLikedPosts = new Set(likedPosts);
      if (isLiked) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      setLikedPosts(newLikedPosts);

      const response = await fetch(`${API_URL}/feed/${postId}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Revert optimistic update
        setLikedPosts(likedPosts);
        showToast('Failed to update like', 'error');
      }
    } catch (error) {
      console.error('Error handling like:', error);
      setLikedPosts(likedPosts); // Revert optimistic update
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const isSaved = savedPosts.has(postId);
      const method = isSaved ? 'DELETE' : 'POST';
      
      // Optimistic update
      const newSavedPosts = new Set(savedPosts);
      if (isSaved) {
        newSavedPosts.delete(postId);
      } else {
        newSavedPosts.add(postId);
      }
      setSavedPosts(newSavedPosts);

      const response = await fetch(`${API_URL}/feed/${postId}/save`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Revert optimistic update
        setSavedPosts(savedPosts);
        showToast('Failed to save post', 'error');
      } else {
        showToast(isSaved ? 'Post unsaved' : 'Post saved', 'success');
      }
    } catch (error) {
      console.error('Error handling save:', error);
      setSavedPosts(savedPosts); // Revert optimistic update
    }
  };

  const handleShare = (post: FeedPost) => {
    // For now, just show a toast
    showToast('Share feature coming soon!', 'info');
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      showToast('Please enter post content', 'error');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const tagsArray = newPostTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`${API_URL}/feed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPostContent,
          tags: tagsArray,
          type: 'text'
        }),
      });

      if (response.ok) {
        setNewPostContent('');
        setNewPostTags('');
        setShowAddModal(false);
        showToast('Post created successfully!', 'success');
        // Refresh feed to show new post
        await fetchFeed();
      } else {
        showToast('Failed to create post', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Error creating post. Please try again.', 'error');
    }
  };

  const applyFilters = () => {
    let filteredPosts = [...allPosts];

    // Filter by role
    if (selectedRole && selectedRole !== 'All') {
      filteredPosts = filteredPosts.filter(post => 
        post.author.selectedRole.toLowerCase().includes(selectedRole.toLowerCase())
      );
    }

    // Filter by tags
    if (filterTags.length > 0) {
      filteredPosts = filteredPosts.filter(post =>
        post.tags.some(tag => 
          filterTags.some(filterTag => 
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    setPosts(filteredPosts);
    setShowFilter(false);
    showToast(`Showing ${filteredPosts.length} filtered posts`, 'success');
  };

  const clearFilters = () => {
    setFilterTags([]);
    setSelectedRole('');
    setPosts(allPosts);
    setShowFilter(false);
    showToast('Filters cleared', 'success');
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const renderPost = ({ item: post }: { item: FeedPost }) => {
    const isLiked = likedPosts.has(post._id);
    const isSaved = savedPosts.has(post._id);

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[
          styles.postContainer,
          { backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF' }
        ]}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={[
                styles.avatar,
                { backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }
              ]}>
                <Users size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              </View>
              <View style={styles.authorDetails}>
                <Text style={[
                  styles.authorName,
                  { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
                ]}>
                  {post.author.name}
                </Text>
                <View style={styles.authorMeta}>
                  <Text style={[
                    styles.authorRole,
                    { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    {post.author.selectedRole}
                  </Text>
                  <Text style={[
                    styles.postTime,
                    { color: theme === 'dark' ? '#6B7280' : '#9CA3AF' }
                  ]}>
                    • {formatTimeAgo(post.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          <View style={styles.postContent}>
            <Text style={[
              styles.postText,
              { color: theme === 'dark' ? '#E5E7EB' : '#374151' }
            ]}>
              {post.content}
            </Text>
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {post.tags.slice(0, 3).map((tag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      { backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }
                    ]}
                  >
                    <SkillIcon skill={tag} size={12} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
                    <Text style={[
                      styles.tagText,
                      { color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }
                    ]}>
                      {tag}
                    </Text>
                  </View>
                ))}
                {post.tags.length > 3 && (
                  <Text style={[
                    styles.moreTagsText,
                    { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
                  ]}>
                    +{post.tags.length - 3} more
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Post Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLike(post._id)}
            >
              <Heart 
                size={20} 
                color={isLiked ? '#EF4444' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')}
                fill={isLiked ? '#EF4444' : 'transparent'}
              />
              <Text style={[
                styles.actionText,
                { color: isLiked ? '#EF4444' : (theme === 'dark' ? '#9CA3AF' : '#6B7280') }
              ]}>
                {post.likes.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle 
                size={20} 
                color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
              />
              <Text style={[
                styles.actionText,
                { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
              ]}>
                {post.comments.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleShare(post)}
            >
              <Share 
                size={20} 
                color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
              />
              <Text style={[
                styles.actionText,
                { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
              ]}>
                {post.shares.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => handleSave(post._id)}
            >
              <Bookmark 
                size={20} 
                color={isSaved ? '#F59E0B' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')}
                fill={isSaved ? '#F59E0B' : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Code size={48} color={theme === 'dark' ? '#6B7280' : '#9CA3AF'} />
      <Text style={[
        styles.emptyTitle,
        { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
      ]}>
        No posts yet
      </Text>
      <Text style={[
        styles.emptySubtitle,
        { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
      ]}>
        Connect with other developers to see their posts
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={[
      styles.header,
      { backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF' }
    ]}>
      <Text style={[
        styles.headerTitle,
        { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
      ]}>
        Feed
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Filter size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVideoCard = ({ item }: { item: VideoContent }) => {
    // Format duration from seconds to minutes:seconds
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Format views count
    const formatViews = (views: number) => {
      if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}k`;
      }
      return views.toString();
    };

    // Get difficulty color
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'beginner': return '#10B981'; // green
        case 'intermediate': return '#F59E0B'; // yellow
        case 'advanced': return '#EF4444'; // red
        default: return theme === 'dark' ? '#9CA3AF' : '#6B7280';
      }
    };

    return (
      <TouchableOpacity style={[
        styles.videoCard,
        { backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF' }
      ]}>
        <View style={styles.videoThumbnailContainer}>
          <View style={[
            styles.videoThumbnail,
            { backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }
          ]}>
            <Play size={28} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          </View>
          <View style={styles.videoDuration}>
            <Text style={styles.videoDurationText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
          <View style={styles.videoStats}>
            <Text style={styles.videoStatsText}>
              {formatViews(item.views)} views
            </Text>
          </View>
        </View>
        <View style={styles.videoInfo}>
          <Text style={[
            styles.videoTitle,
            { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
          ]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[
            styles.videoEducator,
            { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
          ]} numberOfLines={1}>
            by {item.educator.name}
          </Text>
          <View style={styles.videoMeta}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {item.difficulty.toUpperCase()}
              </Text>
            </View>
            <Text style={[
              styles.videoCategory,
              { color: theme === 'dark' ? '#8B5CF6' : '#EF4444' }
            ]}>
              {item.category}
            </Text>
          </View>
          <View style={styles.videoFooter}>
            <Heart size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Text style={[
              styles.videoLikes,
              { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
            ]}>
              {item.likes}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVideosSection = () => {
    if (videos.length === 0) return null;
    
    return (
      <View style={styles.videosSection}>
        <View style={styles.videosSectionHeader}>
          <Video size={20} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          <Text style={[
            styles.videosSectionTitle,
            { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
          ]}>
            Educational Videos
          </Text>
        </View>
        <FlatList
          data={videos}
          renderItem={renderVideoCard}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videosListContainer}
        />
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC' }
      ]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} 
          />
          <Text style={[
            styles.loadingText,
            { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
          ]}>
            Loading your feed...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC' }
    ]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderVideosSection}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme === 'dark' ? '#8B5CF6' : '#EF4444']}
              tintColor={theme === 'dark' ? '#8B5CF6' : '#EF4444'}
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            posts.length === 0 && styles.emptyListContainer
          ]}
          ListEmptyComponent={renderEmptyState}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={5}
          windowSize={10}
        />
      </KeyboardAvoidingView>

      {/* Add Post Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modal,
            { backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
              ]}>
                Create New Post
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Text style={[
                  styles.closeButtonText,
                  { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
                ]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.postInput,
                { 
                  backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB',
                  color: theme === 'dark' ? '#F9FAFB' : '#111827',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }
              ]}
              placeholder="What's on your mind?"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TextInput
              style={[
                styles.tagsInput,
                { 
                  backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB',
                  color: theme === 'dark' ? '#F9FAFB' : '#111827',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }
              ]}
              placeholder="Tags (comma separated, e.g., React, JavaScript, Web)"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newPostTags}
              onChangeText={setNewPostTags}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }
                ]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[
                  styles.cancelButtonText,
                  { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  { backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444' }
                ]}
                onPress={handleCreatePost}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modal,
            { backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
              ]}>
                Filter Posts
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilter(false)}
                style={styles.closeButton}
              >
                <Text style={[
                  styles.closeButtonText,
                  { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
                ]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[
              styles.filterLabel,
              { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
            ]}>
              Filter by Role
            </Text>
            <View style={styles.roleFilter}>
              {['All', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'DevOps Engineer', 'Data Scientist'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    selectedRole === role && styles.selectedRole,
                    { 
                      backgroundColor: selectedRole === role 
                        ? (theme === 'dark' ? '#8B5CF6' : '#EF4444')
                        : (theme === 'dark' ? '#374151' : '#F3F4F6'),
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                    }
                  ]}
                  onPress={() => setSelectedRole(role === 'All' ? '' : role)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    { color: selectedRole === role 
                        ? '#FFFFFF' 
                        : (theme === 'dark' ? '#D1D5DB' : '#6B7280') 
                    }
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[
              styles.filterLabel,
              { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
            ]}>
              Filter by Tags (comma separated)
            </Text>
            <TextInput
              style={[
                styles.tagsInput,
                { 
                  backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB',
                  color: theme === 'dark' ? '#F9FAFB' : '#111827',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }
              ]}
              placeholder="e.g., React, JavaScript, Node.js"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={filterTags.join(', ')}
              onChangeText={(text) => setFilterTags(text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }
                ]}
                onPress={clearFilters}
              >
                <Text style={[
                  styles.cancelButtonText,
                  { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
                ]}>
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  { backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444' }
                ]}
                onPress={applyFilters}
              >
                <Text style={styles.postButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  postContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  postTime: {
    fontSize: 12,
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  postInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 120,
  },
  tagsInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  postButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  roleFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedRole: {
    // This style is handled dynamically in the component
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Video Styles
  videosSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  videosSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  videosSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  videosListContainer: {
    paddingRight: 16,
  },
  videoCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  videoThumbnailContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  videoInfo: {
    padding: 8,
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoCategory: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  videoDifficulty: {
    fontSize: 10,
  },
  videoStats: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoStatsText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '500',
  },
  videoEducator: {
    fontSize: 10,
    marginBottom: 4,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  videoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoLikes: {
    fontSize: 10,
  },
});

export default Feed;
