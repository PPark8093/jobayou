import { Redirect } from "expo-router";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFirebaseData, WriteUserInfoData } from "../../useFirebaseData.js";

export default function Index() {

  const auth = getAuth();
  const { data, loading } = useFirebaseData("userInfo/" + auth.currentUser?.uid);
  const [userType, setUserType] = useState("유저 정보 로딩중");
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  useEffect(() => {
    if (data?.type == null) setTypeModalVisible(true);
    else {
      setTypeModalVisible(false);
      setUserType(data?.type);
    }
  }, [data]);

  const onPressUserTypeModal = (type: "firm" | "personal") => {
    WriteUserInfoData(auth.currentUser?.uid, type);
    setTypeModalVisible(false);
  }

  return (
    <SafeAreaView style={style.container}>
      <Text style={style.title}>Jobayou</Text>
      {loading ? <Text>데이터 로딩중</Text> : 
        <Text>{userType === "firm" ? "기업" : "사용자"}으로 확인됨</Text>
      }
      {userType === "firm" ? <Redirect href={"/(tabs)/firmHome"}/> : userType === "personal" ? <Redirect href={"/(tabs)/personalHome"}/> : <Text>오류: 사용자 타입이 확인되지 않음</Text> }
      <Modal animationType="slide" transparent={false} visible={typeModalVisible} onRequestClose={() => {setTypeModalVisible(false)}}>
        <View style={modal_style.container}>
          <Text style={modal_style.title}>사용자 타입을 선택하세요</Text>
          <View style={modal_style.selection_container}>
            <TouchableOpacity style={modal_style.selection_button} onPress={() => {onPressUserTypeModal("firm")}}>
              <Text style={modal_style.selection_button_text}>기업</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal_style.selection_button} onPress={() => {onPressUserTypeModal("personal")}}>
              <Text style={modal_style.selection_button_text}>사용자</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    height: "100%"
  },
  title: {
    color: "black",
    fontSize: 30,
    marginBottom: 20
  }
})

const modal_style = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 30
  },
  selection_container: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    marginTop: 30
  },
  selection_button: {
    borderWidth: 1,
    width: "25%",
    aspectRatio: 0.95,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  selection_button_text: {
    fontSize: 20
  }
})