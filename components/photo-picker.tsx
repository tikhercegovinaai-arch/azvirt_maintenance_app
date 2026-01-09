import React from "react";
import { View, StyleSheet, Pressable, Alert, Image, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "./themed-text";

interface PhotoPickerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoPicker({ photos, onPhotosChange, maxPhotos = 5 }: PhotoPickerProps) {
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Dozvole Potrebne",
        "Molimo dozvolite pristup kameri i galeriji za dodavanje fotografija."
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (photos.length >= maxPhotos) {
      Alert.alert("Limit Dostignut", `Možete dodati maksimalno ${maxPhotos} fotografija.`);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhotos = [...photos, result.assets[0].uri];
        onPhotosChange(newPhotos);
      }
    } catch (error) {
      Alert.alert("Greška", "Nije moguće snimiti fotografiju.");
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (photos.length >= maxPhotos) {
      Alert.alert("Limit Dostignut", `Možete dodati maksimalno ${maxPhotos} fotografija.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhotos = [...photos, result.assets[0].uri];
        onPhotosChange(newPhotos);
      }
    } catch (error) {
      Alert.alert("Greška", "Nije moguće odabrati fotografiju.");
    }
  };

  const removePhoto = (index: number) => {
    Alert.alert("Ukloni Fotografiju", "Da li ste sigurni da želite ukloniti ovu fotografiju?", [
      { text: "Otkaži", style: "cancel" },
      {
        text: "Ukloni",
        style: "destructive",
        onPress: () => {
          const newPhotos = photos.filter((_, i) => i !== index);
          onPhotosChange(newPhotos);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, photos.length >= maxPhotos && styles.buttonDisabled]}
          onPress={pickImageFromCamera}
          disabled={photos.length >= maxPhotos}
        >
          <ThemedText style={styles.buttonText}>📷 Kamera</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, photos.length >= maxPhotos && styles.buttonDisabled]}
          onPress={pickImageFromGallery}
          disabled={photos.length >= maxPhotos}
        >
          <ThemedText style={styles.buttonText}>🖼️ Galerija</ThemedText>
        </Pressable>
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal style={styles.photoScroll} showsHorizontalScrollIndicator={false}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <Pressable style={styles.removeButton} onPress={() => removePhoto(index)}>
                <ThemedText style={styles.removeButtonText}>✕</ThemedText>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <ThemedText style={styles.helperText}>
        {photos.length} / {maxPhotos} fotografija
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#FF9500",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  photoScroll: {
    maxHeight: 120,
  },
  photoContainer: {
    position: "relative",
    marginRight: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF3B30",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
