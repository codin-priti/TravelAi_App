import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import LoadingScreen from './loading';

type RootStackParamList = {
  Home: undefined;
  Detail: {
    itinerary: string;
    isLoading: boolean;
    destination: string;
  };
  PackingList: {
    destination: string;
  };
};

type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

type ItineraryDay = {
  day: string;
  details: { text: string; isHighlight: boolean }[];
};

const parseItinerary = (text: string): ItineraryDay[] => {
  const formattedText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '');

  const lines = formattedText.split('\n');
  const result: ItineraryDay[] = [];
  const dayPattern = /day\s*\d+/i;  // Fixed: Define pattern separately

  let currentDay = '';
  let currentDetails: { text: string; isHighlight: boolean }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (dayPattern.test(trimmed)) {  // Fixed: Proper regex test syntax
      if (currentDay && currentDetails.length > 0) {
        result.push({ day: currentDay, details: currentDetails });
        currentDetails = [];
      }
      currentDay = trimmed;
    } else if (trimmed !== '') {
      const isHighlight =
        trimmed.toLowerCase().includes('important') ||
        trimmed.toLowerCase().includes('caution') ||
        trimmed.toLowerCase().includes('tip');

      currentDetails.push({ text: trimmed, isHighlight });
    }
  }

  if (currentDay && currentDetails.length > 0) {
    result.push({ day: currentDay, details: currentDetails });
  }

  return result;
};

const Detail: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DetailRouteProp>();
  const { itinerary, isLoading, destination } = route.params;

  const parsedItinerary = parseItinerary(itinerary);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>{'< '}</Text>
            </TouchableOpacity>
            <Text style={styles.heading}>Itinerary Details</Text>
          </View>

          <FlatList
            data={parsedItinerary}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.dayContainer}>
                <Text style={styles.dayTitle}>{item.day}</Text>
                {item.details.map((detail, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.itineraryDetail,
                      detail.isHighlight && styles.highlightedDetail
                    ]}
                  >
                    {detail.text}
                  </Text>
                ))}
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No itinerary details available
              </Text>
            }
          />
          
          <TouchableOpacity
            style={styles.packingButton}
            onPress={() => navigation.navigate("PackingList", { destination })}
          >
            <Text style={styles.packingButtonText}>Generate Packing List</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'orange',
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ff9a16',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  backButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  listContent: {
    padding: 10,
    flexGrow: 1,
  },
  dayContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e65100',
  },
  itineraryDetail: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  highlightedDetail: {
    fontWeight: 'bold',
    color: '#c62828',
    backgroundColor: '#ffe0e0',
    padding: 5,
    borderRadius: 4,
  },
  packingButton: {
    backgroundColor: '#ff6f00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
    marginBottom: 20,
  },
  packingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    marginTop: 20,
  }
});

export default Detail;
