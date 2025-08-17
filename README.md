# SkillChain

SkillChain is a cross-platform educational and networking app for developers, educators, and students. It enables educators to upload video content, users to connect and network, and everyone to explore a feed of educational resources and community posts.

## Features

- **Educator Video Uploads:** Educators can upload video content, which is analyzed by AI for complexity and quality.
- **Video Feed:** Users see a horizontal scroll of educational videos at the top of the feed, with metadata like duration, difficulty, and views.
- **Community Posts:** Users can view, like, and interact with community posts.
- **User Networking:** Discover and connect with other developers, designers, data scientists, and students. Filter by skills, experience, and location.
- **AI Matching:** Find relevant connections using AI-powered matching.
- **Profile Management:** Users and educators have detailed profiles with skills, experience, and social links.
- **Mock Data Demo Mode:** When backend APIs are unavailable, the app uses realistic mock data for videos, users, and posts.

## Tech Stack

- **Frontend:** React Native (TypeScript), Expo
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Authentication:** JWT, AsyncStorage
- **UI:** Lucide React Native icons, custom components
- **AI Analysis:** Simulated in frontend for demo mode

## Folder Structure

```
app/                # Main app screens and navigation
  Feed.tsx          # Main feed with videos and posts
  VideoUpload.tsx   # Educator video upload and management
  connect.tsx       # User networking and connections
  Profile.tsx       # User profile
  Auth.tsx          # Authentication
  Main.tsx          # App entry and navigation
components/         # Reusable UI components
Backend/            # Node.js/Express backend
  Server.js         # Main server file
  Models/           # Mongoose models
  Routes/           # API routes
assets/             # Images and fonts
android/ios/        # Native platform code
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the app:**
   ```bash
   npx expo start
   ```
3. **Run backend (optional):**
   ```bash
   cd Backend
   npm install
   node Server.js
   ```

## Usage

- **Educator:** Go to the Video Upload page, add new content, and view AI analysis.
- **User:** Browse the feed, watch videos, interact with posts, and connect with others.
- **Demo Mode:** If backend APIs are unavailable, the app will display mock data for all main features.

## Environment & Configuration

- Place API keys and secrets in `.env` files (see `.gitignore`).
- For Firebase, add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) to the respective folders.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

MIT

## Authors

- Boobesh Kumar (Boobeshkumar56)
- Contributors welcome!

## Contact & Community

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Discord Community](https://chat.expo.dev)

---

SkillChain: Empowering developers and educators to learn, connect, and grow together.
