import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Award,
  Bell,
  BookOpen,
  CheckCircle,
  Code,
  ExternalLink,
  Github,
  MessageCircle,
  Plus
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../constants';

interface DashboardProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
}

interface CurrentLearning {
  _id: string;
  skill: string;
  level: string;
  progress: number;
  startDate: string;
  targetDate?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  technologies: string[];
  github?: string;
  liveUrl?: string;
  createdAt: string;
}

interface Doubt {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  responses: any[];
  createdAt: string;
}

interface DashboardData {
  user: {
    name: string;
    bio: string;
    selectedRole: string;
    experienceLevel: string;
  };
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalSkills: number;
    currentLearnings: number;
    completedSkills: number;
    openDoubts: number;
    resolvedDoubts: number;
  };
  recentProjects: Project[];
  currentLearnings: CurrentLearning[];
  recentDoubts: Doubt[];
}

const Dashboard: React.FC<DashboardProps> = ({ theme, showToast }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [learningModalVisible, setLearningModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [doubtModalVisible, setDoubtModalVisible] = useState(false);
  
  // Form states
  const [newLearning, setNewLearning] = useState({ skill: '', level: 'beginner', targetDate: '' });
  const [newProject, setNewProject] = useState({ 
    title: '', 
    description: '', 
    status: 'planning',
    technologies: '',
    github: '',
    liveUrl: ''
  });
  const [newDoubt, setNewDoubt] = useState({ 
    title: '', 
    description: '', 
    category: '',
    tags: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        showToast('Failed to fetch dashboard data', 'error');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addCurrentLearning = async () => {
    if (!newLearning.skill.trim()) {
      showToast('Please enter a skill name', 'error');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/current-learning`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLearning),
      });

      if (response.ok) {
        setLearningModalVisible(false);
        setNewLearning({ skill: '', level: 'beginner', targetDate: '' });
        fetchDashboardData();
        showToast('Learning added successfully!');
      } else {
        showToast('Failed to add learning', 'error');
      }
    } catch (error) {
      console.error('Error adding learning:', error);
      showToast('Error adding learning', 'error');
    }
  };

  const addProject = async () => {
    if (!newProject.title.trim() || !newProject.description.trim()) {
      showToast('Please fill in title and description', 'error');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const projectData = {
        ...newProject,
        technologies: newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech)
      };

      const response = await fetch(`${API_URL}/project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        setProjectModalVisible(false);
        setNewProject({ 
          title: '', 
          description: '', 
          status: 'planning',
          technologies: '',
          github: '',
          liveUrl: ''
        });
        fetchDashboardData();
        showToast('Project added successfully!');
      } else {
        showToast('Failed to add project', 'error');
      }
    } catch (error) {
      console.error('Error adding project:', error);
      showToast('Error adding project', 'error');
    }
  };

  const addDoubt = async () => {
    if (!newDoubt.title.trim() || !newDoubt.description.trim() || !newDoubt.category.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const doubtData = {
        ...newDoubt,
        tags: newDoubt.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch(`${API_URL}/doubt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doubtData),
      });

      if (response.ok) {
        setDoubtModalVisible(false);
        setNewDoubt({ 
          title: '', 
          description: '', 
          category: '',
          tags: ''
        });
        fetchDashboardData();
        showToast('Doubt added successfully!');
      } else {
        showToast('Failed to add doubt', 'error');
      }
    } catch (error) {
      console.error('Error adding doubt:', error);
      showToast('Error adding doubt', 'error');
    }
  };

  const updateLearningProgress = async (learningId: string, newProgress: number) => {
    const progress = Math.min(100, Math.max(0, newProgress));
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/current-learning/${learningId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });

      if (response.ok) {
        fetchDashboardData();
        if (progress === 100) {
          showToast('Congratulations! Skill completed!', 'success');
        } else {
          showToast('Progress updated!');
        }
      } else {
        showToast('Failed to update progress', 'error');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      showToast('Error updating progress', 'error');
    }
  };

  if (loading) {
    return (
      <View style={[getStyles(theme).container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={getStyles(theme).greeting}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={[getStyles(theme).container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={getStyles(theme).greeting}>Unable to load dashboard</Text>
      </View>
    );
  }

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {dashboardData.user.name}! 👋</Text>
          <Text style={styles.headerTitle}>Ready to learn today?</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell size={24} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Code size={20} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          <Text style={styles.statNumber}>{dashboardData.stats.totalProjects}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statCard}>
          <BookOpen size={20} color={theme === 'dark' ? '#10B981' : '#059669'} />
          <Text style={styles.statNumber}>{dashboardData.stats.currentLearnings}</Text>
          <Text style={styles.statLabel}>Learning</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={20} color={theme === 'dark' ? '#F59E0B' : '#D97706'} />
          <Text style={styles.statNumber}>{dashboardData.stats.completedSkills}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <MessageCircle size={20} color={theme === 'dark' ? '#EF4444' : '#DC2626'} />
          <Text style={styles.statNumber}>{dashboardData.stats.openDoubts}</Text>
          <Text style={styles.statLabel}>Doubts</Text>
        </View>
      </View>

      {/* Current Learnings Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Learnings</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setLearningModalVisible(true)}
          >
            <Plus size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {dashboardData.currentLearnings.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
            <Text style={styles.emptyStateText}>No current learnings</Text>
            <Text style={styles.emptyStateSubtext}>Add a skill you're learning to track your progress</Text>
          </View>
        ) : (
          dashboardData.currentLearnings.map((learning) => (
            <View key={learning._id} style={styles.learningCard}>
              <View style={styles.learningHeader}>
                <Text style={styles.learningTitle}>{learning.skill}</Text>
                <Text style={styles.learningLevel}>{learning.level}</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${learning.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{learning.progress}%</Text>
              </View>
              <View style={styles.learningActions}>
                <TouchableOpacity 
                  onPress={() => updateLearningProgress(learning._id, learning.progress + 10)}
                  style={styles.progressBtn}
                >
                  <Text style={styles.progressBtnText}>+10%</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => updateLearningProgress(learning._id, 100)}
                  style={[styles.progressBtn, styles.completeBtn]}
                >
                  <CheckCircle size={14} color="#fff" />
                  <Text style={styles.progressBtnText}>Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent Projects Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setProjectModalVisible(true)}
          >
            <Plus size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {dashboardData.recentProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Code size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
            <Text style={styles.emptyStateText}>No projects yet</Text>
            <Text style={styles.emptyStateSubtext}>Create your first project to showcase your work</Text>
          </View>
        ) : (
          dashboardData.recentProjects.map((project) => (
            <View key={project._id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <View style={[
                  styles.statusBadge, 
                  project.status === 'planning' && styles.statusplanning,
                  project.status === 'active' && styles.statusactive,
                  project.status === 'completed' && styles.statuscompleted,
                  project.status === 'on-hold' && styles.statusopen
                ]}>
                  <Text style={styles.statusText}>{project.status}</Text>
                </View>
              </View>
              <Text style={styles.projectDescription}>{project.description}</Text>
              <View style={styles.techStack}>
                {project.technologies.map((tech, index) => (
                  <View key={index} style={styles.techChip}>
                    <Text style={styles.techText}>{tech}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.projectActions}>
                {project.github && (
                  <TouchableOpacity style={styles.linkBtn}>
                    <Github size={14} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
                    <Text style={styles.linkText}>Code</Text>
                  </TouchableOpacity>
                )}
                {project.liveUrl && (
                  <TouchableOpacity style={styles.linkBtn}>
                    <ExternalLink size={14} color={theme === 'dark' ? '#10B981' : '#059669'} />
                    <Text style={styles.linkText}>Live</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent Doubts Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Doubts</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setDoubtModalVisible(true)}
          >
            <Plus size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {dashboardData.recentDoubts.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
            <Text style={styles.emptyStateText}>No doubts yet</Text>
            <Text style={styles.emptyStateSubtext}>Ask questions to get help from the community</Text>
          </View>
        ) : (
          dashboardData.recentDoubts.map((doubt) => (
            <View key={doubt._id} style={styles.doubtCard}>
              <View style={styles.doubtHeader}>
                <Text style={styles.doubtTitle}>{doubt.title}</Text>
                <View style={[styles.statusBadge, doubt.status === 'resolved' ? styles.statuscompleted : styles.statusopen]}>
                  <Text style={styles.statusText}>{doubt.status}</Text>
                </View>
              </View>
              <Text style={styles.doubtDescription} numberOfLines={2}>{doubt.description}</Text>
              <View style={styles.doubtMeta}>
                <Text style={styles.doubtCategory}>{doubt.category}</Text>
                <Text style={styles.doubtResponses}>{doubt.responses.length} responses</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add Learning Modal */}
      <Modal visible={learningModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Learning</Text>
            <TextInput
              placeholder="Skill name (e.g., React, Python)"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newLearning.skill}
              onChangeText={(text) => setNewLearning({...newLearning, skill: text})}
              style={styles.modalInput}
            />
            
            <Text style={styles.inputLabel}>Level</Text>
            <View style={styles.levelSelector}>
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelOption,
                    newLearning.level === level && styles.levelOptionSelected
                  ]}
                  onPress={() => setNewLearning({...newLearning, level: level})}
                >
                  <Text style={[
                    styles.levelOptionText,
                    newLearning.level === level && styles.levelOptionTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setLearningModalVisible(false)} 
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addCurrentLearning} style={styles.saveBtn}>
                <Text style={styles.saveText}>Add Learning</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Project Modal */}
      <Modal visible={projectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Project</Text>
            <TextInput
              placeholder="Project title"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newProject.title}
              onChangeText={(text) => setNewProject({...newProject, title: text})}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Project description"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newProject.description}
              onChangeText={(text) => setNewProject({...newProject, description: text})}
              style={[styles.modalInput, { height: 80 }]}
              multiline
            />
            <TextInput
              placeholder="Technologies (comma separated)"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newProject.technologies}
              onChangeText={(text) => setNewProject({...newProject, technologies: text})}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="GitHub URL (optional)"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newProject.github}
              onChangeText={(text) => setNewProject({...newProject, github: text})}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setProjectModalVisible(false)} 
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addProject} style={styles.saveBtn}>
                <Text style={styles.saveText}>Add Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Doubt Modal */}
      <Modal visible={doubtModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Ask a Question</Text>
            <TextInput
              placeholder="Question title"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newDoubt.title}
              onChangeText={(text) => setNewDoubt({...newDoubt, title: text})}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Describe your question in detail"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newDoubt.description}
              onChangeText={(text) => setNewDoubt({...newDoubt, description: text})}
              style={[styles.modalInput, { height: 100 }]}
              multiline
            />
            <TextInput
              placeholder="Category (e.g., React, Python, etc.)"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newDoubt.category}
              onChangeText={(text) => setNewDoubt({...newDoubt, category: text})}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Tags (comma separated)"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newDoubt.tags}
              onChangeText={(text) => setNewDoubt({...newDoubt, tags: text})}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setDoubtModalVisible(false)} 
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addDoubt} style={styles.saveBtn}>
                <Text style={styles.saveText}>Ask Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  addBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    padding: 8,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
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
  learningCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  learningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  learningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  learningLevel: {
    fontSize: 12,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    minWidth: 35,
  },
  learningActions: {
    flexDirection: 'row',
    gap: 8,
  },
  progressBtn: {
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completeBtn: {
    backgroundColor: '#10B981',
  },
  progressBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  projectCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusplanning: {
    backgroundColor: theme === 'dark' ? '#F59E0B20' : '#FEF3C7',
  },
  statusactive: {
    backgroundColor: theme === 'dark' ? '#10B98120' : '#D1FAE5',
  },
  statuscompleted: {
    backgroundColor: theme === 'dark' ? '#8B5CF620' : '#E0E7FF',
  },
  statusopen: {
    backgroundColor: theme === 'dark' ? '#EF444420' : '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    textTransform: 'capitalize',
  },
  projectDescription: {
    fontSize: 14,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  techChip: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  techText: {
    fontSize: 11,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
  },
  projectActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  doubtCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  doubtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  doubtTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    flex: 1,
    marginRight: 12,
  },
  doubtDescription: {
    fontSize: 14,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  doubtMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doubtCategory: {
    fontSize: 12,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  doubtResponses: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
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
    maxHeight: '80%',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
  },
  levelSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    alignItems: 'center',
  },
  levelOptionSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    textTransform: 'capitalize',
  },
  levelOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
});

export default Dashboard;
