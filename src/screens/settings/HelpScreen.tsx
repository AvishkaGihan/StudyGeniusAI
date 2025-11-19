import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Text, Divider } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "../../store";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { logger } from "../../services/logger";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  items: FAQItem[];
}

const HelpScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const helpCategories: HelpCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "🚀",
      items: [
        {
          id: "first-deck",
          question: "How do I create my first deck?",
          answer:
            'Tap the Capture tab at the bottom of the screen. Take a photo of a textbook page using the camera. The app will automatically extract the text and generate flashcards using AI. Review the generated cards and tap "Start Studying" to begin.',
        },
        {
          id: "from-photo",
          question: "Can I upload a photo from my gallery?",
          answer:
            'Yes! In the camera screen, tap "Upload from Gallery" below the camera button. Select any photo from your device. The app will extract text from the image and generate flashcards.',
        },
        {
          id: "edit-cards",
          question: "Can I edit generated cards?",
          answer:
            "Absolutely. After cards are generated, tap any card to expand it. You can edit the question and answer, or delete cards you don't want. All changes are saved automatically.",
        },
      ],
    },
    {
      id: "studying",
      title: "Studying & Spaced Repetition",
      icon: "📚",
      items: [
        {
          id: "what-is-spaced-rep",
          question: "What is spaced repetition?",
          answer:
            'Spaced repetition is a learning technique where you review material at increasing intervals. Cards marked "Hard" appear again sooner, while "Easy" cards reappear later. This optimizes your memory and reduces study time.',
        },
        {
          id: "difficulty-selection",
          question: "What do the Easy/Medium/Hard buttons mean?",
          answer:
            "After seeing the answer, select how well you knew the card: Easy = you remembered it perfectly; Medium = you struggled a bit; Hard = you didn't know it or completely forgot. The app adjusts when you'll see the card again based on your selection.",
        },
        {
          id: "tutor-help",
          question: "How do I get AI explanations while studying?",
          answer:
            'While studying, tap the "?" button in the top-right corner of any card. The AI tutor will provide a detailed explanation of the concept. You can ask follow-up questions in the chat. This is perfect when you\'re confused about an answer.',
        },
        {
          id: "study-streak",
          question: "What is a study streak?",
          answer:
            "Your study streak is the number of consecutive days you've studied at least one card. Keep your streak alive by studying daily. This gamification feature helps build a consistent study habit.",
        },
      ],
    },
    {
      id: "sync-backup",
      title: "Sync & Backup",
      icon: "☁️",
      items: [
        {
          id: "cloud-sync",
          question: "What is cloud sync?",
          answer:
            "Cloud sync automatically backs up your decks and study progress to the cloud. Enable it in Settings > Preferences. Your data is safe and accessible across all your devices.",
        },
        {
          id: "offline-study",
          question: "Can I study offline?",
          answer:
            "Yes! StudyGenius is designed to work offline. All your decks and progress are stored on your device. When you reconnect to the internet, your changes sync to the cloud automatically.",
        },
        {
          id: "sync-failed",
          question: "Why isn't my cloud sync working?",
          answer:
            "Check your internet connection. If you're connected and sync still fails, try: (1) Turn cloud sync off and on in Preferences, (2) Check if you're logged in, (3) Restart the app. If issues persist, contact support.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical & Troubleshooting",
      icon: "⚙️",
      items: [
        {
          id: "ocr-quality",
          question: "Why is the extracted text inaccurate?",
          answer:
            "Text extraction (OCR) works best with clear, well-lit photos of printed text. Avoid: angled photos, poor lighting, handwriting, or small fonts. If accuracy is low, you can manually edit the text before generating cards.",
        },
        {
          id: "camera-permission",
          question: "Why can't I access the camera?",
          answer:
            "You need to grant camera permissions. Go to your device Settings > Apps > StudyGenius > Permissions > Camera, and enable it. Then restart the app.",
        },
        {
          id: "photo-quality",
          question: "What photo quality should I use?",
          answer:
            "Higher resolution photos are better. Use your device's default camera quality or higher. Ensure lighting is good and the text is clearly visible. The app will automatically crop and optimize the image.",
        },
        {
          id: "crash-bugs",
          question: "The app keeps crashing. What do I do?",
          answer:
            "Try these steps: (1) Restart the app, (2) Restart your device, (3) Clear the app cache (Settings > Apps > StudyGenius > Storage > Clear Cache), (4) Reinstall the app. If crashes continue, contact support with details.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Login",
      icon: "👤",
      items: [
        {
          id: "forgot-password",
          question: "I forgot my password. How do I reset it?",
          answer:
            'On the login screen, tap "Forgot Password?". Enter your email address. You\'ll receive an email with a reset link. Follow the instructions to set a new password.',
        },
        {
          id: "change-email",
          question: "Can I change my email address?",
          answer:
            'Go to Settings > Profile. Tap "Edit Profile" and update your email. Confirm the change in the verification email sent to your new address. Your account will be updated immediately.',
        },
        {
          id: "delete-account",
          question: "How do I delete my account?",
          answer:
            "Go to Settings > Preferences > Advanced > Delete Account. This will permanently delete your account and all data. This action cannot be undone. We'll be sad to see you go!",
        },
      ],
    },
  ];

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open link");
      }
    } catch (error) {
      logger.error("HelpScreen:handleLinkPress", {
        message: "Failed to open link",
        url,
      });
    }
  };

  const handleContactSupport = () => {
    const email = "support@studygeniusai.com";
    const subject = "StudyGenius Support Request";
    const body = `Hi Support Team,\n\nI need help with...\n\nUser ID: ${user?.id || "N/A"}\nEmail: ${user?.email || "N/A"}\n`;

    const mailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    handleLinkPress(mailUrl);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    logger.info("HelpScreen:toggleExpanded", { itemId: id });
  };

  const FAQItemComponent: React.FC<{ item: FAQItem; isExpanded: boolean }> = ({
    item,
    isExpanded,
  }) => (
    <>
      <TouchableOpacity
        onPress={() => toggleExpanded(item.id)}
        activeOpacity={0.7}
        style={{
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text
            style={[
              typography.bodyLarge,
              {
                color: isExpanded ? colors.primary.main : colors.text.primary,
                flex: 1,
                marginRight: spacing.md,
                fontWeight: "600",
              },
            ]}
          >
            {item.question}
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              {
                color: colors.primary.main,
                fontSize: 16,
              },
            ]}
          >
            {isExpanded ? "−" : "+"}
          </Text>
        </View>

        {isExpanded && (
          <Text
            style={[
              typography.bodySmall,
              {
                color: colors.text.secondary,
                marginTop: spacing.sm,
                lineHeight: 20,
              },
            ]}
          >
            {item.answer}
          </Text>
        )}
      </TouchableOpacity>
      <Divider style={{ backgroundColor: colors.divider }} />
    </>
  );

  const CategorySection: React.FC<{ category: HelpCategory }> = ({
    category,
  }) => (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Category Header */}
      <View
        style={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          backgroundColor: `rgba(${parseInt(colors.primary.main.slice(1, 3), 16)}, ${parseInt(
            colors.primary.main.slice(3, 5),
            16
          )}, ${parseInt(colors.primary.main.slice(5, 7), 16)}, 0.08)`,
          borderRadius: 8,
          marginBottom: spacing.md,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 24, marginRight: spacing.sm }}>
          {category.icon}
        </Text>
        <Text
          style={[
            typography.bodyLarge,
            {
              color: colors.text.primary,
              fontWeight: "700",
            },
          ]}
        >
          {category.title}
        </Text>
      </View>

      {/* FAQ Items */}
      <View
        style={{
          backgroundColor: colors.surface.main,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.surface.border,
          overflow: "hidden",
        }}
      >
        {category.items.map((item, index) => (
          <FAQItemComponent
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background.default,
      }}
      contentContainerStyle={{
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl + insets.bottom,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            typography.h1,
            {
              color: colors.text.primary,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Help & Support
        </Text>
        <Text
          style={[
            typography.bodySmall,
            {
              color: colors.text.secondary,
            },
          ]}
        >
          Find answers to common questions and get support
        </Text>
      </View>

      {/* FAQ Categories */}
      {helpCategories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}

      {/* Contact Support Section */}
      <View
        style={{
          marginTop: spacing.xl,
          padding: spacing.md,
          backgroundColor: `rgba(${parseInt(colors.success.main.slice(1, 3), 16)}, ${parseInt(
            colors.success.main.slice(3, 5),
            16
          )}, ${parseInt(colors.success.main.slice(5, 7), 16)}, 0.08)`,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: colors.success.main,
        }}
      >
        <Text
          style={[
            typography.bodyLarge,
            {
              color: colors.text.primary,
              marginBottom: spacing.sm,
              fontWeight: "600",
            },
          ]}
        >
          Still need help?
        </Text>
        <Text
          style={[
            typography.bodySmall,
            {
              color: colors.text.secondary,
              marginBottom: spacing.md,
            },
          ]}
        >
          Contact our support team and we'll get back to you within 24 hours.
        </Text>
        <TouchableOpacity
          onPress={handleContactSupport}
          style={{
            backgroundColor: colors.success.main,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 6,
            alignItems: "center",
          }}
        >
          <Text
            style={[
              typography.bodyLarge,
              {
                color: colors.success.contrast,
                fontWeight: "600",
              },
            ]}
          >
            Email Support
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Info */}
      <View
        style={{
          marginTop: spacing.xl,
          paddingTop: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
        }}
      >
        <Text
          style={[
            typography.caption,
            {
              color: colors.text.tertiary,
              textAlign: "center",
            },
          ]}
        >
          StudyGenius AI v1.0.0
        </Text>
        <Text
          style={[
            typography.caption,
            {
              color: colors.text.tertiary,
              textAlign: "center",
              marginTop: spacing.xs,
            },
          ]}
        >
          © 2025 StudyGenius. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

export default HelpScreen;
