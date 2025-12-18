import { WriteUserBadgeData } from '@/useFirebaseData'
import AntDesign from '@expo/vector-icons/AntDesign'
import { navigate } from 'expo-router/build/global-state/routing'
import { getAuth } from 'firebase/auth'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

function education() {

    const auth = getAuth();

    const onPressCompleteButton = (uid: any, badge_name: string) => {
        WriteUserBadgeData(uid, badge_name);
    }

    return (
        <View>
            <View style={style.header}>
                <TouchableOpacity onPress={() => {navigate("..")}} style={{position: "absolute", top: 10, left: 10}}>
                    <AntDesign name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={style.header_title}>교육 수강</Text>
            </View>
            <View style={style.main}>
                <TouchableOpacity onPress={() => onPressCompleteButton(auth.currentUser?.uid, "테스트_배지")}>
                    <Text>수강 완료(테스트용)</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    header: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    header_title: {
        marginTop: 10,
        fontSize: 18
    },
    main: {
        padding: 20
    },
})

export default education