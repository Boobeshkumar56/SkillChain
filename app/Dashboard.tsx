import {
    Award,
    Bell,
    BookOpen, Code,
    Eye,
    Lightbulb,
    MessageCircle,
    Plus,
    TrendingUp,
    Users
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DashboardProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
}

interface Learning {
  id: number;
  title: string;
  progress: number;
  category: string;
}

interface Project {
  id: number;
  title: string;
  status: string;
  tech: string[];
  completion: number;
}

interface Doubt {
  id: number;
  question: string;
  category: string;
  answers: number;
  views: number;
}

const Dashboard: React.FC<DashboardProps> = ({ theme, showToast }) => {
  const [currentLearnings, setCurrentLearnings] = useState<Learning[]>([
    { id: 1, title: 'Advanced React Hooks', progress: 75, category: 'Frontend' },
    { id: 2, title: 'Node.js Microservices', progress: 45, category: 'Backend' },
    { id: 3, title: 'AWS Cloud Architecture', progress: 60, category: 'Cloud' }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { id: 1, title: 'E-commerce Platform', status: 'In Progress', tech: ['React', 'Node.js'], completion: 80 },
    { id: 2, title: 'Mobile Chat App', status: 'Planning', tech: ['React Native', 'Firebase'], completion: 15 }
  ]);

  const [doubts, setDoubts] = useState<Doubt[]>([
    { id: 1, question: 'How to optimize React performance?', category: 'React', answers: 3, views: 45 },
    { id: 2, question: 'Best practices for API design?', category: 'Backend', answers: 7, views: 89 }
  ]);

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning! 👋</Text>
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
          <TrendingUp size={24} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Skills Learning</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={24} color={theme === 'dark' ? '#10B981' : '#F59E0B'} />
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Users size={24} color={theme === 'dark' ? '#F59E0B' : '#10B981'} />
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
      </View>

      {/* Current Learnings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Learnings</Text>
          <TouchableOpacity onPress={() => showToast('Add new learning', 'success')}>
            <Plus size={20} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          </TouchableOpacity>
        </View>
        {currentLearnings.map(learning => (
          <View key={learning.id} style={styles.learningCard}>
            <View style={styles.learningHeader}>
              <BookOpen size={20} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
              <View style={styles.learningInfo}>
                <Text style={styles.learningTitle}>{learning.title}</Text>
                <Text style={styles.learningCategory}>{learning.category}</Text>
              </View>
              <Text style={styles.progressText}>{learning.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${learning.progress}%`,
                backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444'
              }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Active Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Projects</Text>
          <TouchableOpacity onPress={() => showToast('Add new project', 'success')}>
            <Plus size={20} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          </TouchableOpacity>
        </View>
        {projects.map(project => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <Code size={20} color={theme === 'dark' ? '#10B981' : '#F59E0B'} />
              <View style={styles.projectInfo}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectStatus}>{project.status}</Text>
              </View>
              <View style={styles.projectCompletion}>
                <Text style={styles.completionText}>{project.completion}%</Text>
              </View>
            </View>
            <View style={styles.techStack}>
              {project.tech.map((tech, index) => (
                <View key={index} style={styles.techTag}>
                  <Text style={styles.techText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Recent Doubts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Doubts</Text>
          <TouchableOpacity onPress={() => showToast('Ask new question', 'success')}>
            <Plus size={20} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          </TouchableOpacity>
        </View>
        {doubts.map(doubt => (
          <View key={doubt.id} style={styles.doubtCard}>
            <View style={styles.doubtHeader}>
              <Lightbulb size={18} color={theme === 'dark' ? '#F59E0B' : '#10B981'} />
              <Text style={styles.doubtCategory}>{doubt.category}</Text>
            </View>
            <Text style={styles.doubtQuestion}>{doubt.question}</Text>
            <View style={styles.doubtStats}>
              <View style={styles.doubtStat}>
                <MessageCircle size={14} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={styles.doubtStatText}>{doubt.answers} answers</Text>
              </View>
              <View style={styles.doubtStat}>
                <Eye size={14} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={styles.doubtStatText}>{doubt.views} views</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
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
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme === 'dark' ? '#EF4444' : '#10B981',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  learningCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  learningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  learningInfo: {
    flex: 1,
    marginLeft: 12,
  },
  learningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  learningCategory: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  progressBar: {
    height: 6,
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  projectCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  projectStatus: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  projectCompletion: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme === 'dark' ? '#10B981' : '#059669',
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techTag: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  techText: {
    fontSize: 12,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
  },
  doubtCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doubtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  doubtCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: theme === 'dark' ? '#F59E0B' : '#10B981',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doubtQuestion: {
    fontSize: 14,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 12,
    lineHeight: 20,
  },
  doubtStats: {
    flexDirection: 'row',
    gap: 16,
  },
  doubtStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doubtStatText: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
});

export default Dashboard;