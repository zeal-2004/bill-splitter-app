import { Share } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

const SummaryScreen = ({ route }) => {
  const { people, dishes, tax, groupName } = route.params;
  // Split logic
  const personTotals = {};

  people.forEach((person) => {
    personTotals[person] = { total: 0, dishes: [] };
  });

  dishes.forEach((dish) => {
    const share = dish.price / dish.sharedBy.length;
    dish.sharedBy.forEach((person) => {
      personTotals[person].total += share;
      personTotals[person].dishes.push(dish.name);
    });
  });

  // Distribute tip equally among participants
  if (tax > 0 && people.length > 0) {
    const taxShare = tax / people.length;
    people.forEach((person) => {
      if (personTotals[person].total != 0)
        personTotals[person].total += taxShare;
    });
  }

  const summaryLines = Object.entries(personTotals)
    .filter(([_, info]) => info.total > 0 || info.dishes.length > 0)
    .map(([person, info]) => {
      const dishList = [...new Set(info.dishes)].join(", ");
      return `${person}\nOwes: ₹${info.total.toFixed(2)}\nShared: ${dishList}`;
    });

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: groupName + "\n\n" + summaryLines.join("\n\n"),
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
        } else {
          // Shared
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share summary.");
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{groupName}</Text>

      {summaryLines.map((line, index) => (
        <View key={index} style={styles.summaryBox}>
          <Text style={styles.summaryText}>{line}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.copyButton} onPress={handleShare}>
        <Text style={styles.copyButtonText}>Share Summary</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SummaryScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
  },
  copyButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  summaryCard: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007B55",
    marginVertical: 4,
  },
  dishStyle: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
});
