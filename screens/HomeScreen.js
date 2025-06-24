import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
} from "react-native";

const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [displayGroup, setDisplayGroup] = useState([]);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedGroupToRename, setSelectedGroupToRename] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroup = () => {
    if (displayGroup.includes(groupName.trim())) {
      Alert.alert("Duplicate entry", "Group name already exists.");
      return;
    }

    if (groupName.trim()) {
      setModalVisible(false);
      navigation.navigate("Group", { groupName });
      setGroupName("");
    }
    console.log(displayGroup, groupName);
  };

  const fetchGroupNames = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys(); // ✅ returns all group names
      setDisplayGroup(keys);
      //console.log(keys);
    } catch (error) {
      console.error("Error fetching group names:", error);
    }
  };

  const triggerRename = (groupName) => {
    setSelectedGroupToRename(groupName);
    setNewGroupName(groupName); // prefill input
    setRenameModalVisible(true);
  };

  const handleRename = async () => {
    try {
      if (!newGroupName.trim()) return;

      const oldName = selectedGroupToRename;
      const data = await AsyncStorage.getItem(oldName);

      if (data) {
        await AsyncStorage.setItem(newGroupName, data);
        await AsyncStorage.removeItem(oldName);
        setRenameModalVisible(false);
        setSelectedGroupToRename(null);
        setNewGroupName("");
        fetchGroupNames();
      }
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleDelete = (groupName) => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${groupName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(groupName); // delete from AsyncStorage
              await fetchGroupNames(); // refresh the list
              console.log(`Deleted ${groupName}`);
            } catch (error) {
              console.log("Failed to delete:", error);
            }
          },
        },
        {
          text: "Edit",
          onPress: () => triggerRename(groupName),
        },
      ]
    );
  };

  const handleLoadGroup = async (groupName) => {
    try {
      const jsonValue = await AsyncStorage.getItem(groupName);
      const groupData = JSON.parse(jsonValue);
      navigation.navigate("Group", {
        groupName,
        groupData, // { people, dishes, tax }
        isExistingGroup: true,
      });
    } catch (err) {
      console.error("Failed to load group:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchGroupNames);
    return unsubscribe;
  }, [navigation]);

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
      <Text style={styles.savedGroupsTitle}>Saved Groups:</Text>
      <FlatList
        data={displayGroup}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleLoadGroup(item)}
            onLongPress={() => handleDelete(item)}
            style={styles.groups}
          >
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#000" }}>
              {item} ↗
            </Text>
          </TouchableOpacity>
        )}
      />

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

      <Modal
        visible={renameModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Rename Group</Text>
            <TextInput
              value={newGroupName.trim()}
              onChangeText={setNewGroupName}
              placeholder="Enter new group name"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setRenameModalVisible(false)}
                style={styles.cancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirm} onPress={handleRename}>
                <Text style={styles.confirmText}>Save</Text>
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
  groups: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  savedGroupsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginTop: 30,
    textAlign: "center",
  },
});
