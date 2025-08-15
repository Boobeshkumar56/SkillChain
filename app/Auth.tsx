import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { CustomAlert } from "../components";
import { API_URL } from "../constants";

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
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'info'
    });

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

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setAlertConfig({ title, message, type });
        setAlertVisible(true);
    };

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !name)) {
            if (showToast) {
                showToast("Please fill in all required fields", "error");
            } else {
                showAlert("Error", "Please fill in all required fields", "error");
            }
            return;
        }

        if (!isValidEmail(email)) {
            if (showToast) {
                showToast("Please enter a valid email address", "error");
            } else {
                showAlert("Error", "Please enter a valid email address", "error");
            }
            return;
        }

        setIsLoading(true);

        try {
            const endpoint = isLogin ? "login" : "signup";
            const requestBody = isLogin
                ? { email, password }
                : { name, email, password };
            
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`);
            }

            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));

            if (isLogin) {
                if (showToast) {
                    showToast("Login successful!", "success");
                }
                // Login should go to Main page (which will handle onboarding check)
                router.replace("/Main");
            } else {
                if (showToast) {
                    showToast("Account created successfully!", "success");
                }
                // Signup should go to onboarding page
                router.replace("/onboarding");
            }
        } catch (err) {
            let errorMessage = "Authentication failed";
            
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                errorMessage = "Network error: Unable to connect to server. Please check your internet connection.";
            } else if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            if (showToast) {
                showToast(errorMessage, "error");
            } else {
                showAlert("Auth Error", errorMessage, "error");
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
            <KeyboardAvoidingView 
                style={styles.keyboardAvoid} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
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
                                                returnKeyType="next"
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
                                            returnKeyType="next"
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
                                            returnKeyType="done"
                                            onSubmitEditing={handleAuth}
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
                                        {isLoading ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <Text style={styles.authButtonText}>
                                                {isLogin ? "Sign In" : "Create Account"}
                                            </Text>
                                        )}
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
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertVisible(false)}
                theme={theme}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        minHeight: height,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: height * 0.08,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    brand: {
        fontSize: Math.min(36, width * 0.08),
        fontWeight: "800",
        color: "#EF4444",
        marginBottom: 8,
        letterSpacing: 1,
        textShadowColor: 'rgba(190, 18, 60, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    slogan: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6b7280",
        marginBottom: 20,
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    logoContainer: {
        marginBottom: 15,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    formContainer: {
        flex: 1,
        minHeight: height * 0.6,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 3,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
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
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#EF4444',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        marginBottom: 12,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        backgroundColor: '#ffffff',
        color: '#1f2937',
        minHeight: 50,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    authButton: {
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    authButtonDisabled: {
        opacity: 0.7,
    },
    authButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        minHeight: 50,
        justifyContent: 'center',
    },
    authButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '500',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#e5e7eb',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 15,
        backgroundColor: '#ffffff',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        minHeight: 50,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    googleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    guestButton: {
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 20,
    },
    guestText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});