import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const API_KEY = "";

const icons = {
  Clear: "day-sunny",
  Clouds: "cloudy",
  Rain: "rains",
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // 추가된 부분
  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    Location.setGoogleApiKey("");
    const location = await Location.reverseGeocodeAsync(
      {
        latitude,
        longitude,
      },
      { useGoogleMaps: false }
    );

    setIsLoading(true);

    setCity(location[0].region);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    setDays(
      json.list.filter((weather) => {
        if (weather.dt_txt.includes("00:00:00")) {
          return weather;
        }
      })
    );

    setIsLoading(false); // 로딩 상태 해제
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      {isLoading ? ( // 로딩 상태에 따른 화면 표시
        <ActivityIndicator style={styles.loader} size="large" color="#000000" />
      ) : (
        <View style={styles.weatherBox}>
          <ScrollView
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weather}
          >
            {days.map((day, index) => (
              <View key={index} style={styles.day}>
                <Text>{day.dt_txt.split(" ")[0]}</Text>
                <Text style={styles.temp}>
                  {parseFloat(day.main.temp).toFixed(1)}
                </Text>
                <View style={styles.descriptionBox}>
                  <Text style={styles.description}>{day.weather[0].main}</Text>
                  <Fontisto
                    name={icons[day.weather[0].main]}
                    size={30}
                    color="black"
                  />
                </View>

                <Text style={styles.tinyText}>
                  {day.weather[0].description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD503",
  },
  city: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 68,
    fontWeight: "500",
  },
  weatherBox: {
    flex: 4,
  },
  day: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  temp: {
    fontSize: 178,
  },
  descriptionBox: {
    flexDirection: "row",
  },
  description: {
    fontSize: 60,
  },
});
