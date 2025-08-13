import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const LoadingScreen = () => {
  const loadingText = ['Loading... ',
    "Cooking special Itinerary ....... ",
    "Finalizing your travel plans ....... ",
    "EXCITING! Your travel plans are almost ready ....... ",
    "Exploring the best places....",
    "Almost there ....... ",

  ];
  const [currentText, setCurrentText] = React.useState(loadingText[0]);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText(prev => {
        const currentIndex = loadingText.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingText.length;
        return loadingText[nextIndex];
      });
    }, 5000); 

    return () => clearInterval(interval);
  }, []);
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
       <ActivityIndicator size="large" color="#eca217ff" />
       <Text style={{fontSize: 20, color: '#ff951cff'}}>
        {currentText}
       </Text>
    </View>
  )
}

export default LoadingScreen