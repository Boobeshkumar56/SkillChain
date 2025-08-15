import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Bot,
    Camera,
    FileVideo,
    Play,
    Plus,
    Upload,
    Video,
    X
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

interface VideoUploadProps {
  theme: 'dark' | 'light';
  showToast: (message: string, type?: 'success' | 'error') => void;
}

interface VideoContent {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  thumbnailUrl?: string;
  videoUrl?: string;
  tags: string[];
  educator: {
    _id: string;
    name: string;
    selectedRole: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  aiAnalysis?: {
    complexity: number;
    suggestedTokens: number;
    feedback: string;
  };
  uploadedAt: string;
  approvedAt?: string;
  views: number;
  likes: number;
}

// Mock video content data for educator's uploaded videos
const mockEducatorVideos: VideoContent[] = [
  {
    _id: 'video1',
    title: 'React Hooks Deep Dive',
    description: 'Complete guide to React Hooks including useState, useEffect, useContext, and custom hooks. Learn how to build modern React applications with functional components.',
    category: 'Frontend Development',
    difficulty: 'intermediate',
    duration: 45,
    thumbnailUrl: undefined,
    videoUrl: undefined,
    tags: ['React', 'JavaScript', 'Hooks', 'Frontend'],
    educator: {
      _id: 'educator1',
      name: 'Sarah Chen',
      selectedRole: 'Frontend Developer'
    },
    status: 'approved',
    aiAnalysis: {
      complexity: 7,
      suggestedTokens: 850,
      feedback: 'Excellent comprehensive coverage of React Hooks. Good pacing and clear examples. Suitable for intermediate developers with basic React knowledge.'
    },
    uploadedAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    approvedAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
    views: 1247,
    likes: 89
  },
  {
    _id: 'video2',
    title: 'TypeScript for Beginners',
    description: 'Learn TypeScript fundamentals including types, interfaces, generics, and how to integrate TypeScript with your JavaScript projects.',
    category: 'Programming Languages',
    difficulty: 'beginner',
    duration: 30,
    thumbnailUrl: undefined,
    videoUrl: undefined,
    tags: ['TypeScript', 'JavaScript', 'Programming', 'Types'],
    educator: {
      _id: 'educator1',
      name: 'Sarah Chen',
      selectedRole: 'Frontend Developer'
    },
    status: 'pending',
    aiAnalysis: {
      complexity: 4,
      suggestedTokens: 500,
      feedback: 'Good introduction to TypeScript. Clear explanations and practical examples. Perfect for beginners transitioning from JavaScript.'
    },
    uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    views: 0,
    likes: 0
  },
  {
    _id: 'video3',
    title: 'Advanced CSS Grid Layouts',
    description: 'Master CSS Grid with advanced layout techniques, responsive design patterns, and real-world examples. Build complex layouts with ease.',
    category: 'Web Design',
    difficulty: 'advanced',
    duration: 60,
    thumbnailUrl: undefined,
    videoUrl: undefined,
    tags: ['CSS', 'Grid', 'Layout', 'Responsive'],
    educator: {
      _id: 'educator1',
      name: 'Sarah Chen',
      selectedRole: 'Frontend Developer'
    },
    status: 'approved',
    aiAnalysis: {
      complexity: 9,
      suggestedTokens: 1200,
      feedback: 'Exceptional deep dive into CSS Grid. Advanced concepts explained clearly with practical examples. Highly valuable for experienced developers.'
    },
    uploadedAt: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
    approvedAt: new Date(Date.now() - 1123200000).toISOString(), // 13 days ago
    views: 892,
    likes: 67
  },
  {
    _id: 'video4',
    title: 'Building REST APIs with Node.js',
    description: 'Learn to build scalable REST APIs using Node.js, Express, and MongoDB. Covers authentication, validation, error handling, and best practices.',
    category: 'Backend Development',
    difficulty: 'intermediate',
    duration: 75,
    thumbnailUrl: undefined,
    videoUrl: undefined,
    tags: ['Node.js', 'Express', 'API', 'Backend', 'MongoDB'],
    educator: {
      _id: 'educator1',
      name: 'Sarah Chen',
      selectedRole: 'Frontend Developer'
    },
    status: 'rejected',
    aiAnalysis: {
      complexity: 6,
      suggestedTokens: 750,
      feedback: 'Good content but some sections need clarification. Consider breaking into smaller segments and adding more error handling examples.'
    },
    uploadedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    views: 0,
    likes: 0
  },
  {
    _id: 'video5',
    title: 'React Native Mobile Development',
    description: 'Complete guide to building mobile apps with React Native. Covers navigation, state management, native modules, and deployment.',
    category: 'Mobile Development',
    difficulty: 'intermediate',
    duration: 90,
    thumbnailUrl: undefined,
    videoUrl: undefined,
    tags: ['React Native', 'Mobile', 'JavaScript', 'Cross-platform'],
    educator: {
      _id: 'educator1',
      name: 'Sarah Chen',
      selectedRole: 'Frontend Developer'
    },
    status: 'pending',
    aiAnalysis: {
      complexity: 8,
      suggestedTokens: 1000,
      feedback: 'Comprehensive mobile development course. Well-structured content with good progression from basics to advanced topics.'
    },
    uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    views: 0,
    likes: 0
  }
];

const VideoUpload: React.FC<VideoUploadProps> = ({ theme, showToast }) => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  
  // Upload form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimatedDuration: '',
    tags: '',
    videoFile: null as any
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'UI/UX Design',
    'Programming Fundamentals',
    'Database Management',
    'Cybersecurity',
    'Other'
  ];

  useEffect(() => {
    fetchUserVideos();
  }, []);

  const fetchUserVideos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Comment out API call and use mock data for demo
      // const response = await fetch(`${API_URL}/educator/videos`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   setVideos(data.videos || []);
      // } else {
      //   showToast('Failed to fetch videos', 'error');
      // }

      // Using mock data for demonstration
      console.log('Using mock educator videos data for demo');
      setVideos(mockEducatorVideos);
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      showToast('Error loading videos', 'error');
      // Fallback to mock data on error
      setVideos(mockEducatorVideos);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Prepare form data for upload
      const uploadData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        estimatedDuration: parseInt(formData.estimatedDuration) || 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch(`${API_URL}/educator/upload-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        
        // Start AI analysis
        setAiAnalyzing(true);
        await simulateAiAnalysis(data.video._id);
        
        showToast('Video uploaded successfully!', 'success');
        setUploadModalVisible(false);
        resetForm();
        fetchUserVideos();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to upload video', 'error');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setAiAnalyzing(false);
    }
  };

  const simulateAiAnalysis = async (videoId: string) => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/educator/analyze-video/${videoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showToast('AI analysis complete!', 'success');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      estimatedDuration: '',
      tags: '',
      videoFile: null
    });
  };

  const handleVideoPreview = (video: VideoContent) => {
    setSelectedVideo(video);
    setPreviewModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return theme === 'dark' ? '#9CA3AF' : '#6B7280';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return theme === 'dark' ? '#9CA3AF' : '#6B7280';
    }
  };

  const renderVideoCard = ({ item: video }: { item: VideoContent }) => (
    <TouchableOpacity 
      style={styles.videoCard}
      onPress={() => handleVideoPreview(video)}
    >
      <View style={styles.videoThumbnail}>
        <Video size={40} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}min</Text>
        </View>
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.videoDescription} numberOfLines={3}>{video.description}</Text>
        
        <View style={styles.videoMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(video.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(video.difficulty) }]}>
              {video.difficulty}
            </Text>
          </View>
          <Text style={styles.categoryText}>{video.category}</Text>
        </View>

        <View style={styles.videoStats}>
          <View style={styles.statItem}>
            <Play size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Text style={styles.statText}>{video.views} views</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(video.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(video.status) }]}>
              {video.status}
            </Text>
          </View>
        </View>

        {video.aiAnalysis && (
          <View style={styles.aiAnalysis}>
            <Bot size={12} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
            <Text style={styles.aiText}>
              Complexity: {video.aiAnalysis.complexity}/10 • Tokens: {video.aiAnalysis.suggestedTokens}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Video Content</Text>
        <TouchableOpacity 
          style={styles.uploadBtn}
          onPress={() => setUploadModalVisible(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.uploadBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* AI Info Banner */}
      <View style={styles.aiInfoBanner}>
        <Bot size={24} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
        <View style={styles.aiInfoContent}>
          <Text style={styles.aiInfoTitle}>AI-Powered Content Analysis</Text>
          <Text style={styles.aiInfoText}>
            Our AI analyzes your videos for complexity, educational value, and suggests token rewards
          </Text>
        </View>
      </View>

      {/* Videos List */}
      <FlatList
        data={videos}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchUserVideos}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileVideo size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
            <Text style={styles.emptyStateText}>No videos uploaded yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start creating educational content and earn tokens!
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateBtn}
              onPress={() => setUploadModalVisible(true)}
            >
              <Text style={styles.emptyStateBtnText}>Upload Your First Video</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Upload Modal */}
      <Modal visible={uploadModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Video Content</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <X size={24} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Video File Selection */}
              <View style={styles.fileSelection}>
                <TouchableOpacity style={styles.fileSelectBtn}>
                  <Camera size={24} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
                  <Text style={styles.fileSelectText}>Select Video File</Text>
                  <Text style={styles.fileSelectSubtext}>MP4, MOV, AVI (Max 500MB)</Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  placeholder="Enter video title"
                  placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={formData.title}
                  onChangeText={(text) => setFormData({...formData, title: text})}
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  placeholder="Describe what students will learn"
                  placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        formData.category === category && styles.categoryChipSelected
                      ]}
                      onPress={() => setFormData({...formData, category})}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        formData.category === category && styles.categoryChipTextSelected
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Difficulty Level</Text>
                <View style={styles.difficultyOptions}>
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.difficultyOption,
                        formData.difficulty === level && styles.difficultyOptionSelected
                      ]}
                      onPress={() => setFormData({...formData, difficulty: level as any})}
                    >
                      <Text style={[
                        styles.difficultyOptionText,
                        formData.difficulty === level && styles.difficultyOptionTextSelected
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Estimated Duration (minutes)</Text>
                <TextInput
                  placeholder="e.g., 15"
                  placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={formData.estimatedDuration}
                  onChangeText={(text) => setFormData({...formData, estimatedDuration: text})}
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tags (comma separated)</Text>
                <TextInput
                  placeholder="react, javascript, tutorial"
                  placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={formData.tags}
                  onChangeText={(text) => setFormData({...formData, tags: text})}
                  style={styles.input}
                />
              </View>
            </ScrollView>

            {/* Upload Progress */}
            {isUploading && (
              <View style={styles.uploadProgress}>
                <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
              </View>
            )}

            {/* AI Analysis Progress */}
            {aiAnalyzing && (
              <View style={styles.aiAnalysisProgress}>
                <Bot size={20} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
                <Text style={styles.aiAnalysisText}>AI is analyzing your content...</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setUploadModalVisible(false)} 
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleVideoUpload} 
                style={[styles.uploadActionBtn, isUploading && styles.disabledBtn]}
                disabled={isUploading}
              >
                <Upload size={16} color="#fff" />
                <Text style={styles.uploadActionText}>
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Preview Modal */}
      <Modal visible={previewModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.previewModal}>
            {selectedVideo && (
              <>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>{selectedVideo.title}</Text>
                  <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                    <X size={24} color={theme === 'dark' ? '#F9FAFB' : '#111827'} />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.previewVideoContainer}>
                    <Video size={60} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
                    <Text style={styles.previewVideoText}>Video Preview</Text>
                  </View>

                  <View style={styles.previewContent}>
                    <Text style={styles.previewDescription}>{selectedVideo.description}</Text>
                    
                    <View style={styles.previewMeta}>
                      <View style={styles.previewMetaRow}>
                        <Text style={styles.previewMetaLabel}>Category:</Text>
                        <Text style={styles.previewMetaValue}>{selectedVideo.category}</Text>
                      </View>
                      <View style={styles.previewMetaRow}>
                        <Text style={styles.previewMetaLabel}>Difficulty:</Text>
                        <Text style={[styles.previewMetaValue, { color: getDifficultyColor(selectedVideo.difficulty) }]}>
                          {selectedVideo.difficulty}
                        </Text>
                      </View>
                      <View style={styles.previewMetaRow}>
                        <Text style={styles.previewMetaLabel}>Duration:</Text>
                        <Text style={styles.previewMetaValue}>{selectedVideo.duration} minutes</Text>
                      </View>
                      <View style={styles.previewMetaRow}>
                        <Text style={styles.previewMetaLabel}>Status:</Text>
                        <Text style={[styles.previewMetaValue, { color: getStatusColor(selectedVideo.status) }]}>
                          {selectedVideo.status}
                        </Text>
                      </View>
                    </View>

                    {selectedVideo.aiAnalysis && (
                      <View style={styles.previewAiAnalysis}>
                        <Text style={styles.previewAiTitle}>AI Analysis</Text>
                        <Text style={styles.previewAiFeedback}>{selectedVideo.aiAnalysis.feedback}</Text>
                        <View style={styles.previewAiStats}>
                          <Text style={styles.previewAiStat}>
                            Complexity Score: {selectedVideo.aiAnalysis.complexity}/10
                          </Text>
                          <Text style={styles.previewAiStat}>
                            Suggested Tokens: {selectedVideo.aiAnalysis.suggestedTokens}
                          </Text>
                        </View>
                      </View>
                    )}

                    {selectedVideo.tags.length > 0 && (
                      <View style={styles.previewTags}>
                        <Text style={styles.previewTagsTitle}>Tags</Text>
                        <View style={styles.tagContainer}>
                          {selectedVideo.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </>
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
  uploadBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  aiInfoBanner: {
    flexDirection: 'row',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  aiInfoContent: {
    flex: 1,
  },
  aiInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 4,
  },
  aiInfoText: {
    fontSize: 13,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  videoCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoThumbnail: {
    height: 120,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  videoInfo: {
    gap: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  videoDescription: {
    fontSize: 13,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    lineHeight: 18,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryText: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  aiAnalysis: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  aiText: {
    fontSize: 11,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
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
    maxWidth: 250,
    marginBottom: 20,
  },
  emptyStateBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  uploadModal: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  previewModal: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
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
  fileSelection: {
    marginBottom: 20,
  },
  fileSelectBtn: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
    borderStyle: 'dashed',
  },
  fileSelectText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  fileSelectSubtext: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  categoryChipText: {
    fontSize: 12,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  difficultyOptionSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  difficultyOptionText: {
    fontSize: 12,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
  },
  difficultyOptionTextSelected: {
    color: '#FFFFFF',
  },
  uploadProgress: {
    marginVertical: 16,
  },
  progressText: {
    fontSize: 14,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderRadius: 3,
  },
  aiAnalysisProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  aiAnalysisText: {
    fontSize: 14,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  uploadActionBtn: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  uploadActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    flex: 1,
    marginRight: 12,
  },
  previewVideoContainer: {
    height: 200,
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewVideoText: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginTop: 8,
  },
  previewContent: {
    gap: 16,
  },
  previewDescription: {
    fontSize: 14,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    lineHeight: 20,
  },
  previewMeta: {
    gap: 8,
  },
  previewMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewMetaLabel: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },
  previewMetaValue: {
    fontSize: 14,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontWeight: '500',
  },
  previewAiAnalysis: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    padding: 16,
    borderRadius: 8,
  },
  previewAiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
  },
  previewAiFeedback: {
    fontSize: 13,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  previewAiStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewAiStat: {
    fontSize: 12,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    fontWeight: '500',
  },
  previewTags: {
    paddingBottom: 20,
  },
  previewTagsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    fontWeight: '500',
  },
});

export default VideoUpload;
