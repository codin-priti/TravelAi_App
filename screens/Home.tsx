import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { NavigationProp } from "@react-navigation/native";
import LoadingScreen from "./loading";

const API_KEY = "AIzaSyAKXfQp4WXEFlLLnwjv-Q91BKez45KGjBQ";
const MODEL_NAME = "gemini-2.5-pro";

type FormData = {
  name: string;
  startingPlace: string;
  destination: string;
  duration: string;
  budget: string;
};
type RootStackParamList = {
  Home: undefined;
  Detail: {
    itinerary: string;
    isLoading: boolean;
  };
  PackingList: {
    destination: string;
  };
};

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenerativeAI(API_KEY);
      const model = ai.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `
Name: ${data.name}
Starting Place: ${data.startingPlace}
Destination: ${data.destination}
Duration: ${data.duration} days
Budget: ${data.budget} INR
Generate a detailed, day-wise travel itinerary for visiting [Destination] for [Duration] days.
Ensure the plan is well-balanced and tourist-friendly. For each day, include:

🗓️ Daily Itinerary
Morning: Popular tourist attraction (include why it's famous)

Afternoon: Local hidden gem or cultural experience (with unique details)

Evening: Relaxing or entertaining activity (markets, viewpoints, or shows)

Local Foods to Try: 1–2 authentic dishes with brief description

🏨 Hotel Suggestions
Recommend 3 options: Budget, Mid-range, Luxury

Mention location, key features, and proximity to major spots

🚗 Travel & Transport
Nearest airport/railway and how to reach the city

Best local transport methods (metro, auto, rental)

⚠️ Travel Tips
Safety precautions, cultural etiquette, and weather/clothing advice

Mobile connectivity and health/sanitation notes

Make sure to format the itinerary in a clear, day-wise structure with headings for each section. Use bullet points for easy readability. Avoid using hashtags or markdown formatting.

      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log("Generated itinerary:", responseText);

      navigation.navigate("Detail", {
        itinerary: responseText,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Error generating content:", error);
      if (error?.message?.includes("503")) {
        alert(
          "The AI service is overloaded. Please try again in a few minutes."
        );
      } else {
        alert("Error generating content: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
        <Image
            source={require("../assets/Travel.jpg")}
            style={{
              width: 200,
              height: 190,
              alignSelf: "center",
              marginBottom: 20,
              resizeMode: "contain",
            }}
          />
          <Text style={styles.title}> Lets Go Travel...✈️🧳</Text>
          

          <Controller
            control={control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && (
            <Text style={styles.error}>{errors.name.message}</Text>
          )}

          <Controller
            control={control}
            name="startingPlace"
            rules={{ required: "Starting place is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Starting Place"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.startingPlace && (
            <Text style={styles.error}>{errors.startingPlace.message}</Text>
          )}

          <Controller
            control={control}
            name="destination"
            rules={{ required: "Destination is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Destination"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.destination && (
            <Text style={styles.error}>{errors.destination.message}</Text>
          )}

          <Controller
            control={control}
            name="duration"
            rules={{ required: "Duration is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Duration (days)"
                keyboardType="numeric"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.duration && (
            <Text style={styles.error}>{errors.duration.message}</Text>
          )}

          <Controller
            control={control}
            name="budget"
            rules={{ required: "Budget is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Budget (INR)"
                keyboardType="numeric"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.budget && (
            <Text style={styles.error}>{errors.budget.message}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Generate Itinerary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("PackingList", { destination: "your destination" })}
          >
            <Text style={styles.buttonText}>Go to Packing List</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#ffffffff",
  },
  button: {
    backgroundColor: "#ff6f00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#ff8f00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#ff6f00",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ffcc80",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  error: {
    color: "#d32f2f",
    marginBottom: 10,
    fontSize: 13,
    marginLeft: 4,
  },
});
