/**
 * AppDialog — Material Design 3 style dialog for native (Android/iOS).
 * Replaces the OS default Alert.alert() which looks outdated.
 * On web, uses window.confirm/alert natively via the caller.
 *
 * Usage:
 *   <AppDialog
 *     visible={showDialog}
 *     title="Reset All Data"
 *     message="This will delete everything."
 *     buttons={[
 *       { label: "Cancel", onPress: () => setShowDialog(false) },
 *       { label: "Reset", style: "destructive", onPress: doReset },
 *     ]}
 *     onDismiss={() => setShowDialog(false)}
 *   />
 */

import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export interface DialogButton {
  label: string;
  onPress: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AppDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  onDismiss?: () => void;
}

export function AppDialog({ visible, title, message, buttons, onDismiss }: AppDialogProps) {
  const colors = useColors();
  const isDark = colors.background === "#1A1A2E" || colors.background?.startsWith("#1");

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* Scrim */}
      <View style={styles.scrim}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onDismiss}
          activeOpacity={1}
        />

        {/* Dialog surface */}
        <View style={[
          styles.dialog,
          {
            backgroundColor: isDark ? "#2A2A3E" : "#FFFFFF",
            shadowColor: "#000",
          }
        ]}>
          {/* Title */}
          <Text style={[styles.titleText, { color: colors.foreground }]}>
            {title}
          </Text>

          {/* Message */}
          {message ? (
            <Text style={[styles.messageText, { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }]}>
              {message}
            </Text>
          ) : null}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }]} />

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            {buttons.map((btn, i) => {
              const isDestructive = btn.style === "destructive";
              const isCancel = btn.style === "cancel";
              const btnColor = isDestructive
                ? "#E91E63"
                : isCancel
                  ? (isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)")
                  : "#E91E63";

              return (
                <TouchableOpacity
                  key={i}
                  onPress={btn.onPress}
                  style={[
                    styles.button,
                    i > 0 && styles.buttonBorder,
                    { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" },
                  ]}
                  activeOpacity={0.6}
                >
                  <Text style={[
                    styles.buttonText,
                    { color: btnColor },
                    isCancel && styles.buttonTextCancel,
                  ]}>
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  divider: {
    height: 1,
  },
  buttonsRow: {
    flexDirection: "row",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBorder: {
    borderLeftWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  buttonTextCancel: {
    fontWeight: "500",
  },
});
