import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
const api_url = process.env.API_URL||"http://localhost:5000/api/auth"

const { width, height } = Dimensions.get('window');

interface AuthProps {
    theme: 'light' | 'dark';
    showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
    onLogin: () => void;
}

export default function AuthScreen({ theme, showToast, onLogin }: AuthProps) {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Animations
    const fadeAnim = new Animated.Value(1);
    const slideAnim = new Animated.Value(0);

    const toggleMode = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        setIsLogin(!isLogin);
        setEmail("");
        setPassword("");
        setName("");
    };

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !name)) {
            if (showToast) {
                showToast("Please fill in all required fields", "error");
            } else {
                Alert.alert("Error", "Please fill in all required fields");
            }
            return;
        }

        if (!isValidEmail(email)) {
            if (showToast) {
                showToast("Please enter a valid email address", "error");
            } else {
                Alert.alert("Error", "Please enter a valid email address");
            }
            return;
        }

        setIsLoading(true);

        // Simulate API call
        try {
            const endpoint = isLogin ? "login" : "signup";
            const res = await fetch(`${api_url}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isLogin
                        ? { email, password }
                        : { name, email, password } // signup includes name
                ),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));

            if (isLogin) {
                if (showToast) {
                    showToast("Login successful!", "success");
                }
                onLogin(); // Let Main.tsx handle onboarding check
            } else {
                if (showToast) {
                    showToast("Account created successfully!", "success");
                }
                onLogin(); // Let Main.tsx handle onboarding check
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Authentication failed";
            if (showToast) {
                showToast(errorMessage, "error");
            } else {
                Alert.alert("Auth Error", errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };


    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <LinearGradient
            colors={['#fdf2f8', '#ffffff', '#fef2f2']}
            style={styles.container}
        >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.brand}>SkillChain</Text>
                    <Text style={styles.slogan}>Connect through skills. Empower each other.</Text>
                    <View style={styles.logoContainer}>

                        <Image
                            source={require("../assets/images/logo.jpg")}
                            style={styles.logo}
                        />

                    </View>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, isLogin && styles.activeTab]}
                            onPress={() => isLogin || toggleMode()}
                        >
                            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                                Login
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, !isLogin && styles.activeTab]}
                            onPress={() => !isLogin || toggleMode()}
                        >
                            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        {!isLogin && (
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="Full Name"
                                    placeholderTextColor="#9ca3af"
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder="Email Address"
                                placeholderTextColor="#9ca3af"
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#9ca3af"
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.authButton, isLoading && styles.authButtonDisabled]}
                        onPress={handleAuth}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#EF4444', '#dc2626']}
                            style={styles.authButtonGradient}
                        >
                            <Text style={styles.authButtonText}>
                                {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={styles.googleButton} onPress={handleAuth}>
                        <Image
                            source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.googleText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace("/Main")} style={styles.guestButton}>
                        <Text style={styles.guestText}>Continue as Guest</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: height * 0.1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    brand: {
        fontSize: 42,
        fontWeight: "800",
        color: "#EF4444",
        marginBottom: 8,
        letterSpacing: 2,
        textShadowColor: 'rgba(190, 18, 60, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    slogan: {
        fontSize: 16,
        fontWeight: "500",
        color: "#6b7280",
        marginBottom: 30,
        textAlign: "center",
        lineHeight: 22,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoGradient: {
        padding: 12,
        borderRadius: 25,
        elevation: 8,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    logo: {
        width: 80,
        height: 80,

    },
    formContainer: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 15,
        padding: 4,
        marginBottom: 30,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#EF4444',
    },
    inputContainer: {
        marginBottom: 30,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 15,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#ffffff',
        color: '#1f2937',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    authButton: {
        borderRadius: 15,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    authButtonDisabled: {
        opacity: 0.7,
    },
    authButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 15,
    },
    authButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '500',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#e5e7eb',
        borderWidth: 2,
        borderRadius: 15,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 20,
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    guestButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    guestText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});