import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import {
  Award,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Code,
  GraduationCap,
  Heart,
  MapPin,
  Settings,
  Target,
  Users,
  Zap
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../constants';

const { width } = Dimensions.get('window');

interface OnboardingProps {
  theme?: 'dark' | 'light';
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onComplete?: () => void;
}

interface SkillLevel {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
}

interface CurrentLearning {
  skill: string;
  progress: number;
  targetDate: string;
  resources: string[];
}

const OnboardingScreen: React.FC<OnboardingProps> = ({ theme = 'dark', showToast, onComplete }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // User data states
  const [selectedRole, setSelectedRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [knownSkills, setKnownSkills] = useState<SkillLevel[]>([]);
  const [currentLearnings, setCurrentLearnings] = useState<CurrentLearning[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  
  // Social profiles
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');

  // Temporary states for adding skills
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');
  const [newSkillYears, setNewSkillYears] = useState(0);

  // Temporary states for current learning
  const [newLearning, setNewLearning] = useState('');
  const [newLearningProgress, setNewLearningProgress] = useState(0);

  const roles = [
    { id: 'Frontend Developer', label: 'Frontend Developer', icon: Code },
    { id: 'Backend Developer', label: 'Backend Developer', icon: Briefcase },
    { id: 'Full Stack Developer', label: 'Full Stack Developer', icon: Target },
    { id: 'Mobile Developer', label: 'Mobile Developer', icon: Settings },
    { id: 'Data Scientist', label: 'Data Scientist', icon: Award },
    { id: 'DevOps Engineer', label: 'DevOps Engineer', icon: Zap },
    { id: 'UI/UX Designer', label: 'UI/UX Designer', icon: Heart },
    { id: 'Student', label: 'Student', icon: GraduationCap },
    { id: 'Other', label: 'Other', icon: Users }
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', description: '0-1 years' },
    { id: 'intermediate', label: 'Intermediate', description: '1-3 years' },
    { id: 'advanced', label: 'Advanced', description: '3-5 years' },
    { id: 'expert', label: 'Expert', description: '5+ years' }
  ];

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

  const interestOptions = [
    'Web Development', 'Mobile Development', 'Machine Learning', 'Data Science',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'Blockchain', 'AI',
    'UI/UX Design', 'Game Development', 'IoT', 'AR/VR', 'Robotics'
  ];

  const steps = [
    { title: 'Choose Your Role', subtitle: 'What best describes your role?' },
    { title: 'Experience Level', subtitle: 'How experienced are you?' },
    { title: 'About You', subtitle: 'Tell us about yourself' },
    { title: 'Social Profiles', subtitle: 'Connect your profiles (optional)' },
    { title: 'Your Skills', subtitle: 'What technologies do you know?' },
    { title: 'Learning Goals', subtitle: 'What are you currently learning?' },
    { title: 'Interests', subtitle: 'What interests you most?' }
  ];

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    const skill: SkillLevel = {
      skill: newSkill.trim(),
      level: newSkillLevel,
      yearsOfExperience: newSkillYears
    };
    
    setKnownSkills([...knownSkills, skill]);
    setNewSkill('');
    setNewSkillLevel('beginner');
    setNewSkillYears(0);
  };

  const removeSkill = (index: number) => {
    setKnownSkills(knownSkills.filter((_, i) => i !== index));
  };

  const addLearning = () => {
    if (!newLearning.trim()) return;
    
    const learning: CurrentLearning = {
      skill: newLearning.trim(),
      progress: newLearningProgress,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months from now
      resources: []
    };
    
    setCurrentLearnings([...currentLearnings, learning]);
    setNewLearning('');
    setNewLearningProgress(0);
  };

  const removeLearning = (index: number) => {
    setCurrentLearnings(currentLearnings.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: return selectedRole !== '';
      case 1: return experienceLevel !== '';
      case 2: return bio.trim() !== '';
      case 3: return true; // Social profiles are optional
      case 4: return knownSkills.length > 0;
      case 5: return true; // Learning goals are optional
      case 6: return interests.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        const message = 'Authentication token not found';
        if (showToast) {
          showToast(message, 'error');
        } else {
          Alert.alert('Error', message);
        }
        return;
      }

      const onboardingData = {
        selectedRole,
        experienceLevel,
        bio,
        location,
        knownSkills: knownSkills.map(skill => ({
          skill: skill.skill,
          experience: skill.level
        })),
        currentLearnings,
        interests
      };

      const response = await fetch(`${API_URL}/onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        
        if (showToast) {
          showToast('Welcome to SkillChain! Profile setup completed successfully.', 'success');
        }
        
        if (onComplete) {
          onComplete();
        } else {
          // Fallback to alert and router if no onComplete prop
          Alert.alert(
            'Welcome to SkillChain! 🎉',
            'Your profile has been set up successfully. Start connecting with amazing people!',
            [{ text: 'Get Started', onPress: () => router.replace('/Main') }]
          );
        }
      } else {
        const errorData = await response.json();
        const message = errorData.message || 'Failed to complete onboarding';
        if (showToast) {
          showToast(message, 'error');
        } else {
          Alert.alert('Error', message);
        }
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      const message = 'Failed to complete onboarding. Please try again.';
      if (showToast) {
        showToast(message, 'error');
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Your Role</Text>
      <Text style={styles.stepSubtitle}>What best describes what you do?</Text>
      
      <FlatList
        data={roles}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.rolesGrid}
        renderItem={({ item }) => {
          const IconComponent = item.icon;
          const isSelected = selectedRole === item.id;
          
          return (
            <TouchableOpacity
              style={[styles.roleCard, isSelected && styles.roleCardSelected]}
              onPress={() => setSelectedRole(item.id)}
            >
              <IconComponent 
                size={24} 
                color={isSelected ? '#fff' : (theme === 'dark' ? '#8B5CF6' : '#EF4444')} 
              />
              <Text style={[
                styles.roleCardText,
                isSelected && styles.roleCardTextSelected
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderExperienceLevel = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Experience Level</Text>
      <Text style={styles.stepSubtitle}>How much experience do you have?</Text>
      
      <View style={styles.experienceContainer}>
        {experienceLevels.map((level) => {
          const isSelected = experienceLevel === level.id;
          
          return (
            <TouchableOpacity
              key={level.id}
              style={[styles.experienceCard, isSelected && styles.experienceCardSelected]}
              onPress={() => setExperienceLevel(level.id)}
            >
              <Text style={[
                styles.experienceLabel,
                isSelected && styles.experienceLabelSelected
              ]}>
                {level.label}
              </Text>
              <Text style={[
                styles.experienceDescription,
                isSelected && styles.experienceDescriptionSelected
              ]}>
                {level.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderAbout = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>About You</Text>
      <Text style={styles.stepSubtitle}>Tell us a bit about yourself</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Write a brief description about yourself, your interests, and goals..."
          placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={300}
        />
        <Text style={styles.charCount}>{bio.length}/300</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location (Optional)</Text>
        <View style={styles.inputWithIcon}>
          <MapPin size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g., San Francisco, CA or Remote"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={location}
            onChangeText={setLocation}
          />
        </View>
      </View>
    </View>
  );

  const renderSocialProfiles = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Social Profiles</Text>
      <Text style={styles.stepSubtitle}>Connect your professional profiles (all optional)</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>GitHub Username</Text>
        <View style={styles.inputWithIcon}>
          <Code size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            style={styles.textInput}
            placeholder="your-github-username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={githubUsername}
            onChangeText={setGithubUsername}
            autoCapitalize="none"
          />
        </View>
        {githubUsername && (
          <Text style={styles.profilePreview}>
            Profile: github.com/{githubUsername}
          </Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>LinkedIn Username</Text>
        <View style={styles.inputWithIcon}>
          <Users size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            style={styles.textInput}
            placeholder="your-linkedin-username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={linkedinUsername}
            onChangeText={setLinkedinUsername}
            autoCapitalize="none"
          />
        </View>
        {linkedinUsername && (
          <Text style={styles.profilePreview}>
            Profile: linkedin.com/in/{linkedinUsername}
          </Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>LeetCode Username</Text>
        <View style={styles.inputWithIcon}>
          <Target size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            style={styles.textInput}
            placeholder="your-leetcode-username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={leetcodeUsername}
            onChangeText={setLeetcodeUsername}
            autoCapitalize="none"
          />
        </View>
        {leetcodeUsername && (
          <Text style={styles.profilePreview}>
            Profile: leetcode.com/{leetcodeUsername}
          </Text>
        )}
      </View>
    </View>
  );

  const renderSkills = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Skills</Text>
      <Text style={styles.stepSubtitle}>What technologies and skills do you know?</Text>
      
      {/* Add new skill */}
      <View style={styles.addSkillContainer}>
        <TextInput
          style={styles.skillInput}
          placeholder="e.g., React, Python, Node.js"
          placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={newSkill}
          onChangeText={setNewSkill}
        />
        
        <View style={styles.skillDetails}>
          <View style={styles.skillLevelContainer}>
            <Text style={styles.skillDetailLabel}>Level:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {skillLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelChip,
                    newSkillLevel === level && styles.levelChipSelected
                  ]}
                  onPress={() => setNewSkillLevel(level as any)}
                >
                  <Text style={[
                    styles.levelChipText,
                    newSkillLevel === level && styles.levelChipTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.yearsContainer}>
            <Text style={styles.skillDetailLabel}>Years: {newSkillYears}</Text>
            <View style={styles.yearButtons}>
              <TouchableOpacity 
                style={styles.yearBtn}
                onPress={() => setNewSkillYears(Math.max(0, newSkillYears - 1))}
              >
                <Text style={styles.yearBtnText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.yearBtn}
                onPress={() => setNewSkillYears(newSkillYears + 1)}
              >
                <Text style={styles.yearBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={addSkill}
          disabled={!newSkill.trim()}
        >
          <Text style={styles.addBtnText}>Add Skill</Text>
        </TouchableOpacity>
      </View>

      {/* Skills list */}
      <ScrollView style={styles.skillsList} showsVerticalScrollIndicator={false}>
        {knownSkills.map((skill, index) => (
          <View key={index} style={styles.skillItem}>
            <View style={styles.skillInfo}>
              <Text style={styles.skillName}>{skill.skill}</Text>
              <Text style={styles.skillMeta}>
                {skill.level} • {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removeSkill(index)}>
              <Text style={styles.removeBtn}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderLearning = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Learning Goals</Text>
      <Text style={styles.stepSubtitle}>What are you currently learning or want to learn?</Text>
      
      {/* Add new learning */}
      <View style={styles.addLearningContainer}>
        <TextInput
          style={styles.learningInput}
          placeholder="e.g., Next.js, Machine Learning, GraphQL"
          placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={newLearning}
          onChangeText={setNewLearning}
        />
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress: {newLearningProgress}%</Text>
          <View style={styles.progressButtons}>
            <TouchableOpacity 
              style={styles.progressBtn}
              onPress={() => setNewLearningProgress(Math.max(0, newLearningProgress - 10))}
            >
              <Text style={styles.progressBtnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.progressBtn}
              onPress={() => setNewLearningProgress(Math.min(100, newLearningProgress + 10))}
            >
              <Text style={styles.progressBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={addLearning}
          disabled={!newLearning.trim()}
        >
          <Text style={styles.addBtnText}>Add Learning Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Learning list */}
      <ScrollView style={styles.learningList} showsVerticalScrollIndicator={false}>
        {currentLearnings.map((learning, index) => (
          <View key={index} style={styles.learningItem}>
            <View style={styles.learningInfo}>
              <Text style={styles.learningName}>{learning.skill}</Text>
              <View style={styles.learningProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${learning.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{learning.progress}%</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeLearning(index)}>
              <Text style={styles.removeBtn}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {currentLearnings.length === 0 && (
        <Text style={styles.emptyText}>
          No learning goals yet. Add some to connect with others who share similar interests!
        </Text>
      )}
    </View>
  );

  const renderInterests = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Interests</Text>
      <Text style={styles.stepSubtitle}>What areas of technology interest you most?</Text>
      
      <View style={styles.interestsContainer}>
        {interestOptions.map((interest) => {
          const isSelected = interests.includes(interest);
          
          return (
            <TouchableOpacity
              key={interest}
              style={[styles.interestChip, isSelected && styles.interestChipSelected]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={[
                styles.interestChipText,
                isSelected && styles.interestChipTextSelected
              ]}>
                {interest}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderRoleSelection();
      case 1: return renderExperienceLevel();
      case 2: return renderAbout();
      case 3: return renderSocialProfiles();
      case 4: return renderSkills();
      case 5: return renderLearning();
      case 6: return renderInterests();
      default: return null;
    }
  };

  const styles = getStyles(theme);

  return (
    <LinearGradient
      colors={theme === 'dark' ? ['#0F0F23', '#1F1F3A'] : ['#F8FAFC', '#E2E8F0']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack}
          style={[styles.navBtn, currentStep === 0 && styles.navBtnDisabled]}
          disabled={currentStep === 0}
        >
          <ChevronLeft size={24} color={currentStep === 0 ? '#9CA3AF' : (theme === 'dark' ? '#F9FAFB' : '#111827')} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.stepNumber}>
            {currentStep + 1} of {steps.length}
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[
                styles.progressBar,
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} />
            </View>
          </View>
        </View>
        
        <View style={styles.navBtn} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            !canProceedToNextStep() && styles.nextBtnDisabled
          ]}
          onPress={handleNext}
          disabled={!canProceedToNextStep() || loading}
        >
          {loading ? (
            <Text style={styles.nextBtnText}>Completing...</Text>
          ) : (
            <>
              <Text style={styles.nextBtnText}>
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              </Text>
              {currentStep < steps.length - 1 && (
                <ChevronRight size={20} color="#fff" />
              )}
              {currentStep === steps.length - 1 && (
                <CheckCircle size={20} color="#fff" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navBtn: {
    padding: 8,
    borderRadius: 8,
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  rolesGrid: {
    paddingVertical: 8,
  },
  roleCard: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 100,
    justifyContent: 'center',
  },
  roleCardSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderColor: theme === 'dark' ? '#A855F7' : '#F87171',
  },
  roleCardText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    textAlign: 'center',
  },
  roleCardTextSelected: {
    color: '#FFFFFF',
  },
  experienceContainer: {
    gap: 12,
  },
  experienceCard: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  experienceCardSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderColor: theme === 'dark' ? '#A855F7' : '#F87171',
  },
  experienceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 4,
  },
  experienceLabelSelected: {
    color: '#FFFFFF',
  },
  experienceDescription: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  experienceDescriptionSelected: {
    color: '#E5E7EB',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    marginTop: 4,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontSize: 16,
    paddingVertical: 16,
  },
  profilePreview: {
    fontSize: 12,
    color: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    marginTop: 4,
    fontStyle: 'italic',
  },
  addSkillContainer: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  skillInput: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontSize: 16,
    marginBottom: 12,
  },
  skillDetails: {
    marginBottom: 12,
  },
  skillLevelContainer: {
    marginBottom: 12,
  },
  skillDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    marginBottom: 8,
  },
  levelChip: {
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  levelChipSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    textTransform: 'capitalize',
  },
  levelChipTextSelected: {
    color: '#FFFFFF',
  },
  yearsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  yearBtn: {
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  addBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  skillsList: {
    maxHeight: 200,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  skillMeta: {
    fontSize: 12,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    textTransform: 'capitalize',
  },
  removeBtn: {
    fontSize: 20,
    color: '#EF4444',
    fontWeight: '600',
    padding: 4,
  },
  addLearningContainer: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  learningInput: {
    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    fontSize: 16,
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
    marginBottom: 8,
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  progressBtn: {
    backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
  learningList: {
    maxHeight: 200,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  learningInfo: {
    flex: 1,
  },
  learningName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    marginBottom: 6,
  },
  learningProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    fontStyle: 'italic',
    marginTop: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
  },
  interestChipSelected: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderColor: theme === 'dark' ? '#A855F7' : '#F87171',
  },
  interestChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? '#D1D5DB' : '#374151',
  },
  interestChipTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  nextBtn: {
    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: {
    backgroundColor: theme === 'dark' ? '#374151' : '#9CA3AF',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;