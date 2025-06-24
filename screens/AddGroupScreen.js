import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

const AddGroupScreen = ({ route, navigation }) => {
  const { groupName, groupData, isExistingGroup } = route.params || {};

  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState("");
  const [editingPersonIndex, setEditingPersonIndex] = useState(null);

  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [editingDishIndex, setEditingDishIndex] = useState(null);

  const [tax, setTax] = useState("");

  const handleAddPerson = () => {
    if (!newPerson.trim()) {
      Alert.alert("Invalid input", "Name cannot be empty.");
      return;
    }

    if (people.includes(newPerson.trim())) {
      Alert.alert("Duplicate entry", "Person already added.");
      return;
    }

    if (editingPersonIndex !== null) {
      const updatedPeople = [...people];
      updatedPeople[editingPersonIndex] = newPerson.trim();
      setPeople(updatedPeople);
      setEditingPersonIndex(null);
    } else {
      setPeople([...people, newPerson.trim()]);
    }
    setNewPerson("");
  };

  const togglePersonSelection = (person) => {
    if (selectedPeople.includes(person)) {
      setSelectedPeople(selectedPeople.filter((p) => p !== person));
    } else {
      setSelectedPeople([...selectedPeople, person]);
    }
  };

  const handleAddDish = () => {
    if (!dishName || !dishPrice || selectedPeople.length === 0) {
      Alert.alert(
        "Missing Info",
        "Please fill all fields and select at least one person."
      );
      return;
    }
    if (dishPrice <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price amount.");
      return;
    }

    const newDish = {
      name: dishName.trim(),
      price: parseFloat(dishPrice),
      sharedBy: [...selectedPeople],
    };

    if (editingDishIndex !== null) {
      const updatedDishes = [...dishes];
      updatedDishes[editingDishIndex] = newDish;
      setDishes(updatedDishes);
      setEditingDishIndex(null);
    } else {
      setDishes([...dishes, newDish]);
    }

    setDishName("");
    setDishPrice("");
    setSelectedPeople([]);
  };

  const handleGenerateSplit = async () => {
    if (dishes.length === 0) {
      Alert.alert(
        "No Dishes Added",
        "Please add at least one dish to proceed."
      );
      return;
    }

    if (tax < 0) {
      Alert.alert("Invalid Tax/Tip", "Please enter a valid tax/tip amount.");
      return;
    }

    navigation.navigate("Summary", {
      people,
      dishes,
      tax: parseFloat(tax) || 0,
      groupName,
    });

    await AsyncStorage.setItem(
      groupName,
      JSON.stringify({
        people,
        dishes,
        tax,
        lastUpdated: new Date().toISOString(),
      })
    );
    const values = await AsyncStorage.getItem(groupName);
    const value = JSON.parse(values);
  };

  const promptEditOrDeletePerson = (index) => {
    Alert.alert(
      "Modify Person",
      `What would you like to do with "${people[index]}"?`,
      [
        {
          text: "Edit",
          onPress: () => {
            setNewPerson(people[index]);
            setEditingPersonIndex(index);
          },
        },
        {
          text: "Delete",
          onPress: () => {
            const updated = [...people];
            updated.splice(index, 1);
            setPeople(updated);
            setSelectedPeople(
              selectedPeople.filter((p) => p !== people[index])
            );
          },
          style: "destructive",
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const promptEditOrDeleteDish = (index) => {
    const dish = dishes[index];
    Alert.alert(
      "Modify Dish",
      `What would you like to do with "${dish.name}"?`,
      [
        {
          text: "Edit",
          onPress: () => {
            setDishName(dish.name);
            setDishPrice(String(dish.price));
            setSelectedPeople(dish.sharedBy);
            setEditingDishIndex(index);
          },
        },
        {
          text: "Delete",
          onPress: () => {
            const updated = [...dishes];
            updated.splice(index, 1);
            setDishes(updated);
          },
          style: "destructive",
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  useEffect(() => {
    if (isExistingGroup && groupData) {
      setPeople(groupData.people || []);
      setDishes(groupData.dishes || []);
      setTax(groupData.tax || 0);
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Group: {groupName}</Text>

      {/* Add Person */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter name"
          value={newPerson}
          onChangeText={setNewPerson}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAddPerson} style={styles.addButton}>
          <Text style={styles.addButtonText}>
            {editingPersonIndex !== null ? "Update" : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Person Tags */}
      <View style={styles.tagContainer}>
        {people.map((person, index) => (
          <TouchableOpacity
            key={index}
            onLongPress={() => promptEditOrDeletePerson(index)}
            style={styles.tag}
          >
            <Text style={styles.tagText}>{person}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dish Inputs */}
      <Text style={styles.sectionTitle}>Add Dish</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Dish name"
          value={dishName}
          onChangeText={setDishName}
          style={styles.input}
        />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Price"
          value={dishPrice}
          onChangeText={setDishPrice}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      <Text style={styles.sectionTitle}>Select People Sharing This Dish:</Text>
      <View style={styles.tagContainer}>
        {people.map((person, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => togglePersonSelection(person)}
            style={[
              styles.tag,
              selectedPeople.includes(person) && styles.selectedTag,
            ]}
          >
            <Text
              style={[
                styles.tagText,
                selectedPeople.includes(person) && styles.selectedTagText,
              ]}
            >
              {person}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addDishButton} onPress={handleAddDish}>
        <Text style={styles.addDishButtonText}>
          {editingDishIndex !== null ? "Update Dish" : "Add Dish"}
        </Text>
      </TouchableOpacity>

      {dishes.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Added Dishes:</Text>
          {dishes.map((dish, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dishCard}
              onLongPress={() => promptEditOrDeleteDish(index)}
            >
              <Text style={{ fontWeight: "bold" }}>
                {dish.name} - ₹{dish.price}
              </Text>
              <Text style={{ color: "#444" }}>
                Shared by: {dish.sharedBy.join(", ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Optional Tip/Tax Input */}
      <Text style={styles.sectionTitle}>Tip / Tax (Optional)</Text>
      <TextInput
        placeholder="e.g. 50"
        value={tax}
        onChangeText={setTax}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateSplit}
      >
        <Text style={styles.generateButtonText}>Generate Split</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddGroupScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "#e0f0ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: "flex-start",
    marginRight: 10,
  },
  tagText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  selectedTag: {
    backgroundColor: "#007AFF",
  },
  selectedTagText: {
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  addDishButton: {
    backgroundColor: "#28a745",
    padding: 12,
    marginTop: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  addDishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dishCard: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  generateButton: {
    backgroundColor: "#ff6f00",
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
("");
