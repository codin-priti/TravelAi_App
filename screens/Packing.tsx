import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  Keyboard,
  SafeAreaView
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Icon from "react-native-vector-icons/MaterialIcons";

type RootStackParamList = {
  PackingList: { destination: string }; 
};

type PackingRouteProp = RouteProp<RootStackParamList, 'PackingList'>;

type PackingItem = {
  id: string;
  text: string;
  packed: boolean;
  editing?: boolean;
  isCategory?: boolean;
};

const API_KEY = "AIzaSyAKXfQp4WXEFlLLnwjv-Q91BKez45KGjBQ";
const MODEL_NAME = "gemini-2.5-pro";

const PackingListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PackingRouteProp>();

  const destination = route.params?.destination || "your destination";
  
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);

  useEffect(() => {
    const fetchPackingList = async () => {
      try {
        setLoading(true);
        const ai = new GoogleGenerativeAI(API_KEY);
        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        
        const prompt = `
You are a travel assistant. Suggest a detailed packing list for a trip to ${destination}.
Include categories like:
- Clothing (considering local climate & culture)
- Footwear
- Accessories
- Electronics
- Documents
- Toiletries & health items
- Miscellaneous travel essentials

Return only the items as bullet points without category headings.
        `;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        
        const items = text.split('\n')
          .filter(line => 
            line.trim() !== "" && 
            !line.toLowerCase().includes("packing list") &&
            !line.toLowerCase().includes("note:") &&
            !line.toLowerCase().includes("category:") &&
            !line.match(/^[A-Z\s]+:$/) 
          )
          .map(line => line.replace(/[#*•-]/g, '').trim())
          .filter(line => line.length > 0)
          .map((line, index) => ({
            id: `item-${Date.now()}-${index}`,
            text: line,
            packed: false
          }));
        
        setPackingList(items);
        setError("");
      } catch (err) {
        console.error("Error fetching packing list:", err);
        setError("Failed to load packing list. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackingList();
  }, [destination]);

  const togglePacked = (id: string) => {
    setPackingList(prevList => 
      prevList.map(item => 
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const startEditing = (item: PackingItem) => {
    setEditingItem(item);
  };

  const saveEdit = (text: string) => {
    if (editingItem) {
      setPackingList(prevList => 
        prevList.map(item => 
          item.id === editingItem.id ? { ...item, text } : item
        )
      );
      setEditingItem(null);
      Keyboard.dismiss();
    }
  };

  const addNewItem = () => {
    const newItem: PackingItem = {
      id: `item-${Date.now()}`,
      text: "New item",
      packed: false,
      editing: true
    };
    setPackingList(prev => [...prev, newItem]);
    setEditingItem(newItem);
  };

  const deleteItem = (id: string) => {
    setPackingList(prevList => prevList.filter(item => item.id !== id));
  };

  const packedCount = packingList.filter(item => item.packed).length;
  const progress = packingList.length > 0 
    ? Math.round((packedCount / packingList.length) * 100) 
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color="#ff6f00" />
        <Text style={styles.loadingText}>Creating your packing list...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ff6f00" />
        </TouchableOpacity>
        <Text style={styles.title}>Packing for {destination}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{progress}% packed</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.countText}>
          {packedCount} of {packingList.length} items packed
        </Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>

      {packingList.length > 0 ? (
        <FlatList
          data={packingList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, item.packed && styles.checkedBox]}
                onPress={() => togglePacked(item.id)}
              >
                {item.packed && <Icon name="check" size={18} color="#fff" />}
              </TouchableOpacity>

              {editingItem?.id === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={item.text}
                  onChangeText={(text) => saveEdit(text)}
                  autoFocus={true}
                  onSubmitEditing={() => saveEdit(item.text)}
                  onBlur={() => setEditingItem(null)}
                />
              ) : (
                <TouchableOpacity 
                  style={styles.textContainer}
                  onPress={() => togglePacked(item.id)}
                  onLongPress={() => startEditing(item)}
                >
                  <Text 
                    style={[
                      styles.itemText,
                      item.packed && styles.packedText
                    ]}
                    numberOfLines={2}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteItem(item.id)}
              >
                <Icon name="delete-outline" size={22} color="#ff6f00" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="luggage" size={60} color="#ffcc80" />
          <Text style={styles.emptyText}>Your packing list is empty</Text>
          <Text style={styles.emptySubtext}>Add items to get started</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Itinerary</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    paddingHorizontal: 16,
    paddingTop: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#ff6f00",
    flex: 1
  },
  progressContainer: {
    backgroundColor: '#fff8f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6f00',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#ffccbc',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6f00',
    borderRadius: 6,
  },
  countText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6f00',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff6f00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: '#ff6f00',
    borderColor: '#ff6f00',
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  packedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff8f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  loading: {
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 20,
    color: "#ff6f00",
    fontSize: 18
  },
  button: {
    backgroundColor: "#ff6f00",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20
  },
});

export default PackingListScreen;
