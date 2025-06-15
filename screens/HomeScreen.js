import { useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";

const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      setModalVisible(false);
      navigation.navigate("Group", { groupName });
      setGroupName("");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/favicon.png")} // make sure you have a logo.png
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.slogan}>Split smarter. Stress less. 💸</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Start Splitting</Text>
      </TouchableOpacity>

      {/* Rename Modal */}
      <Modal transparent animationType="slide" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Name Your Group</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Goa Trip"
              value={groupName}
              onChangeText={setGroupName}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirm} onPress={handleCreateGroup}>
                <Text style={styles.confirmText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffdf7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 10,
  },
  slogan: {
    fontSize: 18,
    color: "#444",
    marginBottom: 50,
    fontWeight: "600",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#3D5CFF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
    shadowColor: "#3D5CFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancel: {
    padding: 10,
  },
  cancelText: {
    color: "#888",
    fontWeight: "600",
  },
  confirm: {
    backgroundColor: "#3D5CFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
