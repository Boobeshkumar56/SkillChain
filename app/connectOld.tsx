import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  Search,
  Send,
  Star,
  Target,
  Users,
  Zap,
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  Calendar
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, RefreshControl, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL || "http://localhost:5000/api/auth";

interface ConnectProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
}

interface Connection {
  _id: string;
  requester: string;
  recipient: string;
  status: 'pending' | 'connected' | 'blocked';
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    selectedRole: string;
    bio?: string;
    photoURL?: string;
    knownSkills: { skill: string; level: string }[];
    currentLearnings: { skill: string; level: string; targetDate: string }[];
    projects: { title: string; status: string; description: string }[];
    isActive: boolean;
    lastActiveAt: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  selectedRole: string;
  bio?: string;
  photoURL?: string;
  knownSkills: { skill: string; level: string }[];
  currentLearnings: { skill: string; level: string; targetDate: string }[];
  projects: { title: string; status: string; description: string }[];
  isActive: boolean;
  lastActiveAt: string;
  connectionStatus?: 'none' | 'pending-sent' | 'pending-received' | 'connected' | 'blocked';
}

const Connect: React.FC<ConnectProps> = ({ theme, showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'connections' | 'requests'>('discover');

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchConnections();
    fetchPendingRequests();
  }, []);

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

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      let queryParams = '';
      if (searchQuery) {
        queryParams = `?search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(`${API_URL}/users${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const usersData = await response.json();
        // Filter out current user
        const filteredUsers = usersData.filter((user: User) => user._id !== currentUserId);
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/connections?status=connected`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const connectionsData = await response.json();
        setConnections(connectionsData);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/connections?status=pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const requestsData = await response.json();
        setPendingRequests(requestsData);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
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
        // Update user's connection status
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, connectionStatus: 'pending-sent' }
            : user
        ));
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to send connection request', 'error');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      showToast('Error sending connection request', 'error');
    }
  };

  const respondToRequest = async (connectionId: string, action: 'accept' | 'decline') => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/connection-response`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId, action }),
      });

      if (response.ok) {
        showToast(action === 'accept' ? 'Connection accepted!' : 'Request declined');
        fetchPendingRequests();
        fetchConnections();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || `Failed to ${action} request`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      showToast(`Error ${action}ing request`, 'error');
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/connection/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showToast('Connection removed');
        fetchConnections();
      } else {
        showToast('Failed to remove connection', 'error');
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      showToast('Error removing connection', 'error');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
    fetchConnections();
    fetchPendingRequests();
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.selectedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.knownSkills.some(skill => 
          skill.skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'developers':
          filtered = filtered.filter(user => 
            user.selectedRole.toLowerCase().includes('developer') ||
            user.selectedRole.toLowerCase().includes('engineer')
          );
          break;
        case 'learners':
          filtered = filtered.filter(user => user.currentLearnings.length > 0);
          break;
        case 'active':
          filtered = filtered.filter(user => user.isActive);
          break;
      }
    }

    return filtered;
  };

  const renderUser = ({ item: user }: { item: User }) => {
    const getConnectionStatus = () => {
      // Check if already connected
      const connection = connections.find(conn => 
        conn.user._id === user._id
      );
      if (connection) return 'connected';

      // Check if request sent
      const sentRequest = pendingRequests.find(req => 
        req.recipient === user._id && req.requester === currentUserId
      );
      if (sentRequest) return 'pending-sent';

      // Check if request received
      const receivedRequest = pendingRequests.find(req => 
        req.requester === user._id && req.recipient === currentUserId
      );
      if (receivedRequest) return 'pending-received';

      return 'none';
    };

    const connectionStatus = getConnectionStatus();

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, user.isActive && styles.activeAvatar]}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
              {user.isActive && <View style={styles.activeIndicator} />}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.selectedRole}</Text>
              {user.bio && (
                <Text style={styles.userBio} numberOfLines={2}>
                  {user.bio}
                </Text>
              )}
              <Text style={styles.lastActive}>
                Last active: {new Date(user.lastActiveAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.connectionActions}>
            {connectionStatus === 'none' && (
              <TouchableOpacity 
                style={styles.connectBtn}
                onPress={() => sendConnectionRequest(user._id)}
              >
                <UserPlus size={16} color="#fff" />
                <Text style={styles.connectBtnText}>Connect</Text>
              </TouchableOpacity>
            )}
            
            {connectionStatus === 'pending-sent' && (
              <View style={styles.pendingBtn}>
                <Clock size={16} color={theme === 'dark' ? '#F59E0B' : '#D97706'} />
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}

            {connectionStatus === 'connected' && (
              <View style={styles.connectedBtn}>
                <UserCheck size={16} color={theme === 'dark' ? '#10B981' : '#059669'} />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            )}
          </View>
        </View>

        {/* Skills */}
        {user.knownSkills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsList}>
              {user.knownSkills.slice(0, 4).map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill.skill}</Text>
                  <Text style={styles.skillLevel}>({skill.level})</Text>
                </View>
              ))}
              {user.knownSkills.length > 4 && (
                <Text style={styles.moreSkills}>+{user.knownSkills.length - 4} more</Text>
              )}
            </View>
          </View>
        )}

        {/* Current Learning */}
        {user.currentLearnings.length > 0 && (
          <View style={styles.learningSection}>
            <Text style={styles.sectionTitle}>Currently Learning</Text>
            <View style={styles.learningList}>
              {user.currentLearnings.slice(0, 3).map((learning, index) => (
                <View key={index} style={styles.learningItem}>
                  <BookOpen size={12} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
                  <Text style={styles.learningText}>{learning.skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {user.projects.length > 0 && (
          <View style={styles.projectsSection}>
            <Text style={styles.sectionTitle}>Projects ({user.projects.length})</Text>
            <Text style={styles.projectsText}>
              {user.projects.slice(0, 2).map(p => p.title).join(', ')}
              {user.projects.length > 2 && '...'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderConnection = ({ item: connection }: { item: Connection }) => (
    <View style={styles.connectionCard}>
      <View style={styles.userInfo}>
        <View style={[styles.avatar, connection.user.isActive && styles.activeAvatar]}>
          <Text style={styles.avatarText}>
            {connection.user.name.charAt(0).toUpperCase()}
          </Text>
          {connection.user.isActive && <View style={styles.activeIndicator} />}
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{connection.user.name}</Text>
          <Text style={styles.userRole}>{connection.user.selectedRole}</Text>
          <Text style={styles.connectionDate}>
            Connected on {new Date(connection.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.connectionActions}>
        <TouchableOpacity style={styles.messageBtn}>
          <MessageCircle size={16} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.removeBtn}
          onPress={() => removeConnection(connection._id)}
        >
          <UserX size={16} color={theme === 'dark' ? '#EF4444' : '#DC2626'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPendingRequest = ({ item: request }: { item: Connection }) => (
    <View style={styles.requestCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {request.user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{request.user.name}</Text>
          <Text style={styles.userRole}>{request.user.selectedRole}</Text>
          <Text style={styles.requestDate}>
            {new Date(request.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={styles.acceptBtn}
          onPress={() => respondToRequest(request._id, 'accept')}
        >
          <CheckCircle size={16} color="#fff" />
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.declineBtn}
          onPress={() => respondToRequest(request._id, 'decline')}
        >
          <UserX size={16} color="#fff" />
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect</Text>
        <TouchableOpacity 
          style={styles.requestsBtn}
          onPress={() => setShowRequestsModal(true)}
        >
          <Users size={20} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
          {pendingRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users, skills, roles..."
          placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={fetchUsers}
        />
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {['all', 'developers', 'learners', 'active'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterBtn,
              activeFilter === filter && styles.filterBtnActive
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.filterTextActive
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
          onPress={() => setActiveTab('connections')}
        >
          <Text style={[styles.tabText, activeTab === 'connections' && styles.activeTabText]}>
            Connections ({connections.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'discover' ? (
        <FlatList
          data={getFilteredUsers()}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
              <Text style={styles.emptyStateText}>No users found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={connections}
          renderItem={renderConnection}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
              <Text style={styles.emptyStateText}>No connections yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start connecting with people to build your network
              </Text>
            </View>
          }
        />
      )}

      {/* Pending Requests Modal */}
      <Modal visible={showRequestsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pending Requests</Text>
              <TouchableOpacity onPress={() => setShowRequestsModal(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={pendingRequests}
              renderItem={renderPendingRequest}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Users size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
                  <Text style={styles.emptyStateText}>No pending requests</Text>
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
  requestsBtn: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  filterBtnActive: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  filterText: {
    fontSize: 14,
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#D1D5DB' : '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  userCard: {
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
  connectionCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userHeader: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  activeAvatar: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
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
    fontSize: 13,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: theme === 'dark' ? '#D1D5DB' : '#6B7280',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#9CA3AF',
  },
  connectionDate: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#9CA3AF',
  },
  requestDate: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#9CA3AF',
  },
  connectionActions: {
    gap: 8,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#374151' : '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  pendingText: {
    color: theme === 'dark' ? '#F59E0B' : '#D97706',
    fontSize: 12,
    fontWeight: '600',
  },
  connectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#374151' : '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  connectedText: {
    color: theme === 'dark' ? '#10B981' : '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  messageBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
  },
  removeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  acceptText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  declineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  skillsSection: {
    marginBottom: 12,
  },
  learningSection: {
    marginBottom: 12,
  },
  projectsSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    marginBottom: 6,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    flexDirection: 'row',
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    gap: 4,
  },
  skillText: {
    fontSize: 11,
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    fontWeight: '500',
  },
  skillLevel: {
    fontSize: 10,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  moreSkills: {
    fontSize: 11,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  learningList: {
    gap: 4,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  learningText: {
    fontSize: 12,
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
  },
  projectsText: {
    fontSize: 12,
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
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
    paddingHorizontal: 40,
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
});

export default Connect;
