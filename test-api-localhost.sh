#!/bin/bash

# SkillChain API Test Commands - Localhost
# Make sure backend server is running: cd Backend && node Server.js

echo "=================================================="
echo "SkillChain API Testing - Localhost:5000"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "\n${BLUE}1. Health Check${NC}"
curl -X GET http://localhost:5000/api-check

# 2. Signup
echo -e "\n\n${BLUE}2. Create New User (Signup)${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Test123!@#",
  "authProvider": "email"
}')

echo "$SIGNUP_RESPONSE"

# Extract token from signup response
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "\n${GREEN}Token extracted: $TOKEN${NC}"

# 3. Login
echo -e "\n\n${BLUE}3. Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "password": "Test123!@#"
}')

echo "$LOGIN_RESPONSE"

# Update token from login if needed
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "\n${GREEN}Updated Token: $TOKEN${NC}"

# 4. Verify Token
echo -e "\n\n${BLUE}4. Verify Token${NC}"
curl -X GET http://localhost:5000/api/auth/verify-token \
-H "Authorization: Bearer $TOKEN"

# 5. Complete Onboarding
echo -e "\n\n${BLUE}5. Complete Onboarding${NC}"
curl -X POST http://localhost:5000/api/auth/onboarding \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "selectedRole": "Full Stack Developer",
  "experienceLevel": "intermediate",
  "bio": "I am a software developer interested in blockchain and AI",
  "location": "San Francisco, CA",
  "knownSkills": [
    {"skill": "JavaScript", "experience": "intermediate"},
    {"skill": "Python", "experience": "beginner"},
    {"skill": "React", "experience": "intermediate"}
  ],
  "currentLearnings": [
    {
      "skill": "Next.js",
      "progress": 30,
      "targetDate": "2025-12-31T00:00:00.000Z",
      "resources": []
    }
  ],
  "interests": ["Web Development", "Blockchain", "AI"]
}'

# 6. Get Profile
echo -e "\n\n${BLUE}6. Get User Profile${NC}"
curl -X GET http://localhost:5000/api/auth/profile \
-H "Authorization: Bearer $TOKEN"

# 7. Get Dashboard
echo -e "\n\n${BLUE}7. Get Dashboard Data${NC}"
curl -X GET http://localhost:5000/api/auth/dashboard \
-H "Authorization: Bearer $TOKEN"

# 8. Add Current Learning
echo -e "\n\n${BLUE}8. Add Current Learning${NC}"
curl -X POST http://localhost:5000/api/auth/current-learning \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "skill": "GraphQL",
  "level": "beginner",
  "targetDate": "2025-11-30T00:00:00.000Z"
}'

# 9. Add Project
echo -e "\n\n${BLUE}9. Add Project${NC}"
curl -X POST http://localhost:5000/api/auth/project \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "SkillChain Platform",
  "description": "A blockchain-based skill sharing platform",
  "status": "active",
  "technologies": ["React", "Node.js", "MongoDB", "Blockchain"],
  "github": "https://github.com/username/skillchain",
  "liveUrl": "https://skillchain.example.com"
}'

# 10. Add Doubt
echo -e "\n\n${BLUE}10. Add Doubt${NC}"
curl -X POST http://localhost:5000/api/auth/doubt \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "How to optimize React performance?",
  "description": "I need help understanding React performance optimization techniques",
  "category": "Web Development",
  "tags": ["React", "Performance", "Optimization"]
}'

# 11. Get Feed
echo -e "\n\n${BLUE}11. Get Community Feed${NC}"
curl -X GET "http://localhost:5000/api/auth/feed?page=1&limit=10" \
-H "Authorization: Bearer $TOKEN"

# 12. Create Feed Post
echo -e "\n\n${BLUE}12. Create Feed Post${NC}"
curl -X POST http://localhost:5000/api/auth/feed \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "content": "Just completed my first blockchain project! 🎉",
  "media": [],
  "tags": ["blockchain", "achievement"]
}'

# 13. Update Social Profiles
echo -e "\n\n${BLUE}13. Update Social Profiles${NC}"
curl -X PUT http://localhost:5000/api/auth/social-profiles \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "github": "https://github.com/testuser",
  "linkedin": "https://linkedin.com/in/testuser",
  "leetcode": "https://leetcode.com/testuser"
}'

# 14. AI Match (requires another user)
echo -e "\n\n${BLUE}14. AI Match Users${NC}"
curl -X POST http://localhost:5000/api/auth/ai-match \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{}'

# 15. Get All Users
echo -e "\n\n${BLUE}15. Get All Users${NC}"
curl -X GET "http://localhost:5000/api/auth/users?page=1&limit=10" \
-H "Authorization: Bearer $TOKEN"

# 16. Upload Video (Educator)
echo -e "\n\n${BLUE}16. Upload Video Content${NC}"
curl -X POST http://localhost:5000/api/auth/educator/upload-video \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "Introduction to React Hooks",
  "description": "Learn the basics of React Hooks",
  "category": "Web Development",
  "difficulty": "beginner",
  "videoUrl": "https://example.com/video.mp4",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "duration": 1200,
  "tags": ["React", "Hooks", "JavaScript"]
}'

# 17. Get Educator Videos
echo -e "\n\n${BLUE}17. Get Educator Videos${NC}"
curl -X GET http://localhost:5000/api/auth/educator/videos \
-H "Authorization: Bearer $TOKEN"

# 18. Get Video Feed
echo -e "\n\n${BLUE}18. Get Video Feed${NC}"
curl -X GET http://localhost:5000/api/auth/videos/feed \
-H "Authorization: Bearer $TOKEN"

echo -e "\n\n${GREEN}=================================================="
echo "Testing Complete!"
echo "==================================================${NC}"
