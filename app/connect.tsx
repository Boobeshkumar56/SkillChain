import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Award,
  Bot,
  Briefcase,
  CheckCircle,
  Clock,
  Code,
  Filter,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Settings,
  Star,
  Target,
  UserPlus,
  Users,
  X,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { API_URL } from '../constants';

interface ConnectProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
}

interface User {
  _id: string;
  name: string;
  email: string;
  selectedRole: string;
  experienceLevel: string;
  bio?: string;
  photoURL?: string;
  knownSkills: Array<{
    skill: string;
    level: string;
    yearsOfExperience: number;
  }>;
  location?: string;
  connections: number;
  isActive: boolean;
  lastSeen: string;
  matchScore?: number;
  connectionStatus?: 'none' | 'pending' | 'connected' | 'blocked';
}

interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Connection {
  _id: string;
  user: User;
  status: 'pending' | 'connected' | 'blocked';
  createdAt: string;
  lastMessage?: ChatMessage;
}

// Mock users data for UI demonstration
const mockUsers: User[] = [
  {
    _id: 'user1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    selectedRole: 'Frontend Developer',
    experienceLevel: 'Senior (5+ years)',
    bio: 'Passionate frontend developer with expertise in React, Vue, and modern JavaScript. Love creating beautiful, accessible user interfaces. Currently leading a team at a fintech startup.',
    photoURL: undefined,
    knownSkills: [
      { skill: 'React', level: 'Expert', yearsOfExperience: 6 },
      { skill: 'Vue.js', level: 'Advanced', yearsOfExperience: 4 },
      { skill: 'TypeScript', level: 'Advanced', yearsOfExperience: 5 },
      { skill: 'CSS/SCSS', level: 'Expert', yearsOfExperience: 7 },
      { skill: 'JavaScript', level: 'Expert', yearsOfExperience: 8 }
    ],
    location: 'San Francisco, CA',
    connections: 142,
    isActive: true,
    lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    connectionStatus: 'none'
  },
  {
    _id: 'user2',
    name: 'Marcus Rodriguez',
    email: 'marcus.rodriguez@example.com',
    selectedRole: 'Backend Developer',
    experienceLevel: 'Mid-level (3-5 years)',
    bio: 'Backend engineer specializing in Node.js, Python, and cloud architecture. Building scalable APIs and microservices. Always excited about new technologies and best practices.',
    photoURL: undefined,
    knownSkills: [
      { skill: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
      { skill: 'Python', level: 'Advanced', yearsOfExperience: 5 },
      { skill: 'PostgreSQL', level: 'Intermediate', yearsOfExperience: 3 },
      { skill: 'AWS', level: 'Intermediate', yearsOfExperience: 2 },
      { skill: 'Docker', level: 'Advanced', yearsOfExperience: 3 }
    ],
    location: 'Austin, TX',
    connections: 89,
    isActive: true,
    lastSeen: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    connectionStatus: 'none'
  },
  {
    _id: 'user3',
    name: 'Aisha Patel',
    email: 'aisha.patel@example.com',
    selectedRole: 'Data Scientist',
    experienceLevel: 'Senior (5+ years)',
    bio: 'Data scientist with a PhD in Machine Learning. Expert in Python, R, and deep learning. Currently working on NLP projects and computer vision applications.',
    photoURL: undefined,
    knownSkills: [
      { skill: 'Python', level: 'Expert', yearsOfExperience: 7 },
      { skill: 'Machine Learning', level: 'Expert', yearsOfExperience: 6 },
      { skill: 'TensorFlow', level: 'Advanced', yearsOfExperience: 4 },
      { skill: 'R', level: 'Advanced', yearsOfExperience: 5 },
      { skill: 'SQL', level: 'Advanced', yearsOfExperience: 6 }
    ],
    location: 'Boston, MA',
    connections: 203,
    isActive: false,
    lastSeen: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    connectionStatus: 'pending'
  },
  {
    _id: 'user4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    selectedRole: 'Full Stack Developer',
    experienceLevel: 'Mid-level (3-5 years)',
    bio: 'Full-stack developer with experience in MERN stack and mobile development. Love building end-to-end solutions and learning new frameworks.',
    photoURL: undefined,
    knownSkills: [
      { skill: 'React', level: 'Advanced', yearsOfExperience: 4 },
      { skill: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
      { skill: 'MongoDB', level: 'Intermediate', yearsOfExperience: 3 },
      { skill: 'React Native', level: 'Intermediate', yearsOfExperience: 2 },
      { skill: 'GraphQL', level: 'Beginner', yearsOfExperience: 1 }
    ],
    location: 'Seattle, WA',
    connections: 67,
    isActive: true,
    lastSeen: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    connectionStatus: 'connected'
  },
  {
    _id: 'user5',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    selectedRole: 'UI/UX Designer',
    experienceLevel: 'Junior (1-3 years)',
    bio: 'UI/UX designer passionate about creating intuitive and beautiful user experiences. Background in psychology helps me understand user behavior and design accordingly.',
    photoURL: undefined,
    knownSkills: [
      { skill: 'Figma', level: 'Advanced', yearsOfExperience: 3 },
      { skill: 'Adobe XD', level: 'Intermediate', yearsOfExperience: 2 },
      { skill: 'User Research', level: 'Intermediate', yearsOfExperience: 2 },
      { skill: 'Prototyping', level: 'Advanced', yearsOfExperience: 3 },
      { skill: 'CSS', level: 'Beginner', yearsOfExperience: 1 }
    ],
    location: 'New York, NY',
    connections: 45,
    isActive: true,
    lastSeen: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    connectionStatus: 'none'
  },
  {
    _id: 'user6',
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    selectedRole: 'DevOps Engineer',
    experienceLevel: 'Senior (5+ years)',
    bio: 'DevOps engineer with expertise in cloud infrastructure, CI/CD, and containerization. Passionate about automation and helping teams deliver software faster and more reliably.',
    photoURL: undefined,
    knownSkills: [
      { skill: 'AWS', level: 'Expert', yearsOfExperience: 6 },
      { skill: 'Kubernetes', level: 'Advanced', yearsOfExperience: 4 },
      { skill: 'Terraform', level: 'Advanced', yearsOfExperience: 3 },
      { skill: 'Jenkins', level: 'Advanced', yearsOfExperience: 5 },
      { skill: 'Linux', level: 'Expert', yearsOfExperience: 8 }
    ],
    location: 'Denver, CO',
    connections: 178,
    isActive: false,
    lastSeen: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    connectionStatus: 'none'
  },
  {
    _id: 'user7',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    selectedRole: 'Mobile Developer',
    experienceLevel: 'Mid-level (3-5 years)',
    bio: 'iOS and Android developer with a focus on React Native and Flutter. Love creating smooth, performant mobile experiences that users enjoy.',
    photoURL: undefined,
    knownSkills: [
      { skill: 'React Native', level: 'Advanced', yearsOfExperience: 4 },
      { skill: 'Flutter', level: 'Intermediate', yearsOfExperience: 2 },
      { skill: 'Swift', level: 'Advanced', yearsOfExperience: 5 },
      { skill: 'Kotlin', level: 'Intermediate', yearsOfExperience: 3 },
      { skill: 'Firebase', level: 'Advanced', yearsOfExperience: 4 }
    ],
    location: 'Toronto, ON',
    connections: 112,
    isActive: true,
    lastSeen: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
    connectionStatus: 'pending'
  },
  {
    _id: 'user8',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    selectedRole: 'Student',
    experienceLevel: 'Entry level (0-1 years)',
    bio: 'Computer Science student at MIT, graduating in 2025. Interested in web development and AI. Currently working on personal projects and looking for internship opportunities.',
    photoURL: undefined,
    knownSkills: [
      { skill: 'JavaScript', level: 'Intermediate', yearsOfExperience: 2 },
      { skill: 'Python', level: 'Intermediate', yearsOfExperience: 1 },
      { skill: 'HTML/CSS', level: 'Advanced', yearsOfExperience: 3 },
      { skill: 'Git', level: 'Intermediate', yearsOfExperience: 2 },
      { skill: 'React', level: 'Beginner', yearsOfExperience: 1 }
    ],
    location: 'Cambridge, MA',
    connections: 23,
    isActive: true,
    lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    connectionStatus: 'none'
  }
];

// Mock connections data
const mockConnections: Connection[] = [
  {
    _id: 'conn1',
    user: mockUsers[3], // David Kim
    status: 'connected',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    lastMessage: {
      _id: 'msg1',
      sender: 'user4',
      receiver: 'currentUser',
      message: 'Hey! How\'s the new React project going?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true
    }
  },
  {
    _id: 'conn2',
    user: mockUsers[2], // Aisha Patel
    status: 'pending',
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    _id: 'conn3',
    user: mockUsers[6], // Priya Sharma
    status: 'pending',
    createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
  }
];

const Connect: React.FC<ConnectProps> = ({ theme, showToast }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'connections' | 'requests'>('discover');
  
  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    experienceLevel: 'all',
    skills: '',
    location: ''
  });

  // Chat states
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // AI Matching states
  const [aiMatchingVisible, setAiMatchingVisible] = useState(false);
  const [aiMatches, setAiMatches] = useState<User[]>([]);
  const [matchingProgress, setMatchingProgress] = useState(0);

  // Request state to prevent double requests
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const roleIcons = {
    'Frontend Developer': Code,
    'Backend Developer': Briefcase,
    'Full Stack Developer': Target,
    'Mobile Developer': Settings,
    'Data Scientist': Award,
    'DevOps Engineer': Zap,
    'UI/UX Designer': Heart,
    'Student': GraduationCap,
    'Other': Users
  };

  useEffect(() => {
    fetchUsers();
    fetchConnections();
  }, []);

  useEffect(() => {
    if (filters.role !== 'all' || filters.experienceLevel !== 'all' || filters.skills || filters.location || searchQuery) {
      fetchUsers();
    }
  }, [filters, searchQuery]);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Comment out API call and use mock data for demo
      // const queryParams = new URLSearchParams({
      //   page: '1',
      //   limit: '50',
      //   ...(filters.role !== 'all' && { role: filters.role }),
      //   ...(filters.experienceLevel !== 'all' && { experienceLevel: filters.experienceLevel }),
      //   ...(filters.skills && { skills: filters.skills }),
      //   ...(filters.location && { location: filters.location }),
      //   ...(searchQuery && { search: searchQuery })
      // });

      // const response = await fetch(`${API_URL}/users?${queryParams}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   setUsers(data.users || []);
      // } else {
      //   showToast('Failed to fetch users', 'error');
      // }

      // Using mock data for demonstration
      console.log('Using mock users data for demo');
      
      // Apply filters to mock data
      let filteredUsers = [...mockUsers];
      
      if (filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          user.selectedRole.toLowerCase().includes(filters.role.toLowerCase())
        );
      }
      
      if (filters.experienceLevel !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          user.experienceLevel === filters.experienceLevel
        );
      }
      
      if (searchQuery) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.selectedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.knownSkills.some(skill => 
            skill.skill.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
      
      if (filters.skills) {
        filteredUsers = filteredUsers.filter(user => 
          user.knownSkills.some(skill => 
            skill.skill.toLowerCase().includes(filters.skills!.toLowerCase())
          )
        );
      }
      
      if (filters.location) {
        filteredUsers = filteredUsers.filter(user => 
          user.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      setUsers(filteredUsers);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Error loading users', 'error');
      // Fallback to mock data on error
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Comment out API call and use mock data for demo
      // const response = await fetch(`${API_URL}/connections`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   setConnections(data || []);
      // }

      // Using mock connections data for demonstration
      console.log('Using mock connections data for demo');
      setConnections(mockConnections);
      
    } catch (error) {
      console.error('Error fetching connections:', error);
      // Fallback to mock data on error
      setConnections(mockConnections);
    }
  };

  const startAIMatching = async () => {
    setAiMatchingVisible(true);
    setMatchingProgress(0);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Simulate AI matching progress
      const progressInterval = setInterval(() => {
        setMatchingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_URL}/ai-match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      clearInterval(progressInterval);
      setMatchingProgress(100);

      if (response.ok) {
        const data = await response.json();
        setAiMatches(data.matches || []);
        // Keep progress at 100 to show results
      } else {
        showToast('AI matching failed', 'error');
        closeAIMatching();
      }
    } catch (error) {
      console.error('Error in AI matching:', error);
      showToast('AI matching error', 'error');
      closeAIMatching();
    }
  };

  const closeAIMatching = () => {
    setAiMatchingVisible(false);
    setMatchingProgress(0);
    setAiMatches([]);
  };

  const sendConnectionRequest = async (userId: string) => {
    if (sendingRequest === userId) {
      return; // Prevent double requests
    }

    try {
      setSendingRequest(userId);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      console.log('Sending connection request to:', userId);
      console.log('API URL:', `${API_URL}/connect-request`);

      const response = await fetch(`${API_URL}/connect-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        showToast('Connection request sent!');
        // Update the user's connection status in the local state
        setUsers(prevUsers => prevUsers.map(user => 
          user._id === userId 
            ? { ...user, connectionStatus: 'pending' }
            : user
        ));
        fetchConnections();
      } else {
        showToast(responseData.message || 'Failed to send connection request', 'error');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setSendingRequest(null);
    }
  };

  // View Profile Modal state
  const [viewProfileModalVisible, setViewProfileModalVisible] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  const handleViewProfile = (user: User) => {
    setProfileUser(user);
    setViewProfileModalVisible(true);
  };

  const rejectConnectionRequest = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      console.log('Rejecting connection request from:', userId);

      const response = await fetch(`${API_URL}/reject-connection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const responseData = await response.json();
      console.log('Reject response:', responseData);

      if (response.ok) {
        showToast('Connection request rejected');
        fetchConnections();
        fetchUsers(); // Refresh users to update connection status
      } else {
        showToast(responseData.message || 'Failed to reject connection request', 'error');
      }
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      showToast('Network error. Please check your connection.', 'error');
    }
  };

  const acceptConnectionRequest = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      console.log('Accepting connection request from:', userId);

      const response = await fetch(`${API_URL}/accept-connection`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const responseData = await response.json();
      console.log('Accept response:', responseData);

      if (response.ok) {
        showToast('Connection request accepted!');
        fetchConnections();
        fetchUsers(); // Refresh users to update connection status
      } else {
        showToast(responseData.message || 'Failed to accept connection request', 'error');
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
      showToast('Network error. Please check your connection.', 'error');
    }
  };

  const startChat = async (user: User) => {
    setSelectedUser(user);
    setChatModalVisible(true);
    await fetchChatMessages(user._id);
  };

  const fetchChatMessages = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/chat/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          message: newMessage.trim()
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchChatMessages(selectedUser._id);
      } else {
        showToast('Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error sending message', 'error');
    }
  };

  const renderRoleIcon = (role: string) => {
    const IconComponent = roleIcons[role as keyof typeof roleIcons] || Users;
    return <IconComponent size={16} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />;
  };

  const renderUser = ({ item: user }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
          {user.isActive && <View style={styles.activeIndicator} />}
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.matchScore && (
              <View style={styles.matchBadge}>
                <Star size={10} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.matchScore}>{user.matchScore}%</Text>
              </View>
            )}
          </View>
          <View style={styles.userRoleRow}>
            {renderRoleIcon(user.selectedRole)}
            <Text style={styles.userRole}>{user.selectedRole}</Text>
          </View>
          <Text style={styles.userExperience}>{user.experienceLevel}</Text>
          {user.location && (
            <View style={styles.locationRow}>
              <MapPin size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Text style={styles.userLocation}>{user.location}</Text>
            </View>
          )}
        </View>
      </View>

      {user.bio && (
        <Text style={styles.userBio} numberOfLines={2}>{user.bio}</Text>
      )}

      <View style={styles.skillsContainer}>
        {user.knownSkills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill.skill}</Text>
          </View>
        ))}
        {user.knownSkills.length > 3 && (
          <Text style={styles.moreSkills}>+{user.knownSkills.length - 3} more</Text>
        )}
      </View>

      <View style={styles.userActions}>
        {user.connectionStatus === 'connected' ? (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.chatBtn]}
            onPress={() => startChat(user)}
          >
            <MessageCircle size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Chat</Text>
          </TouchableOpacity>
        ) : user.connectionStatus === 'pending' ? (
          <View style={[styles.actionBtn, styles.pendingBtn]}>
            <Clock size={16} color={theme === 'dark' ? '#F59E0B' : '#D97706'} />
            <Text style={[styles.actionBtnText, { color: theme === 'dark' ? '#F59E0B' : '#D97706' }]}>
              Pending
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.actionBtn, 
              styles.connectBtn,
              sendingRequest === user._id && styles.disabledBtn
            ]}
            onPress={() => sendConnectionRequest(user._id)}
            disabled={sendingRequest === user._id}
          >
            <UserPlus size={16} color="#fff" />
            <Text style={styles.actionBtnText}>
              {sendingRequest === user._id ? 'Sending...' : 'Connect'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => handleViewProfile(user)}
        >
          <Text style={[styles.actionBtnText, { color: theme === 'dark' ? '#8B5CF6' : '#EF4444' }]}>
            View Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConnection = ({ item: connection }: { item: Connection }) => (
    <View style={styles.connectionCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {connection.user.name.charAt(0).toUpperCase()}
          </Text>
          {connection.user.isActive && <View style={styles.activeIndicator} />}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{connection.user.name}</Text>
          <View style={styles.userRoleRow}>
            {renderRoleIcon(connection.user.selectedRole)}
            <Text style={styles.userRole}>{connection.user.selectedRole}</Text>
          </View>
          {connection.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {connection.lastMessage.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.connectionActions}>
        {connection.status === 'pending' ? (
          <View style={styles.pendingActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => acceptConnectionRequest(connection.user._id)}
            >
              <CheckCircle size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => rejectConnectionRequest(connection.user._id)}
            >
              <X size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.chatBtn]}
            onPress={() => startChat(connection.user)}
          >
            <MessageCircle size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.aiBtn}
            onPress={startAIMatching}
          >
            <Bot size={20} color="#fff" />
            <Text style={styles.aiBtnText}>AI Match</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            placeholder="Search by name, skills, role..."
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { id: 'discover', label: 'Discover', icon: Users },
          { id: 'connections', label: 'Connected', icon: CheckCircle },
          { id: 'requests', label: 'Requests', icon: Clock }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <IconComponent 
                size={16} 
                color={activeTab === tab.id 
                  ? '#fff' 
                  : (theme === 'dark' ? '#9CA3AF' : '#6B7280')
                } 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === 'discover' ? (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            fetchUsers();
            fetchConnections();
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
              <Text style={styles.emptyStateText}>No users found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={connections.filter(c => 
            activeTab === 'connections' ? c.status === 'connected' : c.status === 'pending'
          )}
          renderItem={renderConnection}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            fetchUsers();
            fetchConnections();
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
              <Text style={styles.emptyStateText}>
                {activeTab === 'connections' ? 'No connections yet' : 'No pending requests'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {activeTab === 'connections' ? 'Start connecting with people to grow your network' : 
                 'No pending connection requests'}
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Users</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={24} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterLabel}>Role</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['all', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'Data Scientist', 'DevOps Engineer', 'UI/UX Designer', 'Student'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.filterChip,
                      filters.role === role && styles.filterChipSelected
                    ]}
                    onPress={() => setFilters({...filters, role})}
                  >
                    {role !== 'all' && (
                      <View style={styles.filterChipIcon}>
                        {renderRoleIcon(role)}
                      </View>
                    )}
                    <Text style={[
                      styles.filterChipText,
                      filters.role === role && styles.filterChipTextSelected
                    ]}>
                      {role === 'all' ? 'All Roles' : role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterLabel}>Experience Level</Text>
              <View style={styles.filterRow}>
                {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.filterOption,
                      filters.experienceLevel === level && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters({...filters, experienceLevel: level})}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.experienceLevel === level && styles.filterOptionTextSelected
                    ]}>
                      {level === 'all' ? 'All' : level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Skills</Text>
              <TextInput
                placeholder="e.g., React, Python, Node.js"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={filters.skills}
                onChangeText={(text) => setFilters({...filters, skills: text})}
                style={styles.filterInput}
              />

              <Text style={styles.filterLabel}>Location</Text>
              <TextInput
                placeholder="e.g., San Francisco, Remote"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={filters.location}
                onChangeText={(text) => setFilters({...filters, location: text})}
                style={styles.filterInput}
              />
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity 
                onPress={() => {
                  setFilters({ role: 'all', experienceLevel: 'all', skills: '', location: '' });
                  setFilterModalVisible(false);
                }} 
                style={styles.resetBtn}
              >
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setFilterModalVisible(false)} 
                style={styles.applyBtn}
              >
                <Text style={styles.applyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Matching Modal */}
      <Modal visible={aiMatchingVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.aiModal}>
            {/* Close button always visible */}
            <TouchableOpacity 
              onPress={closeAIMatching} 
              style={styles.closeButtonTop}
            >
              <X size={24} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>

            {matchingProgress < 100 ? (
              <View style={styles.loadingContainer}>
                <Bot size={48} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
                <Text style={styles.loadingTitle}>AI is finding your perfect matches...</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${matchingProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>{matchingProgress}%</Text>
              </View>
            ) : (
              <View style={styles.matchResults}>
                <Text style={styles.matchTitle}>Perfect Matches Found! 🎯</Text>
                <FlatList
                  data={aiMatches}
                  renderItem={renderUser}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                  style={styles.matchesList}
                />
                <TouchableOpacity 
                  onPress={closeAIMatching} 
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal visible={chatModalVisible} transparent animationType="slide">
        <View style={styles.chatModalOverlay}>
          <View style={styles.chatModal}>
            <View style={styles.chatHeader}>
              <View style={styles.chatUserInfo}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>
                    {selectedUser?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.chatUserName}>{selectedUser?.name}</Text>
                  <Text style={styles.chatUserStatus}>
                    {selectedUser?.isActive ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <X size={24} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chatMessages}
              keyExtractor={(item) => item._id}
              style={styles.chatMessages}
              renderItem={({ item: message }) => (
                <View style={[
                  styles.messageContainer,
                  message.sender === selectedUser?._id ? styles.receivedMessage : styles.sentMessage
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.sender === selectedUser?._id ? styles.receivedMessageText : styles.sentMessageText
                  ]}>
                    {message.message}
                  </Text>
                  <Text style={styles.messageTime}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}
              inverted
            />

            <View style={styles.chatInput}>
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={newMessage}
                onChangeText={setNewMessage}
                style={styles.messageInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <Send size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Profile Modal */}
      <Modal visible={viewProfileModalVisible} transparent animationType="slide">
        <View style={styles.chatModalOverlay}>
          <View style={styles.profileModal}>
            <View style={styles.profileModalHeader}>
              <Text style={styles.profileModalTitle}>Profile</Text>
              <TouchableOpacity onPress={() => setViewProfileModalVisible(false)}>
                <X size={24} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
              </TouchableOpacity>
            </View>

            {profileUser && (
              <ScrollView style={styles.profileModalContent}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>
                      {profileUser.name.charAt(0).toUpperCase()}
                    </Text>
                    {profileUser.isActive && <View style={styles.activeIndicator} />}
                  </View>
                  <Text style={styles.profileName}>{profileUser.name}</Text>
                  <View style={styles.profileRoleRow}>
                    {renderRoleIcon(profileUser.selectedRole)}
                    <Text style={styles.profileRole}>{profileUser.selectedRole}</Text>
                  </View>
                  <Text style={styles.profileExperience}>{profileUser.experienceLevel}</Text>
                  {profileUser.location && (
                    <View style={styles.profileLocationRow}>
                      <MapPin size={14} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                      <Text style={styles.profileLocation}>{profileUser.location}</Text>
                    </View>
                  )}
                </View>

                {/* Bio Section */}
                {profileUser.bio && (
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>About</Text>
                    <Text style={styles.profileBio}>{profileUser.bio}</Text>
                  </View>
                )}

                {/* Skills Section */}
                {profileUser.knownSkills && profileUser.knownSkills.length > 0 && (
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>Skills & Expertise</Text>
                    <View style={styles.profileSkillsGrid}>
                      {profileUser.knownSkills.map((skill, index) => (
                        <View key={index} style={styles.profileSkillChip}>
                          <Text style={styles.profileSkillText}>{skill.skill}</Text>
                          <Text style={styles.profileSkillLevel}>
                            {skill.level} • {skill.yearsOfExperience}yr{skill.yearsOfExperience !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.profileActions}>
                  {profileUser.connectionStatus === 'connected' ? (
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.chatBtn]}
                      onPress={() => {
                        setViewProfileModalVisible(false);
                        startChat(profileUser);
                      }}
                    >
                      <MessageCircle size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Chat</Text>
                    </TouchableOpacity>
                  ) : profileUser.connectionStatus === 'pending' ? (
                    <View style={[styles.actionBtn, styles.pendingBtn]}>
                      <Clock size={16} color={theme === 'dark' ? '#F59E0B' : '#D97706'} />
                      <Text style={[styles.actionBtnText, { color: theme === 'dark' ? '#F59E0B' : '#D97706' }]}>
                        Pending
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.connectBtn]}
                      onPress={() => {
                        sendConnectionRequest(profileUser._id);
                        setViewProfileModalVisible(false);
                      }}
                    >
                      <UserPlus size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Connect</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
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
  aiBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  aiBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontSize: 16,
    paddingVertical: 12,
  },
  filterBtn: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    gap: 6,
  },
  activeTab: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    flex: 1,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#F59E0B20' : '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  matchScore: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  userRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  userRole: {
    fontSize: 13,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  userExperience: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userLocation: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  userBio: {
    fontSize: 13,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  skillChip: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 11,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontStyle: 'italic',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  connectionActions: {
    alignItems: 'flex-end',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  connectBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  disabledBtn: {
    backgroundColor: theme === 'dark' ? '#6B7280' : '#9CA3AF',
    opacity: 0.6,
  },
  chatBtn: {
    backgroundColor: '#10B981',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
  },
  pendingBtn: {
    backgroundColor: theme === 'dark' ? '#F59E0B20' : '#FEF3C7',
  },
  viewBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  lastMessage: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
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
    maxWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  aiModal: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
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
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  filterChipIcon: {
    marginRight: 2,
  },
  filterChipText: {
    fontSize: 12,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  filterOption: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
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
  filterOptionTextSelected: {
    color: '#FFFFFF',
  },
  filterInput: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    textAlign: 'center',
    marginVertical: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  matchResults: {
    maxHeight: '100%',
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  matchesList: {
    maxHeight: 400,
  },
  closeButtonTop: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  closeBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  chatModal: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  chatUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  chatUserStatus: {
    fontSize: 12,
    color: theme === 'dark' ? '#10B981' : '#059669',
  },
  chatMessages: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  messageText: {
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 18,
  },
  receivedMessageText: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    borderBottomLeftRadius: 4,
  },
  sentMessageText: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  messageTime: {
    fontSize: 10,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    borderRadius: 12,
    padding: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    padding: 12,
    borderRadius: 12,
  },
  profileModal: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  profileModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  profileModalContent: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  profileRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  profileRole: {
    fontSize: 16,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  profileExperience: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  profileLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  profileSection: {
    marginBottom: 20,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 16,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    lineHeight: 24,
  },
  profileSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileSkillChip: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  profileSkillText: {
    fontSize: 14,
    color: theme === 'dark' ? '#E5E7EB' : '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  profileSkillLevel: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  profileActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
});

export default Connect;
