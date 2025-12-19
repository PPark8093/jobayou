import { useFirebaseData } from '@/useFirebaseData';
import AntDesign from '@expo/vector-icons/AntDesign';
import { navigate } from "expo-router/build/global-state/routing";
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Ranking() {

    const auth = getAuth();

    const { data, loading } = useFirebaseData("userInfo");
    const [allUserData, setAllUserData] = useState();

    useEffect(() => {
        if (!loading && data) {
            const allUsers = Object.entries(data).map(([key, value]: [any, any]) => ({ id: key, ...value }));
            allUsers.sort((a, b) => {
                return b.exp - a.exp
            })
            setAllUserData(allUsers);
        }
    }, [data, loading])

    return (
        <View style={{flex: 1}}> 
            <View style={style.header}>
                <TouchableOpacity onPress={() => {navigate("..")}} style={{position: "absolute", top: 10, left: 10}}>
                    <AntDesign name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={style.header_title}>랭킹</Text>
            </View>

            <View style={style.main}>
                
                <FlatList keyExtractor={(item) => item.id} data={allUserData} renderItem={({item}) => (
                    <View>
                        {item.type === 'personal' && item.id !== auth.currentUser?.uid?
                        <View><Text>{item.exp}</Text>
                        <Text>{allUserData.indexOf(item)}</Text></View>
                        : null}
                    </View>
                )}/>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    header: {
        height: 60, // 헤더 높이 고정
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    header_title: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold'
    },
    main: {
        padding: 20,
        flex: 1, // 전체 화면 채우기
    },
    skills_item: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 15, // 간격 조정
        gap: 10,
        justifyContent: "space-between",
        alignItems: 'center'
    },
    skills_title: {
        color: "black",
        fontSize: 16, // 글자 크기 조정
        width: 100, // 제목 정렬을 위해 너비 고정
        flexShrink: 1
    },
    job_card: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        // 그림자 효과 (선택사항)
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    }
})