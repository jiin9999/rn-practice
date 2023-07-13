import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

const STORAGE_KEY = "@todos";
const TAB_STATE = "@tabState";
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState({});

  const travel = async () => {
    await AsyncStorage.setItem(TAB_STATE, "false");
    setWorking(false);
  };

  const work = async () => {
    await AsyncStorage.setItem(TAB_STATE, "true");
    setWorking(true);
  };

  const loadTodos = async () => {
    try {
      const persistTodos = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedTodos = persistTodos ? JSON.parse(persistTodos) : {};
      setTodos(parsedTodos);
    } catch (e) {
      console.log(e);
    }
  };

  const loadHeaderTabState = async () => {
    try {
      const persistTabState = await AsyncStorage.getItem(TAB_STATE);
      const parsedTabState = persistTabState ? persistTabState : true;
      parsedTabState === "false" ? setWorking(false) : setWorking(true);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadHeaderTabState();
    loadTodos();
  }, []);

  const addTodo = async () => {
    if (text === "") {
      return;
    }
    const newTodos = { ...todos, [Date.now()]: { text, working } };
    setTodos(newTodos);
    saveTodos(newTodos);
    setText("");
  };

  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    const persistTodos = await AsyncStorage.getItem(STORAGE_KEY);
  };

  const deleteTodo = (key) => {
    Alert.alert("Todo를 삭제하시겠습니까?", todos[key].text, [
      { text: "Cancel" },
      {
        text: "OK",
        style: "destructive",
        onPress: () => {
          const newTodos = { ...todos };
          delete newTodos[key];
          setTodos(newTodos);
          saveTodos(newTodos);
        },
      },
    ]);
  };

  const onChangeText = (payload) => setText(payload);
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work} activeOpacity={0.5}>
          <Text
            style={{
              ...styles.buttonText,
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={travel} ctiveOpacity={0.5}>
          <Text
            style={{
              ...styles.buttonText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addTodo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(todos).map((key) =>
          todos[key].working === working ? (
            <View style={styles.todo} key={key}>
              <Text style={styles.todoText}>{todos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteTodo(key)}>
                <Fontisto name="trash" size={20} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  buttonText: {
    fontSize: 40,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  todo: {
    backgroundColor: theme.todoBackground,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
