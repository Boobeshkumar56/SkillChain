import {
  Bookmark,
  Clock,
  Heart,
  MessageCircle,
  Plus,
  Share,
  TrendingUp,
  Filter,
  Search,
  Users,
  Edit3,
  MoreHorizontal,
  UserPlus
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, FlatList, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL || "http://localhost:5000/api/auth";

interface FeedProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
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
  media: any[];
  likes: string[];
  comments: any[];
  shares: string[];
  savedBy: string[];
  isPublic: boolean;
  createdAt: string;
  views: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  selectedRole: string;
  photoURL?: string;
  bio?: string;
  knownSkills: any[];
  isActive: boolean;
}

const Feed: React.FC<FeedProps> = ({ theme, showToast }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  // Modal states
  const [createPostModal, setCreatePostModal] = useState(false);
  const [savedPostsModal, setSavedPostsModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [connectModal, setConnectModal] = useState(false);
  
  // Form states
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'post',
    category: '',
    tags: ''
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    search: ''
  });
  
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed');

  useEffect(() => {
    fetchCurrentUser();
    fetchFeed();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (filters.type !== 'all' || filters.category !== 'all' || filters.search) {
      fetchFeed();
    }
  }, [filters]);

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
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: '1',
        limit: '20',
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${API_URL}/feed?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.feeds);
      } else {
        showToast('Failed to fetch feed', 'error');
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      showToast('Error loading feed', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/feed/saved`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPosts(data.feeds);
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/connections?status=all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const connections = await response.json();
        // Extract users from connections
        const connectedUsers = connections.map((conn: any) => conn.user);
        setUsers(connectedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createPost = async () => {
    if (!newPost.content.trim()) {
      showToast('Please enter post content', 'error');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const postData = {
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch(`${API_URL}/feed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setCreatePostModal(false);
        setNewPost({ content: '', type: 'post', category: '', tags: '' });
        fetchFeed();
        showToast('Post created successfully!');
      } else {
        showToast('Failed to create post', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Error creating post', 'error');
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/feed/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likes: data.isLiked 
                  ? [...post.likes, currentUserId]
                  : post.likes.filter(id => id !== currentUserId)
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleSave = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/feed/${postId}/save`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                savedBy: data.isSaved 
                  ? [...post.savedBy, currentUserId]
                  : post.savedBy.filter(id => id !== currentUserId)
              }
            : post
        ));
        
        if (data.isSaved) {
          showToast('Post saved!');
        } else {
          showToast('Post unsaved');
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const sendConnectionRequest = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/connect-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        showToast('Connection request sent!');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to send connection request', 'error');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      showToast('Error sending connection request', 'error');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const renderPost = ({ item: post }: { item: FeedPost }) => {
    const isLiked = post.likes.includes(currentUserId);
    const isSaved = post.savedBy.includes(currentUserId);
    const isOwnPost = post.author._id === currentUserId;

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {post.author.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{post.author.name}</Text>
              <Text style={styles.userRole}>{post.author.selectedRole || 'Developer'}</Text>
              <Text style={styles.postTime}>
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.postActions}>
            {!isOwnPost && (
              <TouchableOpacity 
                style={styles.connectBtn}
                onPress={() => sendConnectionRequest(post.author._id)}
              >
                <UserPlus size={16} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.moreBtn}>
              <MoreHorizontal size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{post.content}</Text>

        {/* Post Tags */}
        {post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Post Footer */}
        <View style={styles.postFooter}>
          <TouchableOpacity 
            style={[styles.actionBtn, isLiked && styles.actionBtnActive]}
            onPress={() => toggleLike(post._id)}
          >
            <Heart 
              size={18} 
              color={isLiked ? '#EF4444' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')}
              fill={isLiked ? '#EF4444' : 'transparent'}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {post.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <MessageCircle size={18} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Text style={styles.actionText}>{post.comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Share size={18} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Text style={styles.actionText}>{post.shares.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, isSaved && styles.actionBtnActive]}
            onPress={() => toggleSave(post._id)}
          >
            <Bookmark 
              size={18} 
              color={isSaved ? '#F59E0B' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')}
              fill={isSaved ? '#F59E0B' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Feed</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => {
              fetchSavedPosts();
              setSavedPostsModal(true);
            }}
          >
            <Bookmark size={20} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => setFilterModal(true)}
          >
            <Filter size={20} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => setConnectModal(true)}
          >
            <Users size={20} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Post Button */}
      <TouchableOpacity 
        style={styles.createPostBtn}
        onPress={() => setCreatePostModal(true)}
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.createPostText}>Share something with the community...</Text>
      </TouchableOpacity>

      {/* Feed List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>Be the first to share something!</Text>
          </View>
        }
      />

      {/* Create Post Modal */}
      <Modal visible={createPostModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setCreatePostModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              placeholder="What's on your mind?"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newPost.content}
              onChangeText={(text) => setNewPost({...newPost, content: text})}
              style={[styles.modalInput, { height: 120 }]}
              multiline
            />
            
            <TextInput
              placeholder="Category (optional)"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newPost.category}
              onChangeText={(text) => setNewPost({...newPost, category: text})}
              style={styles.modalInput}
            />
            
            <TextInput
              placeholder="Tags (comma separated)"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newPost.tags}
              onChangeText={(text) => setNewPost({...newPost, tags: text})}
              style={styles.modalInput}
            />

            <View style={styles.postTypeSelector}>
              {['post', 'question', 'achievement', 'project-showcase'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newPost.type === type && styles.typeOptionSelected
                  ]}
                  onPress={() => setNewPost({...newPost, type: type})}
                >
                  <Text style={[
                    styles.typeOptionText,
                    newPost.type === type && styles.typeOptionTextSelected
                  ]}>
                    {type.replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={createPost} style={styles.createBtn}>
              <Text style={styles.createBtnText}>Share Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Saved Posts Modal */}
      <Modal visible={savedPostsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Posts</Text>
              <TouchableOpacity onPress={() => setSavedPostsModal(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={savedPosts}
              renderItem={renderPost}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Bookmark size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
                  <Text style={styles.emptyStateText}>No saved posts</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.modalTitle}>Filter Posts</Text>
            
            <Text style={styles.filterLabel}>Type</Text>
            <View style={styles.filterOptions}>
              {['all', 'post', 'question', 'achievement', 'project-showcase'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.type === type && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({...filters, type})}
                >
                  <Text style={styles.filterOptionText}>
                    {type === 'all' ? 'All' : type.replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Search posts..."
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={filters.search}
              onChangeText={(text) => setFilters({...filters, search: text})}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => {
                  setFilters({ type: 'all', category: 'all', search: '' });
                  setFilterModal(false);
                }} 
                style={styles.resetBtn}
              >
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setFilterModal(false)} 
                style={styles.applyBtn}
              >
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Connect Modal */}
      <Modal visible={connectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect with People</Text>
              <TouchableOpacity onPress={() => setConnectModal(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={users}
              keyExtractor={(item) => item._id}
              renderItem={({ item: user }) => (
                <View style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userRole}>{user.selectedRole || 'Developer'}</Text>
                      <Text style={styles.userSkills}>
                        {user.knownSkills.slice(0, 3).map(skill => skill.skill).join(', ')}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.connectUserBtn}
                    onPress={() => sendConnectionRequest(user._id)}
                  >
                    <UserPlus size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Users size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
                  <Text style={styles.emptyStateText}>No users found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
  },
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  createPostText: {
    flex: 1,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontSize: 16,
  },
  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
  },
  connectBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
  },
  moreBtn: {
    padding: 6,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnActive: {
    backgroundColor: theme === 'dark' ? '#312E81' : '#FEE2E2',
  },
  actionText: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme === 'dark' ? '#6B7280' : '#9CA3AF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  filterModal: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  cancelText: {
    fontSize: 16,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  modalInput: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  postTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
  },
  typeOptionSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  typeOptionText: {
    fontSize: 12,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
  createBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
  },
  filterOptionSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  filterOptionText: {
    fontSize: 12,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetText: {
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme === 'dark' ? '#374151' : '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  userSkills: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginTop: 2,
  },
  connectUserBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    padding: 8,
    borderRadius: 8,
  },
});

export default Feed;
