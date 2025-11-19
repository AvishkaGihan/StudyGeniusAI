import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../store";
import { getTutorResponse } from "../../services/ai/tutorChat";
import { logger } from "../../services/logger";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { ChatBubble } from "../../components/tutor/ChatBubble";
import { ChatInput } from "../../components/tutor/ChatInput";
import { TutorMessage } from "../../utils/types";

interface TutorChatScreenProps {
  route?: {
    params?: {
      cardId?: string;
      cardQuestion?: string;
      cardAnswer?: string;
    };
  };
}

const TutorChatScreen: React.FC<TutorChatScreenProps> = ({ route }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // State
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // References
  const flatListRef = useRef<FlatList>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Props from navigation (if opened from study mode)
  const cardId = route?.params?.cardId;
  const cardQuestion = route?.params?.cardQuestion;
  const cardAnswer = route?.params?.cardAnswer;

  // Initial greeting message
  useEffect(() => {
    const initialMessage: TutorMessage = {
      id: "1",
      role: "assistant",
      content: cardQuestion
        ? `I'll help you understand "${cardQuestion}". What would you like to know about it?`
        : "I'm your AI study tutor. Ask me any questions about your flashcards or concepts you're learning!",
      timestamp: new Date().toISOString(),
    };
    setMessages([initialMessage]);
  }, [cardQuestion]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Send message handler
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const newUserMessage: TutorMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setError(null);
    setIsLoading(true);

    try {
      // Call tutor chat service
      const response = await getTutorResponse(
        userMessage,
        messages
          .filter((m) => m.content)
          .map((m) => ({
            id: m.id,
            role:
              m.role === "user" ? ("user" as const) : ("assistant" as const),
            content: m.content,
            timestamp: m.timestamp,
          }))
      );

      if (response) {
        const assistantMessage: TutorMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("No response from tutor");
      }
    } catch (err) {
      logger.error("TutorChatScreen", {
        message: "Failed to get tutor response",
        error: err instanceof Error ? err.message : String(err),
        userMessage,
      });

      setError(
        "Failed to get a response. Please check your connection and try again."
      );

      // Add error message to chat
      const errorMessage: TutorMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render message item
  const renderMessage = ({ item }: { item: TutorMessage }) => (
    <ChatBubble message={item} />
  );

  // Render chat list or empty state
  const renderChatContent = () => {
    if (messages.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={typography.h3}>Ask Me Anything</Text>
          <Text
            style={[typography.bodyRegular, { color: colors.text.secondary }]}
          >
            {cardQuestion
              ? "I can help explain this concept in more detail"
              : "Ask about any concept, formula, or topic"}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={typography.h2}>Study Tutor</Text>
          {cardQuestion && (
            <Text
              style={[typography.caption, { color: colors.text.secondary }]}
              numberOfLines={1}
            >
              Discussing: {cardQuestion}
            </Text>
          )}
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        {renderChatContent()}

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary.main}
              style={styles.spinner}
            />
            <Text
              style={[typography.caption, { color: colors.text.secondary }]}
            >
              Tutor is thinking...
            </Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[typography.caption, { color: colors.error.main }]}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => setError(null)}
              style={styles.errorDismiss}
            >
              <Text
                style={[typography.caption, { color: colors.primary.main }]}
              >
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask a question..."
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  messageList: {
    paddingVertical: spacing.md,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    marginBottom: spacing.sm,
  },
  errorContainer: {
    backgroundColor: `rgba(239, 68, 68, 0.1)`,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorDismiss: {
    paddingHorizontal: spacing.sm,
  },
  inputArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});

export default TutorChatScreen;
