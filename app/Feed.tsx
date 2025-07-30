import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { 
  Plus, Heart, MessageCircle, Share, Bookmark, Clock, TrendingUp
} from 'lucide-react-native';

interface FeedProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
}

interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
    skills: string[];
  };
  content: string;
  image?: string | null;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  category: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export const Feed: React.FC<FeedProps> = ({ theme, showToast }) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: { 
        name: 'Alice Johnson', 
        avatar: 'https://www.gravatar.com/avatar/1?d=mp&f=y', 
        skills: ['React', 'UX'] 
      },
      content: 'Just completed my first React Native app! 🎉 The learning curve was steep but totally worth it. The cross-platform capabilities are amazing. Anyone else working on mobile development? Would love to connect and share experiences!',
      image: null,
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago',
      category: 'Achievement',
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      user: { 
        name: 'David Chen', 
        avatar: 'https://www.gravatar.com/avatar/2?d=mp&f=y', 
        skills: ['Python', 'AI'] 
      },
      content: '💡 Quick tip: When working with APIs, always implement proper error handling and retry logic. Saved me countless hours of debugging! Here\'s a simple pattern I use for handling network failures gracefully.',
      image: null,
      likes: 45,
      comments: 12,
      shares: 18,
      timestamp: '4 hours ago',
      category: 'Tip',
      isLiked: true,
      isBookmarked: false
    },
    {
      id: 3,
      user: { 
        name: 'Sarah Wilson', 
        avatar: 'https://www.gravatar.com/avatar/3?d=mp&f=y', 
        skills: ['Design', 'Figma'] 
      },
      content: 'Just launched my portfolio redesign! 🚀 Focused on accessibility and performance this time. Load time improved by 60% and accessibility score is now 100%. The small details make a huge difference in user experience.',
      image: null,
      likes: 67,
      comments: 15,
      shares: 9,
      timestamp: '6 hours ago',
      category: 'Project',
      isLiked: false,
      isBookmarked: true
    },
    {
      id: 4,
      user: { 
        name: 'Michael Brown', 
        avatar: 'https://www.gravatar.com/avatar/4?d=mp&f=y', 
        skills: ['Backend', 'DevOps'] 
      },
      content: 'Question for the community: What\'s your preferred approach for handling database migrations in production? Been exploring different strategies and would love to hear your experiences and best practices.',
      image: null,
      likes: 32,
      comments: 21,
      shares: 6,
      timestamp: '8 hours ago',
      category: 'Question',
      isLiked: false,
      isBookmarked: false
    }
  ]);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLikedState = !post.isLiked;
        showToast(newLikedState ? 'Post liked!' : 'Like removed', 'success');
        return {
          ...post,
          isLiked: newLikedState,
          likes: newLikedState ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleBookmark = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newBookmarkedState = !post.isBookmarked;
        showToast(newBookmarkedState ? 'Post bookmarked!' : 'Bookmark removed', 'success');
        return {
          ...post,
          isBookmarked: newBookmarkedState
        };
      }
      return post;
    }));
  };

  const handleShare = (postId: number) => {
    showToast('Post shared!', 'success');
  };

  const handleComment = (postId: number) => {
    showToast('Opening comments...', 'success');
  };

  const styles = getStyles(theme);
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Feed</Text>
          <Text style={styles.headerSubtitle}>Discover and share knowledge</Text>
        </View>
        <TouchableOpacity 
          style={styles.createPostBtn}
          onPress={() => showToast('Create new post', 'success')}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Trending Topics */}
      <View style={styles.trendingSection}>
        <View style={styles.trendingHeader}>
          <TrendingUp size={18} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          <Text style={styles.trendingTitle}>Trending Topics</Text>
        </View>
        <View style={styles.trendingTags}>
          {['React Native', 'AI/ML', 'Web3', 'DevOps', 'UI/UX'].map((tag, index) => (
            <TouchableOpacity key={index} style={styles.trendingTag}>
              <Text style={styles.trendingTagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Posts */}
      {posts.map(post => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
            <View style={styles.postUserInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{post.user.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{post.category}</Text>
                </View>
              </View>
              <View style={styles.userSkills}>
                {post.user.skills.map((skill, index) => (
                  <Text key={index} style={styles.skillBadge}>{skill}</Text>
                ))}
              </View>
              <View style={styles.timeRow}>
                <Clock size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={styles.postTime}>{post.timestamp}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.postContent}>{post.content}</Text>
          
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleLike(post.id)}
            >
              <Heart 
                size={18} 
                color={post.isLiked ? '#EF4444' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')}
                fill={post.isLiked ? '#EF4444' : 'transparent'}
              />
              <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                {post.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleComment(post.id)}
            >
              <MessageCircle size={18} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleShare(post.id)}
            >
              <Share size={18} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Text style={styles.actionText}>{post.shares}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bookmarkBtn}
              onPress={() => handleBookmark(post.id)}
            >
              <Bookmark 
                size={18} 
                color={post.isBookmarked ? (theme === 'dark' ? '#8B5CF6' : '#EF4444') : (theme === 'dark' ? '#9CA3AF' : '#6B7280')}
                fill={post.isBookmarked ? (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Load More */}
      <TouchableOpacity 
        style={styles.loadMoreBtn}
        onPress={() => showToast('Loading more posts...', 'success')}
      >
        <Text style={styles.loadMoreText}>Load More Posts</Text>
      </TouchableOpacity>
    </ScrollView>
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
  headerSubtitle: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginTop: 2,
  },
  createPostBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    padding: 12,
    borderRadius: 12,
    shadowColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trendingSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  trendingTagText: {
    fontSize: 12,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  postCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  postUserInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  categoryBadge: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    textTransform: 'uppercase',
  },
  userSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  skillBadge: {
    backgroundColor: theme === 'dark' ? '#27272A' : '#F3F4F6',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontSize: 10,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postTime: {
    fontSize: 10,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginLeft: 4,
  },
  postContent: {
    fontSize: 14,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
    fontWeight: '700',
  },
  bookmarkBtn: {
    padding: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  loadMoreBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignSelf: 'center',
    marginVertical: 24,
    elevation: 4,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});