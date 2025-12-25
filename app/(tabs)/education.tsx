import { WriteUserBadgeData } from '@/useFirebaseData';
import AntDesign from '@expo/vector-icons/AntDesign';
import { navigate } from 'expo-router/build/global-state/routing';
import { getAuth } from 'firebase/auth';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const dummy_courses = [
    { id: '1', title: '삼성전자 반도체 입문', company: '삼성전자', badge: '삼성_반도체_마스터' },
    { id: '2', title: '달성군 관광 마케팅 실무', company: '달성군청', badge: '달성_홍보_전문가' },
    { id: '3', title: '현대자동차 생산 공정 기초', company: '현대자동차', badge: '현대_생산_마스터' },
    { id: '4', title: '농산물 유통 및 포장법', company: '경북농협', badge: '농산물_유통_전문가' },
];

export default function Education() {
    const auth = getAuth();

    const onPressWatch = (title: string) => {
        Alert.alert("강의 재생", `'${title}' 영상을 시청 중입니다...`);
    };

    const onPressComplete = (title: string, badge: string) => {
        Alert.alert("수료 완료", `'${title}' 과정을 수료하여\n[${badge}] 배지를 획득했습니다!`, [
            { text: "확인", onPress: () => WriteUserBadgeData(auth.currentUser?.uid, badge) }
        ]);
    };

    return (
        <View style={style.container}>
            <View style={style.header}>
                <TouchableOpacity onPress={() => navigate("..")} style={style.back_btn}>
                    <AntDesign name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={style.header_title}>교육 수강</Text>
            </View>

            <FlatList
                data={dummy_courses}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <View style={style.course_card}>
                        <View style={style.text_container}>
                            <Text style={style.company_name}>{item.company}</Text>
                            <Text style={style.course_title}>{item.title}</Text>
                        </View>
                        
                        <View style={style.btn_container}>
                            <TouchableOpacity style={style.watch_btn} onPress={() => onPressWatch(item.title)}>
                                <Text style={style.btn_text}>강의 보기</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={style.complete_btn} onPress={() => onPressComplete(item.title, item.badge)}>
                                <Text style={style.btn_text}>수료하기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    )
}

const style = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row' },
    header_title: { fontSize: 18, fontWeight: 'bold' },
    back_btn: { position: 'absolute', left: 15 },
    course_card: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 15},
    text_container: { marginBottom: 15 },
    company_name: { fontSize: 14, color: 'orange', fontWeight: 'bold', marginBottom: 5 },
    course_title: { fontSize: 18, fontWeight: 'bold' },
    btn_container: { flexDirection: 'row', gap: 10 },
    watch_btn: { flex: 1, backgroundColor: '#eee', padding: 12, borderRadius: 5, alignItems: 'center' },
    complete_btn: { flex: 1, backgroundColor: 'orange', padding: 12, borderRadius: 5, alignItems: 'center' },
    btn_text: { fontWeight: 'bold' }
});