import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Detail from './screens/Detail';
import Home from './screens/Home';
import PackingListScreen from './screens/Packing';

export type RootStackParamList = {
  Home: undefined;
  Detail: {
    itinerary: string;
    isLoading: boolean;
  };
  PackingList: {
    destination: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Detail" component={Detail} />
        <Stack.Screen name="PackingList" component={PackingListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
