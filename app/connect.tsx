import {
    Award,
    BookOpen,
    CheckCircle,
    Clock,
    Filter,
    MapPin,
    Search,
    Send,
    Star, Target,
    Users,
    Zap
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ConnectProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
}

interface User {
  id: number;
  name: string;
  avatar: string;
  location: string;
  knows: string[];
  wants: string[];
  teaches: string[];
  matchScore: number;
  rating: number;
  connections: number;
  isConnected?: boolean;
  lastActive: string;
  projects: number;
  expertise: string;
}

const Connect: React.FC<ConnectProps> = ({ theme, showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Sarah Wilson',
      avatar: 'https://www.gravatar.com/avatar/3?d=mp&f=y',
      location: 'San Francisco, CA',
      knows: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
      wants: ['Machine Learning', 'Python', 'TensorFlow'],
      teaches: ['Frontend Development', 'UI/UX Design', 'React Native'],
      matchScore: 95,
      rating: 4.8,
      connections: 150,
      isConnected: false,
      lastActive: '2 hours ago',
      projects: 12,
      expertise: 'Senior Frontend Developer'
    },
    {
      id: 2,
      name: 'Michael Brown',
      avatar: 'https://www.gravatar.com/avatar/4?d=mp&f=y',
      location: 'New York, NY',
      knows: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      wants: ['React Native', 'Mobile Development', 'Flutter'],
      teaches: ['Backend Development', 'Database Design', 'DevOps'],
      matchScore: 87,
      rating: 4.6,
      connections: 89,
      isConnected: true,
      lastActive: '1 hour ago',
      projects: 8,
      expertise: 'Full Stack Developer'
    },
    {
      id: 3,
      name: 'Emily Chen',
      avatar: 'https://www.gravatar.com/avatar/5?d=mp&f=y',
      location: 'Toronto, ON',
      knows: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
      wants: ['Kubernetes', 'Cloud Architecture', 'Go'],
      teaches: ['Java Development', 'System Design', 'Architecture'],
      matchScore: 78,
      rating: 4.7,
      connections: 203,
      isConnected: false,
      lastActive: '30 minutes ago',
      projects: 15,
      expertise: 'Senior Backend Engineer'
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      avatar: 'https://www.gravatar.com/avatar/6?d=mp&f=y',
      location: 'London, UK',
      knows: ['JavaScript', 'Vue.js', 'Firebase', 'MongoDB'],
      wants: ['React', 'Next.js', 'TypeScript'],
      teaches: ['Vue.js', 'Frontend Architecture', 'Web Performance'],
      matchScore: 82,
      rating: 4.5,
      connections: 67,
      isConnected: false,
      lastActive: '5 minutes ago',
      projects: 9,
      expertise: 'Frontend Specialist'
    }
  ]);

  const handleConnect = (userId: number) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newConnectedState = !user.isConnected;
        showToast(
          newConnectedState ? 'Connection request sent!' : 'Connection removed', 
          'success'
        );
        return {
          ...user,
          isConnected: newConnectedState,
          connections: newConnectedState ? user.connections + 1 : user.connections - 1
        };
      }
      return user;
    }));
  };

  const handleMessage = (userName: string) => {
    showToast(`Opening chat with ${userName}...`, 'success');
  };

  const handleAIMatch = () => {
    showToast('🤖 AI is finding your perfect matches...', 'success');
    // Simulate AI matching delay
    setTimeout(() => {
      showToast('✨ Found 3 new potential matches!', 'success');
    }, 2000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.knows.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         user.wants.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         user.teaches.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'connected') return matchesSearch && user.isConnected;
    if (activeFilter === 'available') return matchesSearch && !user.isConnected;
    return matchesSearch;
  });

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Find Your Match</Text>
          <Text style={styles.headerSubtitle}>Connect with learners and mentors</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by skills, location, or name..."
          placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All Users' },
          { key: 'available', label: 'Available' },
          { key: 'connected', label: 'Connected' }
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterTab, activeFilter === filter.key && styles.activeFilterTab]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[styles.filterTabText, activeFilter === filter.key && styles.activeFilterTabText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Match Button */}
      <TouchableOpacity 
        style={styles.aiMatchBtn}
        onPress={handleAIMatch}
      >
        <Zap size={20} color="#fff" />
        <Text style={styles.aiMatchText}>AI Smart Match</Text>
        <View style={styles.aiMatchBadge}>
          <Text style={styles.aiMatchBadgeText}>NEW</Text>
        </View>
      </TouchableOpacity>

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={styles.statItem}>
          <Users size={16} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          <Text style={styles.statText}>{filteredUsers.length} Users Found</Text>
        </View>
        <View style={styles.statItem}>
          <Target size={16} color={theme === 'dark' ? '#10B981' : '#F59E0B'} />
          <Text style={styles.statText}>
            {Math.round(filteredUsers.reduce((acc, user) => acc + user.matchScore, 0) / filteredUsers.length)}% Avg Match
          </Text>
        </View>
      </View>

      {/* User Cards */}
      {filteredUsers.map(user => (
        <View key={user.id} style={styles.userCard}>
          <View style={styles.userCardHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user.avatar }} style={styles.userCardAvatar} />
              <View style={[styles.statusIndicator, user.lastActive.includes('minutes') && styles.onlineStatus]} />
            </View>
            <View style={styles.userCardInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userCardName}>{user.name}</Text>
                <View style={styles.matchScore}>
                  <Text style={styles.matchScoreText}>{user.matchScore}%</Text>
                </View>
              </View>
              <Text style={styles.userExpertise}>{user.expertise}</Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={styles.locationText}>{user.location}</Text>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Star size={12} color="#F59E0B" />
                  <Text style={styles.metaText}>{user.rating}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Text style={styles.metaText}>{user.connections}</Text>
                </View>
                <View style={styles.metaItem}>
                  <BookOpen size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Text style={styles.metaText}>{user.projects} projects</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Text style={styles.metaText}>{user.lastActive}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.skillsSection}>
            <View style={styles.skillCategory}>
              <View style={styles.skillCategoryHeader}>
                <CheckCircle size={14} color={theme === 'dark' ? '#10B981' : '#059669'} />
                <Text style={styles.skillCategoryTitle}>Knows ({user.knows.length})</Text>
              </View>
              <View style={styles.skillTags}>
                {user.knows.slice(0, 3).map((skill, index) => (
                  <View key={index} style={[styles.skillTag, styles.knowsTag]}>
                    <Text style={styles.knowsTagText}>{skill}</Text>
                  </View>
                ))}
                {user.knows.length > 3 && (
                  <View style={styles.moreSkillsTag}>
                    <Text style={styles.moreSkillsText}>+{user.knows.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.skillCategory}>
              <View style={styles.skillCategoryHeader}>
                <Target size={14} color={theme === 'dark' ? '#F59E0B' : '#D97706'} />
                <Text style={styles.skillCategoryTitle}>Wants to Learn ({user.wants.length})</Text>
              </View>
              <View style={styles.skillTags}>
                {user.wants.slice(0, 3).map((skill, index) => (
                  <View key={index} style={[styles.skillTag, styles.wantsTag]}>
                    <Text style={styles.wantsTagText}>{skill}</Text>
                  </View>
                ))}
                {user.wants.length > 3 && (
                  <View style={styles.moreSkillsTag}>
                    <Text style={styles.moreSkillsText}>+{user.wants.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.skillCategory}>
              <View style={styles.skillCategoryHeader}>
                <Award size={14} color={theme === 'dark' ? '#8B5CF6' : '#7C3AED'} />
                <Text style={styles.skillCategoryTitle}>Teaches ({user.teaches.length})</Text>
              </View>
              <View style={styles.skillTags}>
                {user.teaches.slice(0, 3).map((skill, index) => (
                  <View key={index} style={[styles.skillTag, styles.teachesTag]}>
                    <Text style={styles.teachesTagText}>{skill}</Text>
                  </View>
                ))}
                {user.teaches.length > 3 && (
                  <View style={styles.moreSkillsTag}>
                    <Text style={styles.moreSkillsText}>+{user.teaches.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.userCardActions}>
            <TouchableOpacity 
              style={[styles.connectBtn, user.isConnected && styles.connectedBtn]}
              onPress={() => handleConnect(user.id)}
            >
              {user.isConnected ? (
                <>
                  <CheckCircle size={16} color="#fff" />
                  <Text style={styles.connectBtnText}>Connected</Text>
                </>
              ) : (
                <>
                  <Users size={16} color="#fff" />
                  <Text style={styles.connectBtnText}>Connect</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.messageBtn}
              onPress={() => handleMessage(user.name)}
            >
              <Send size={16} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Load More */}
      {filteredUsers.length === 0 && (
        <View style={styles.emptyState}>
          <Search size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
          <Text style={styles.emptyStateTitle}>No matches found</Text>
          <Text style={styles.emptyStateText}>Try adjusting your search criteria or filters</Text>
        </View>
      )}
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
  filterBtn: {
    padding: 8,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  activeFilterTab: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  filterTabText: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiMatchBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    position: 'relative',
    shadowColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiMatchText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aiMatchBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  aiMatchBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
  },
  userCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  userCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme === 'dark' ? '#6B7280' : '#9CA3AF',
    borderWidth: 2,
    borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
  },
  onlineStatus: {
    backgroundColor: '#10B981',
  },
  userCardInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  userExpertise: {
    fontSize: 14,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
    marginBottom: 6,
  },
  matchScore: {
    backgroundColor: theme === 'dark' ? '#10B981' : '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  matchScoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  skillsSection: {
    marginBottom: 20,
  },
  skillCategory: {
    marginBottom: 12,
  },
  skillCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  skillCategoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  knowsTag: {
    backgroundColor: theme === 'dark' ? '#065F46' : '#D1FAE5',
  },
  knowsTagText: {
    fontSize: 11,
    color: theme === 'dark' ? '#10B981' : '#065F46',
    fontWeight: '500',
  },
  wantsTag: {
    backgroundColor: theme === 'dark' ? '#7C2D12' : '#FED7AA',
  },
  wantsTagText: {
    fontSize: 11,
    color: theme === 'dark' ? '#F59E0B' : '#9A3412',
    fontWeight: '500',
  },
  teachesTag: {
    backgroundColor: theme === 'dark' ? '#312E81' : '#E0E7FF',
  },
  teachesTagText: {
    fontSize: 11,
    color: theme === 'dark' ? '#8B5CF6' : '#3730A3',
    fontWeight: '500',
  },
  moreSkillsTag: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreSkillsText: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },
  userCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  connectBtn: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  connectedBtn: {
    backgroundColor: theme === 'dark' ? '#10B981' : '#059669',
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  messageBtnText: {
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Connect;