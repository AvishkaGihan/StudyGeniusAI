import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import store from "./store";
import { RootNavigator } from "./navigation/RootNavigator";
import { darkTheme } from "./theme/darkTheme";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { logger } from "./services/logger";

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Log app initialization
        logger.info("App initialization started", {
          timestamp: new Date().toISOString(),
        });

        // Perform any async initialization here
        // For example: restore user session, load cached data, etc.

        // Simulate a short delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        logger.info("App initialization completed");
      } catch (e) {
        logger.error("App initialization error", {
          error: e instanceof Error ? e.message : "Unknown error",
        });
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Provider store={store}>
            <PaperProvider theme={darkTheme}>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </PaperProvider>
          </Provider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
