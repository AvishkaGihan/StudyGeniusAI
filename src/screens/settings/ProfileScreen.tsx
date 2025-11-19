import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Divider } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { logger } from "../../services/logger";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

interface ProfileSection {
  label: string;
  value: string;
  editable?: boolean;
}

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Redux state
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState(user?.email || "");

  // Handle logout
  const handleLogout = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            setIsLoading(true);
            dispatch(logout());
            logger.info("User logged out", { userId: user?.id });
          } catch (error) {
            logger.error("Logout failed", {
              message: error instanceof Error ? error.message : String(error),
            });
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  }, [dispatch, user?.id]);

  // Handle save profile
  const handleSaveProfile = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email cannot be empty.");
      return;
    }

    if (email === user?.email) {
      setEditMode(false);
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implement updateProfile API call
      // await updateUserProfile({ email });
      logger.info("Profile updated", { userId: user?.id });
      Alert.alert("Success", "Profile updated successfully.");
      setEditMode(false);
    } catch (error) {
      logger.error("Profile update failed", {
        message: error instanceof Error ? error.message : String(error),
      });
      Alert.alert("Error", "Failed to update profile. Please try again.");
      // Reset email on error
      setEmail(user?.email || "");
    } finally {
      setIsLoading(false);
    }
  }, [email, user?.email, user?.id]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEmail(user?.email || "");
    setEditMode(false);
  }, [user?.email]);

  if (authLoading) {
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

  if (!user) {
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
        <Text style={typography.bodyLarge}>Not authenticated</Text>
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
        <Text style={typography.h2}>Profile</Text>
        <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
          Manage your account
        </Text>
      </View>

      {/* Profile Information Section */}
      <View style={styles.section}>
        <Text style={[typography.h3, styles.sectionTitle]}>
          Account Information
        </Text>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text
            style={[typography.bodySmall, { color: colors.text.secondary }]}
          >
            Email Address
          </Text>
          {editMode ? (
            <View style={styles.inputContainer}>
              <Text style={[typography.bodyLarge, styles.editableField]}>
                {email}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.text.tertiary, marginTop: spacing.xs },
                ]}
              >
                Email editing coming soon
              </Text>
            </View>
          ) : (
            <Text style={[typography.bodyLarge, styles.fieldValue]}>
              {user.email}
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* User ID Field (Read-only) */}
        <View style={styles.fieldContainer}>
          <Text
            style={[typography.bodySmall, { color: colors.text.secondary }]}
          >
            User ID
          </Text>
          <Text
            style={[typography.caption, { color: colors.text.tertiary }]}
            numberOfLines={1}
          >
            {user.id}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Member Since */}
        <View style={styles.fieldContainer}>
          <Text
            style={[typography.bodySmall, { color: colors.text.secondary }]}
          >
            Member Since
          </Text>
          <Text style={[typography.bodyLarge, styles.fieldValue]}>
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {editMode ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={colors.primary.contrast}
                  size="small"
                />
              ) : (
                <Text
                  style={[
                    typography.button,
                    { color: colors.primary.contrast },
                  ]}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleCancelEdit}
              disabled={isLoading}
            >
              <Text
                style={[typography.button, { color: colors.secondary.main }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setEditMode(true)}
              disabled={authLoading || isLoading}
            >
              <Text
                style={[typography.button, { color: colors.secondary.main }]}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, styles.dangerZone]}>
        <Text style={[typography.h3, styles.sectionTitle]}>Danger Zone</Text>

        <TouchableOpacity
          style={[styles.button, styles.destructiveButton]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.error.contrast} size="small" />
          ) : (
            <Text style={[typography.button, { color: colors.error.contrast }]}>
              Sign Out
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
          You'll be signed out of your account
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
          StudyGenius AI v1.0.0
        </Text>
      </View>
    </ScrollView>
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
  fieldContainer: {
    marginVertical: spacing.sm,
  },
  fieldValue: {
    marginTop: spacing.xs,
    color: colors.text.primary,
  },
  editableField: {
    marginTop: spacing.xs,
    color: colors.text.primary,
    backgroundColor: colors.surface.active,
    padding: spacing.sm,
    borderRadius: 8,
  },
  inputContainer: {
    marginTop: spacing.xs,
  },
  divider: {
    marginVertical: spacing.md,
    backgroundColor: colors.divider,
  },
  actionsSection: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.secondary.main,
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

export default ProfileScreen;
