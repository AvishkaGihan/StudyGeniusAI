import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { Text, Divider } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../store";
import { logger } from "../../services/logger";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

interface PreferencesSetting {
  id: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const PreferencesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Redux state
  const { user } = useAppSelector((state) => state.auth);

  // Local state for preferences
  const [isLoading, setIsLoading] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoGenerateCards, setAutoGenerateCards] = useState(false);

  // Load preferences from storage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Load preferences from AsyncStorage or API
  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Load from AsyncStorage or API
      // const prefs = await getPreferences();
      logger.info("Preferences loaded");
    } catch (error) {
      logger.error("Failed to load preferences", {
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preference to storage
  const savePreference = useCallback(async (key: string, value: boolean) => {
    try {
      // TODO: Save to AsyncStorage or API
      // await updatePreference(key, value);
      logger.info("Preference updated", { key, value });
    } catch (error) {
      logger.error("Failed to save preference", {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
      Alert.alert("Error", "Failed to save preference. Please try again.");
    }
  }, []);

  // Handle cloud sync toggle
  const handleCloudSyncToggle = useCallback(
    (value: boolean) => {
      if (value && !user) {
        Alert.alert(
          "Authentication Required",
          "You need to be signed in to enable cloud sync."
        );
        return;
      }
      setCloudSyncEnabled(value);
      savePreference("cloudSync", value);
    },
    [user, savePreference]
  );

  // Handle notifications toggle
  const handleNotificationsToggle = useCallback(
    (value: boolean) => {
      setNotificationsEnabled(value);
      savePreference("notifications", value);
    },
    [savePreference]
  );

  // Handle dark mode toggle
  const handleDarkModeToggle = useCallback(
    (value: boolean) => {
      setDarkModeEnabled(value);
      savePreference("darkMode", value);
      // TODO: Apply theme change to app
    },
    [savePreference]
  );

  // Handle auto generate cards toggle
  const handleAutoGenerateToggle = useCallback(
    (value: boolean) => {
      setAutoGenerateCards(value);
      savePreference("autoGenerateCards", value);
    },
    [savePreference]
  );

  // Handle reset preferences
  const handleResetPreferences = useCallback(() => {
    Alert.alert(
      "Reset Preferences",
      "Are you sure you want to reset all preferences to default values?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              setIsLoading(true);
              // TODO: Reset preferences via API
              setCloudSyncEnabled(false);
              setNotificationsEnabled(true);
              setDarkModeEnabled(true);
              setAutoGenerateCards(false);
              logger.info("Preferences reset to defaults");
              Alert.alert("Success", "Preferences have been reset.");
            } catch (error) {
              logger.error("Failed to reset preferences", {
                message: error instanceof Error ? error.message : String(error),
              });
              Alert.alert(
                "Error",
                "Failed to reset preferences. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  }, []);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={typography.h2}>Preferences</Text>
        <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
          Customize your app experience
        </Text>
      </View>

      {/* Study Settings Section */}
      <View style={styles.section}>
        <Text style={[typography.h3, styles.sectionTitle]}>Study Settings</Text>

        <PreferenceItem
          label="Dark Mode"
          description="Use dark theme throughout the app"
          value={darkModeEnabled}
          onToggle={handleDarkModeToggle}
        />

        <Divider style={styles.divider} />

        <PreferenceItem
          label="Auto-Generate Cards"
          description="Automatically generate cards from OCR text without review"
          value={autoGenerateCards}
          onToggle={handleAutoGenerateToggle}
        />
      </View>

      {/* Sync & Data Section */}
      <View style={styles.section}>
        <Text style={[typography.h3, styles.sectionTitle]}>Sync & Data</Text>

        <PreferenceItem
          label="Cloud Sync"
          description="Sync your decks and progress across devices"
          value={cloudSyncEnabled}
          onToggle={handleCloudSyncToggle}
          disabled={!user}
        />

        {cloudSyncEnabled && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.infoBox}>
              <Text
                style={[typography.caption, { color: colors.text.secondary }]}
              >
                ✓ Your data is encrypted and synced securely to Supabase
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[typography.h3, styles.sectionTitle]}>Notifications</Text>

        <PreferenceItem
          label="Study Reminders"
          description="Get daily reminders to review due cards"
          value={notificationsEnabled}
          onToggle={handleNotificationsToggle}
        />

        <Divider style={styles.divider} />

        <Text
          style={[
            typography.bodySmall,
            {
              color: colors.text.tertiary,
              marginTop: spacing.sm,
            },
          ]}
        >
          You can manage notification permissions in your device settings.
        </Text>
      </View>

      {/* Advanced Section */}
      <View style={styles.section}>
        <Text style={[typography.h3, styles.sectionTitle]}>Advanced</Text>

        <TouchableOpacity style={styles.advancedButton}>
          <View style={styles.advancedButtonContent}>
            <View>
              <Text
                style={[typography.bodyLarge, { color: colors.text.primary }]}
              >
                Cache Management
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: colors.text.secondary, marginTop: spacing.xs },
                ]}
              >
                Clear cached images and data
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.text.tertiary }]}>
              ~24 MB
            </Text>
          </View>
        </TouchableOpacity>

        <Divider style={styles.divider} />

        <TouchableOpacity style={styles.advancedButton}>
          <View style={styles.advancedButtonContent}>
            <View>
              <Text
                style={[typography.bodyLarge, { color: colors.text.primary }]}
              >
                Export Data
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: colors.text.secondary, marginTop: spacing.xs },
                ]}
              >
                Download all your decks as JSON
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.text.tertiary }]}>
              →
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Reset Section */}
      <View style={[styles.section, styles.dangerZone]}>
        <Text style={[typography.h3, styles.sectionTitle]}>Reset</Text>

        <TouchableOpacity
          style={[styles.button, styles.destructiveButton]}
          onPress={handleResetPreferences}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.error.contrast} size="small" />
          ) : (
            <Text style={[typography.button, { color: colors.error.contrast }]}>
              Reset All Preferences
            </Text>
          )}
        </TouchableOpacity>

        <Text
          style={[
            typography.bodySmall,
            {
              color: colors.text.tertiary,
              marginTop: spacing.sm,
              textAlign: "center",
            },
          ]}
        >
          This will reset all app preferences to default values
        </Text>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text
          style={[
            typography.caption,
            {
              color: colors.text.tertiary,
              textAlign: "center",
            },
          ]}
        >
          Changes are saved automatically
        </Text>
      </View>
    </ScrollView>
  );
};

/**
 * PreferenceItem Component
 * Reusable preference toggle with label and description
 */
interface PreferenceItemProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

const PreferenceItem: React.FC<PreferenceItemProps> = ({
  label,
  description,
  value,
  onToggle,
  disabled = false,
}) => {
  return (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceContent}>
        <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>
          {label}
        </Text>
        <Text
          style={[
            typography.bodySmall,
            {
              color: colors.text.secondary,
              marginTop: spacing.xs,
            },
          ]}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{
          false: colors.surface.border,
          true: colors.primary.light,
        }}
        thumbColor={value ? colors.primary.main : colors.text.tertiary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  section: {
    backgroundColor: colors.surface.main,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  preferenceContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
    backgroundColor: colors.divider,
  },
  advancedButton: {
    paddingVertical: spacing.md,
  },
  advancedButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoBox: {
    backgroundColor: `rgba(20, 184, 166, 0.1)`,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success.main,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  destructiveButton: {
    backgroundColor: colors.error.main,
  },
  dangerZone: {
    borderColor: colors.error.main,
  },
  infoSection: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
});

export default PreferencesScreen;
