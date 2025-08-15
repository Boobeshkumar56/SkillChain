import {
    BarChart3,
    Brain,
    Cloud,
    Code,
    Cpu,
    Database,
    Eye,
    Gamepad2,
    Globe,
    Palette,
    Server,
    Shield,
    Smartphone,
    Wifi,
    Wrench
} from 'lucide-react-native';
import React from 'react';

interface SkillIconProps {
  skill: string;
  size?: number;
  color?: string;
}

export const getSkillIcon = (skill: string, size: number = 20, color: string = '#6B7280') => {
  const skillLower = skill.toLowerCase();
  
  // Frontend frameworks and libraries
  if (skillLower.includes('react') || skillLower.includes('vue') || skillLower.includes('angular')) {
    return <Code size={size} color={color} />;
  }
  
  // Mobile development
  if (skillLower.includes('flutter') || skillLower.includes('react native') || 
      skillLower.includes('ios') || skillLower.includes('android') || skillLower.includes('swift') || skillLower.includes('kotlin')) {
    return <Smartphone size={size} color={color} />;
  }
  
  // Backend and servers
  if (skillLower.includes('node') || skillLower.includes('express') || skillLower.includes('django') || 
      skillLower.includes('flask') || skillLower.includes('spring') || skillLower.includes('backend')) {
    return <Server size={size} color={color} />;
  }
  
  // Databases
  if (skillLower.includes('sql') || skillLower.includes('mongo') || skillLower.includes('postgres') || 
      skillLower.includes('mysql') || skillLower.includes('database') || skillLower.includes('redis')) {
    return <Database size={size} color={color} />;
  }
  
  // Cloud and DevOps
  if (skillLower.includes('aws') || skillLower.includes('azure') || skillLower.includes('gcp') || 
      skillLower.includes('docker') || skillLower.includes('kubernetes') || skillLower.includes('devops') ||
      skillLower.includes('cloud')) {
    return <Cloud size={size} color={color} />;
  }
  
  // Web technologies
  if (skillLower.includes('html') || skillLower.includes('css') || skillLower.includes('javascript') || 
      skillLower.includes('typescript') || skillLower.includes('web')) {
    return <Globe size={size} color={color} />;
  }
  
  // AI/ML
  if (skillLower.includes('machine learning') || skillLower.includes('ai') || skillLower.includes('tensorflow') || 
      skillLower.includes('pytorch') || skillLower.includes('neural')) {
    return <Brain size={size} color={color} />;
  }
  
  // Data Science
  if (skillLower.includes('data') || skillLower.includes('analytics') || skillLower.includes('pandas') || 
      skillLower.includes('numpy') || skillLower.includes('visualization')) {
    return <BarChart3 size={size} color={color} />;
  }
  
  // Design
  if (skillLower.includes('design') || skillLower.includes('ui') || skillLower.includes('ux') || 
      skillLower.includes('figma') || skillLower.includes('photoshop')) {
    return <Palette size={size} color={color} />;
  }
  
  // Security
  if (skillLower.includes('security') || skillLower.includes('cyber') || skillLower.includes('penetration')) {
    return <Shield size={size} color={color} />;
  }
  
  // Game Development
  if (skillLower.includes('game') || skillLower.includes('unity') || skillLower.includes('unreal')) {
    return <Gamepad2 size={size} color={color} />;
  }
  
  // IoT
  if (skillLower.includes('iot') || skillLower.includes('arduino') || skillLower.includes('raspberry')) {
    return <Wifi size={size} color={color} />;
  }
  
  // AR/VR
  if (skillLower.includes('ar') || skillLower.includes('vr') || skillLower.includes('virtual') || skillLower.includes('augmented')) {
    return <Eye size={size} color={color} />;
  }
  
  // Programming languages and general tools
  if (skillLower.includes('python') || skillLower.includes('java') || skillLower.includes('c++') || 
      skillLower.includes('go') || skillLower.includes('rust') || skillLower.includes('php')) {
    return <Cpu size={size} color={color} />;
  }
  
  // Default for tools and others
  return <Wrench size={size} color={color} />;
};

export const SkillIcon: React.FC<SkillIconProps> = ({ skill, size = 20, color = '#6B7280' }) => {
  return getSkillIcon(skill, size, color);
};

// Predefined skill categories with their icons
export const skillCategories = [
  {
    category: 'Frontend',
    skills: ['React', 'Vue.js', 'Angular', 'HTML/CSS', 'JavaScript', 'TypeScript'],
    icon: Code
  },
  {
    category: 'Backend',
    skills: ['Node.js', 'Python', 'Java', 'C#', 'PHP', 'Go'],
    icon: Server
  },
  {
    category: 'Mobile',
    skills: ['React Native', 'Flutter', 'iOS (Swift)', 'Android (Kotlin)', 'Xamarin'],
    icon: Smartphone
  },
  {
    category: 'Database',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite'],
    icon: Database
  },
  {
    category: 'Cloud & DevOps',
    skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins'],
    icon: Cloud
  },
  {
    category: 'Data Science',
    skills: ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Matplotlib'],
    icon: BarChart3
  },
  {
    category: 'AI/ML',
    skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenCV', 'Keras'],
    icon: Brain
  },
  {
    category: 'Design',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'],
    icon: Palette
  }
];

export default SkillIcon;
