import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Sign Up
export default function Index() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onPress = () => {
        const auth = getAuth();

        createUserWithEmailAndPassword(auth, email, password).then(
            (userCredential) => {if (auth.currentUser != null) router.replace("/(tabs)");}
        ).catch((err) => console.error(err));
    }

    return (
        <SafeAreaView style={style.container}>
        <Text style={style.title}>Jobayou</Text>
        <View style={style.input_container}>
            <TextInput style={style.input} value={email} onChangeText={setEmail} placeholder="이메일"/>
            <TextInput style={style.input} value={password} onChangeText={setPassword} secureTextEntry={true} placeholder="비밀번호"/>
            <TouchableOpacity style={style.go_button} onPress={onPress}>
                <Text style={style.go_title}>회원가입</Text>
            </TouchableOpacity>
            <Text style={{alignSelf: "center"}}>이미 회원가입 했나요? <Link style={{color: "orange"}} href="/(auth)/signin">로그인</Link></Text>
        </View>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#eee"
  },
  title: {
    color: "black",
    fontSize: 30
  },
  input_container: {
    width: "100%",
    padding: "5%",
    gap: "3%",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgb(150, 150, 150)",
    height: "10%",
    paddingHorizontal: 10
  },
  go_button: {
    backgroundColor: "orange",
    borderColor: "orange",
    borderWidth: 1,
    height: "10%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  go_title: {
    color: "white",
  }
})