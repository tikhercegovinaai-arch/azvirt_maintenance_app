import { ImageBackground, StyleSheet, View } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface BackgroundImageProps {
  children: React.ReactNode;
}

export function BackgroundImage({ children }: BackgroundImageProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ImageBackground
      source={require("@/assets/images/background.jpg")}
      style={styles.background}
      imageStyle={styles.image}
    >
      {/* Overlay for readability */}
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(255, 255, 255, 0.85)",
          },
        ]}
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  image: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});
