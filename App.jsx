import { StyleSheet, Text, View, ScrollView, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Home from "./src/screens/Home";
import Settings from "./src/screens/Settings";
import Diagnosis from "./src/screens/Diagnosis";
import HeaderText from "./src/components/HeaderText";

export default function App() {
  const [fontsAreLoaded] = useFonts({
    SemiBold: require("./assets/fonts/IBMPlexSansThai-Medium.ttf"),
  });

  return (
    <>
      {fontsAreLoaded && (
        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName="Home"
            options={{ drawerActiveTintColor: "#FB6E90" }}
          >
            <Drawer.Screen
              name="home"
              component={Home}
              title="ใกล้หมอ"
              options={{
                headerTitle: () => <HeaderText />,
                headerStyle: {
                  backgroundColor: "#EFEFEF",
                },
                drawerLabel: "หน้าโฮม",
                drawerActiveTintColor: "#FB6E90",
              }}
            />
            <Drawer.Screen
              name="settings"
              component={Settings}
              options={{
                drawerLabel: "ตั้งค่า",
                headerTitle: () => <HeaderText />,
                headerStyle: {
                  backgroundColor: "#EFEFEF",
                },
              }}
            />
            <Drawer.Screen
              name="diagnosis"
              component={Diagnosis}
              options={{
                drawerLabel: "การประเมินโรค",
                headerTitle: () => <HeaderText />,
                headerStyle: {
                  backgroundColor: "#EFEFEF",
                },
              }}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      )}
    </>
  );
}

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const s = StyleSheet.create({
  // header: {
  //   backgroundColor: "#EFEFEF",
  // },
  headerTitle: {},
  headerTextWrapper: {},
});
