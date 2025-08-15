import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { AlertCircle, Award, Calendar, CheckCircle, Github, Globe, Instagram, Linkedin, LogOut, Moon, Pencil, Plus, Sun, Trash2, Twitter, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Image, Linking, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';

import { API_URL } from '../constants';

const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

interface ProfileProps {
  theme?: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
  toggleTheme: () => void;
  onLogout?: () => void;
}

// Custom Toast Component for Cross-Platform Support
const CustomToast: React.FC<{
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
  theme: 'dark' | 'light';
  onHide: () => void;
}> = ({ visible, message, type = 'success', theme, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[
      getStyles(theme).toast, 
      { 
        opacity: fadeAnim,
        borderLeftColor: type === 'success' ? '#10B981' : '#EF4444'
      }
    ]}>
      {type === 'success' ? <CheckCircle size={16} color="#10B981" /> : <AlertCircle size={16} color="#EF4444" />}
      <Text style={getStyles(theme).toastText}>{message}</Text>
    </Animated.View>
  );
};

export default function Profile({ theme = 'dark', showToast, toggleTheme }: ProfileProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('Passionate developer crafting digital experiences with cutting-edge technologies');
  const [editingBio, setEditingBio] = useState(false);
  const [skills, setSkills] = useState(['React Native', 'Firebase', 'Node.js', 'TypeScript']);
  const [newSkill, setNewSkill] = useState('');
  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [projects, setProjects] = useState([
    {
      id: '1',
      title: 'SkillChain',
      description: 'Revolutionary mutual skill-sharing platform with real-time matching',
      github: 'https://github.com/yourrepo/skillchain',
      live: 'https://skillchain.app'
    },
  ]);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', github: '', live: '' });
  
  // Social media state
  const [socialProfiles, setSocialProfiles] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    website: ''
  });
  const [socialModalVisible, setSocialModalVisible] = useState(false);
  const [socialType, setSocialType] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  
  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/Auth');
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Update local state with fetched data
        if (userData.bio) setBio(userData.bio);
        if (userData.knownSkills) {
          const skillNames = userData.knownSkills.map((skill: any) => skill.skill);
          setSkills(skillNames);
        }
        if (userData.projects) setProjects(userData.projects);
        if (userData.socialProfiles) {
          setSocialProfiles({
            github: userData.socialProfiles.github || '',
            linkedin: userData.socialProfiles.linkedin || '',
            twitter: userData.socialProfiles.twitter || '',
            instagram: userData.socialProfiles.instagram || '',
            website: userData.socialProfiles.website || ''
          });
        }
      } else {
        handleShowToast('Failed to fetch user data', 'error');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      handleShowToast('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['token', 'user']);
              handleShowToast('Logged out successfully');
              router.replace('/Auth');
            } catch (error) {
              console.error('Error during logout:', error);
              handleShowToast('Error during logout', 'error');
            }
          },
        },
      ]
    );
  };

  const handleShowToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (showToast) {
      showToast(message, type);
    } else if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      setToast({ visible: true, message, type });
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) {
      handleShowToast('Please enter a skill', 'error');
      return;
    }
    if (skills.includes(newSkill.trim())) {
      handleShowToast('Skill already exists', 'error');
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
    setSkillModalVisible(false);
    handleShowToast('Skill added successfully!');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
    handleShowToast('Skill removed');
  };

  const addProject = () => {
    if (!newProject.title || !newProject.description || !newProject.github) {
      handleShowToast('Please fill all required fields', 'error');
      return;
    }
    setProjects([...projects, { ...newProject, id: Date.now().toString() }]);
    setNewProject({ title: '', description: '', github: '', live: '' });
    setProjectModalVisible(false);
    handleShowToast('Project added successfully!');
  };

  const handleSocialPlatform = (platform: string, currentUrl?: string) => {
    setSocialType(platform.toLowerCase());
    setSocialUrl(currentUrl || '');
    setSocialModalVisible(true);
  };

  const handleRemoveSocial = async (platform: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/social-profiles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          [platform]: '', // Empty string removes the profile
        }),
      });

      if (response.ok) {
        setSocialProfiles(prev => ({ ...prev, [platform]: '' }));
        handleShowToast(`${platform} profile removed`);
      }
    } catch (error) {
      handleShowToast('Failed to remove social profile', 'error');
    }
  };

  const saveSocialProfile = async () => {
    if (!socialUrl.trim()) {
      handleShowToast('Please enter a URL', 'error');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/social-profiles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          [socialType]: socialUrl,
        }),
      });

      if (response.ok) {
        setSocialProfiles(prev => ({ ...prev, [socialType]: socialUrl }));
        setSocialModalVisible(false);
        setSocialUrl('');
        setSocialType('');
        handleShowToast(`${socialType} profile updated!`);
      } else {
        handleShowToast('Failed to update social profile', 'error');
      }
    } catch (error) {
      handleShowToast('Failed to update social profile', 'error');
    }
  };

  const updateBio = async (newBio: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio: newBio }),
      });

      if (response.ok) {
        setBio(newBio);
        handleShowToast('Bio updated successfully!');
      } else {
        handleShowToast('Failed to update bio', 'error');
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      handleShowToast('Error updating bio', 'error');
    }
  };

  const updateSocialProfile = async (platform: keyof typeof socialProfiles, value: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      const updateData = { [platform]: value };
      
      const response = await fetch(`${API_URL}/social-profiles`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSocialProfiles(prev => ({ ...prev, [platform]: value }));
        handleShowToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} updated successfully!`);
      } else {
        handleShowToast(`Failed to update ${platform}`, 'error');
      }
    } catch (error) {
      console.error(`Error updating ${platform}:`, error);
      handleShowToast(`Error updating ${platform}`, 'error');
    }
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Theme Toggle Button */}
      <TouchableOpacity 
        style={styles.themeToggle}
        onPress={toggleTheme}
      >
        {theme === 'dark' ? 
          <Sun size={20} color="#F59E0B" /> : 
          <Moon size={20} color="#8B5CF6" />
        }
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <>
      {/* Hero Profile Section */}
      <View style={styles.heroSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
          <View style={styles.statusDot} />
        </View>
        <Text style={styles.name}>{user?.name || 'Loading...'}</Text>
        <Text style={styles.title}>{user?.selectedRole || user?.customRole || 'Developer'}</Text>
        <View style={styles.locationRow}>
          <Calendar size={14} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          <Text style={styles.joinDate}>
            Joined {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2023'}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{projects?.length || 0}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{skills?.length || 0}</Text>
          <Text style={styles.statLabel}>Skills</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.experienceLevel || 'N/A'}</Text>
          <Text style={styles.statLabel}>Experience</Text>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>About</Text>
          <TouchableOpacity onPress={() => setEditingBio(true)} style={styles.editBtn}>
            <Pencil size={16} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          </TouchableOpacity>
        </View>
        {editingBio ? (
          <TextInput
            value={bio}
            onChangeText={setBio}
            maxLength={200}
            style={styles.bioInput}
            onBlur={() => {
              setEditingBio(false);
              if (bio !== user?.bio) {
                updateBio(bio);
              }
            }}
            multiline
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
          />
        ) : (
          <Text style={styles.bioText}>{bio}</Text>
        )}
      </View>

      {/* Skills Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Skills & Expertise</Text>
          <TouchableOpacity onPress={() => setSkillModalVisible(true)} style={styles.addBtn}>
            <Plus size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.skillGrid}>
          {skills.map((skill, index) => (
            <TouchableOpacity key={index} onPress={() => removeSkill(skill)} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
              <Trash2 size={12} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} style={{marginLeft: 8}} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Social Media Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Social Profiles</Text>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialPlatform('LinkedIn', socialProfiles.linkedin)}
          >
            <Linkedin size={20} color={socialProfiles.linkedin ? (theme === 'dark' ? '#8B5CF6' : '#EF4444') : '#666'} />
            <Text style={[styles.socialText, !socialProfiles.linkedin && styles.placeholderText]}>
              {socialProfiles.linkedin ? 'LinkedIn' : 'Add LinkedIn'}
            </Text>
            {socialProfiles.linkedin && (
              <TouchableOpacity 
                onPress={() => handleRemoveSocial('linkedin')}
                style={styles.removeBtn}
              >
                <X size={14} color="#ff4444" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialPlatform('GitHub', socialProfiles.github)}
          >
            <Github size={20} color={socialProfiles.github ? (theme === 'dark' ? '#8B5CF6' : '#EF4444') : '#666'} />
            <Text style={[styles.socialText, !socialProfiles.github && styles.placeholderText]}>
              {socialProfiles.github ? 'GitHub' : 'Add GitHub'}
            </Text>
            {socialProfiles.github && (
              <TouchableOpacity 
                onPress={() => handleRemoveSocial('github')}
                style={styles.removeBtn}
              >
                <X size={14} color="#ff4444" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialPlatform('Instagram', socialProfiles.instagram)}
          >
            <Instagram size={20} color={socialProfiles.instagram ? (theme === 'dark' ? '#8B5CF6' : '#EF4444') : '#666'} />
            <Text style={[styles.socialText, !socialProfiles.instagram && styles.placeholderText]}>
              {socialProfiles.instagram ? 'Instagram' : 'Add Instagram'}
            </Text>
            {socialProfiles.instagram && (
              <TouchableOpacity 
                onPress={() => handleRemoveSocial('instagram')}
                style={styles.removeBtn}
              >
                <X size={14} color="#ff4444" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialPlatform('Twitter', socialProfiles.twitter)}
          >
            <Twitter size={20} color={socialProfiles.twitter ? (theme === 'dark' ? '#8B5CF6' : '#EF4444') : '#666'} />
            <Text style={[styles.socialText, !socialProfiles.twitter && styles.placeholderText]}>
              {socialProfiles.twitter ? 'Twitter' : 'Add Twitter'}
            </Text>
            {socialProfiles.twitter && (
              <TouchableOpacity 
                onPress={() => handleRemoveSocial('twitter')}
                style={styles.removeBtn}
              >
                <X size={14} color="#ff4444" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialPlatform('Website', socialProfiles.website)}
          >
            <Globe size={20} color={socialProfiles.website ? (theme === 'dark' ? '#8B5CF6' : '#EF4444') : '#666'} />
            <Text style={[styles.socialText, !socialProfiles.website && styles.placeholderText]}>
              {socialProfiles.website ? 'Website' : 'Add Website'}
            </Text>
            {socialProfiles.website && (
              <TouchableOpacity 
                onPress={() => handleRemoveSocial('website')}
                style={styles.removeBtn}
              >
                <X size={14} color="#ff4444" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Projects Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Featured Projects</Text>
          <TouchableOpacity onPress={() => setProjectModalVisible(true)} style={styles.addBtn}>
            <Plus size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        {projects.map(project => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <Award size={20} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
              <Text style={styles.projectTitle}>{project.title}</Text>
            </View>
            <Text style={styles.projectDescription}>{project.description}</Text>
            <View style={styles.projectLinks}>
              <TouchableOpacity onPress={() => Linking.openURL(project.github)} style={styles.linkBtn}>
                <Github size={16} color="#fff" />
                <Text style={styles.linkText}>Code</Text>
              </TouchableOpacity>
              {project.live && (
                <TouchableOpacity onPress={() => Linking.openURL(project.live)} style={[styles.linkBtn, styles.liveBtn]}>
                  <Globe size={16} color="#fff" />
                  <Text style={styles.linkText}>Live</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Logout Section */}
      <View style={styles.card}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <Modal visible={skillModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Skill</Text>
            <TextInput
              placeholder="e.g., React, Python, Design..."
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newSkill}
              onChangeText={setNewSkill}
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setSkillModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addSkill} style={styles.saveBtn}>
                <Text style={styles.saveText}>Add Skill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={projectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Project</Text>
            <TextInput 
              placeholder="Project Title" 
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newProject.title} 
              onChangeText={text => setNewProject({ ...newProject, title: text })} 
              style={styles.modalInput} 
            />
            <TextInput 
              placeholder="Project Description" 
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newProject.description} 
              onChangeText={text => setNewProject({ ...newProject, description: text })} 
              style={styles.modalInput} 
              multiline 
            />
            <TextInput 
              placeholder="GitHub Repository URL" 
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newProject.github} 
              onChangeText={text => setNewProject({ ...newProject, github: text })} 
              style={styles.modalInput} 
            />
            <TextInput 
              placeholder="Live Demo URL (Optional)" 
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newProject.live} 
              onChangeText={text => setNewProject({ ...newProject, live: text })} 
              style={styles.modalInput} 
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setProjectModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addProject} style={styles.saveBtn}>
                <Text style={styles.saveText}>Add Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={socialModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add {socialType.charAt(0).toUpperCase() + socialType.slice(1)} Profile</Text>
            <TextInput 
              placeholder={`Enter your ${socialType} URL`}
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={socialUrl} 
              onChangeText={setSocialUrl}
              style={styles.modalInput}
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setSocialModalVisible(false)} 
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveSocialProfile} style={styles.saveBtn}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Toast for Web */}
      <CustomToast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type}
        theme={theme}
        onHide={() => setToast({ ...toast, visible: false })} 
      />
      </>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind bottom navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontSize: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: theme === 'dark' ? '#fff' : '#E5E7EB',
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: theme === 'dark' ? '#fff' : '#E5E7EB',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: theme === 'dark' ? '#fff' : '#111827',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: theme === 'dark' ? '#E5E7EB' : '#6B7280',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinDate: {
    color: theme === 'dark' ? '#E5E7EB' : '#6B7280',
    fontSize: 14,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: -20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  editBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
  },
  addBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    padding: 8,
    borderRadius: 8,
  },
  bioText: {
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontSize: 16,
    lineHeight: 24,
  },
  bioInput: {
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontSize: 16,
    borderBottomWidth: 2,
    borderColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingBottom: 8,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
  },
  skillText: {
    color: theme === 'dark' ? '#E5E7EB' : '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  projectCard: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginLeft: 8,
  },
  projectDescription: {
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  projectLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  linkBtn: {
    flexDirection: 'row',
    backgroundColor: theme === 'dark' ? '#4B5563' : '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  liveBtn: {
    backgroundColor: '#10B981',
  },
  linkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
  },
  toastText: {
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  socialItem: {
    marginBottom: 16,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  socialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  socialInput: {
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
  },
  socialValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  socialText: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  placeholderText: {
    fontSize: 14,
    color: theme === 'dark' ? '#6B7280' : '#9CA3AF',
    fontStyle: 'italic',
  },
  socialContainer: {
    paddingVertical: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  removeBtn: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
});