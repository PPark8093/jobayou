import { Redirect } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";

export default function Index() {

  return (
    <SafeAreaView style={style.container}>
      { auth.currentUser != null ? <Redirect href={"/(tabs)"}/> : <Redirect href={"/(auth)"}/>}
    </SafeAreaView> 
  )

}

const style = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black"
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: 900
  }
})