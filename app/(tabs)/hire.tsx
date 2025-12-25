import { useFirebaseData } from "@/useFirebaseData";
import AntDesign from "@expo/vector-icons/AntDesign";
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from 'react-native-progress';

const catagory_name = [
    { id: 1, name: "판매·홍보 지원", exp: 0 },
    { id: 2, name: "디자인", exp: 0 },
    { id: 3, name: "배송", exp: 0 },
    { id: 4, name: "행사 보조", exp: 0 },
    { id: 5, name: "데이터 입력", exp: 0 },
    { id: 6, name: "번역", exp: 0 },
    { id: 7, name: "영상 편집", exp: 0 },
    { id: 8, name: "농업·현장 지원", exp: 0 },
    { id: 9, name: "공공·행정 보조", exp: 0 },
    { id: 10, name: "교육·튜터링", exp: 0 },
    { id: 11, name: "생활 서비스", exp: 0 },
    { id: 12, name: "IT·웹 관련 업무", exp: 0 },
]

const catagory_exp_map = {
  "판매·홍보 지원": 0,
  "디자인": 0,
  "배송": 0,
  "행사 보조": 0,
  "데이터 입력": 0,
  "번역": 0,
  "영상 편집": 0,
  "농업·현장 지원": 0,
  "공공·행정 보조": 0,
  "교육·튜터링": 0,
  "생활 서비스": 0,
  "IT·웹 관련 업무": 0
}

export default function Hire() {

    const { data, loading } = useFirebaseData("userInfo");
    const { data: jobs, loading: jobsLoading} = useFirebaseData("jobs");

    const [users, setUsers] = useState<any[]>([]);
    const [userCompleteJobs, setUserCompleteJobs] = useState<any[]>([]);

    const [skillModal, setSkillModal] = useState(false);
    const [skillModalUser, setSkillModalUser] = useState<any>();

    useEffect(() => {
        if (data && !loading) {
            const users_temp = Object.entries(data).map(([key, value]: [string, any]) => ({ id: key, ...value })).filter(user => user.type === 'personal');

            setUsers(users_temp);
        }
    }, [data, loading]);

    useEffect(() => {
        if (jobs && !jobsLoading && skillModal) {
            const jobs_temp = Object.entries(jobs).map(([key, value]: [string, any]) => ({ id: key, ...value }));

            const userJobs = jobs_temp.filter((jobs) => jobs.applicantId === skillModalUser.id && jobs.status === 'completed');
            setUserCompleteJobs(userJobs);
        }
    }, [jobs, jobsLoading, skillModal]);

    const onPressSkillShow = (user: any) => {
        setSkillModal(true);
        setSkillModalUser(user);
    }

    const getLevelProgress = (exp: any) => {
        if (exp > 30000) return 1.1;
        if (exp > 20000) return 0.9;
        if (exp > 15000) return 0.8;
        if (exp > 11000) return 0.7;
        if (exp > 8000) return 0.6;
        if (exp > 5000) return 0.5;
        if (exp > 2500) return 0.4;
        if (exp > 1000) return 0.3;
        if (exp > 300) return 0.2;
        return 0.1;
    };

    const getUsersWithExpOrder = (users: any) => {
        users.sort((a: any, b: any) => {

            return Number(b.exp) - Number(a.exp);
        });
        return users;
    }

    const hireUser = (users: any) => {
        Alert.alert("채용", `'${users.nickname}'에게 채용을 제안하시겠습니까?`, [
            {text: "아니오",},
            {text: "예", onPress: () => {/* 기능 구현 */}}
        ])
    }

    return (
        <View style={{flex: 1}}>
            <View style={style.header}>
                <TouchableOpacity onPress={() => {navigate("..")}} style={{position: "absolute", top: 10, left: 10}}>
                    <AntDesign name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={style.header_title}>채용하기</Text>
            </View>

            <View style={style.main}>
                <Text style={{fontSize: 18, fontWeight: "bold", marginBottom: 10}}>사용자 목록</Text>
                <FlatList data={getUsersWithExpOrder(users)} renderItem={({item}) => (
                    <TouchableOpacity style={{backgroundColor: "white", padding: 10, display: "flex", flexDirection: "row", justifyContent: "space-between", borderRadius: 8, marginBottom: 15}} onPress={() => hireUser(item)}>
                        <View>
                            <Text style={{fontSize: 20, fontWeight: "bold"}}>{item.nickname}</Text>
                            <Text style={{fontSize: 15}}>EXP: {item.exp}</Text>
                            <Text style={{fontSize: 15}}>지방 도움 EXP: {item.countrysideExp}</Text>
                            <Text>한줄 소개: {item.introductionText}</Text>
                        </View>
                        <TouchableOpacity style={{backgroundColor: "orange", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, padding: 10}} onPress={() => onPressSkillShow(item)}>
                            <Text style={{color: "white", fontSize: 18, textAlign: "center", fontWeight: "bold"}}>평가 및 능력치</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}/>
            </View>

            <Modal animationType="slide" transparent={false} visible={skillModal} onRequestClose={() => {setSkillModal(false)}}>
                <View style={modal_style.container}>
                    <Text style={modal_style.title}>사용자 상세 능력치</Text>
                    <View style={{ margin: 20 }}>
                        {catagory_name.map((item) => {
                            const expValue = skillModalUser?.catagoryExp?.[item.name] || 0;
                            
                            return (
                                <View key={item.id} style={style.skills_item}>
                                    <Text style={style.skills_title}>{item.name}</Text>
                                    <Progress.Bar 
                                        progress={getLevelProgress(expValue) - 0.1} 
                                        width={200} 
                                        height={30}
                                        borderRadius={0} 
                                    />
                                </View>
                            );
                        })}
                    </View>
                    <Text style={modal_style.title}>사용자가 완수한 업무 및 평가</Text>
                    {loading ? <Text>로딩중...</Text> : userCompleteJobs.length === 0 ? 
                                        <Text style={{alignSelf: "center", marginTop: 20, marginBottom: 50}}>수행한 작업이 없습니다</Text> : 
                                        <View style={{paddingBottom: 50}}>
                                            {userCompleteJobs.map((item: any) => (
                                                 <TouchableOpacity 
                                                    key={item.id}
                                                    style={style.job_card}
                                                >
                                                    <View>
                                                        <Text style={{fontWeight:'bold', fontSize: 18}}>{item.title}</Text>
                                                        <Text style={{color: 'gray', marginTop: 4}}>{item.category}</Text>
                                                        <Text style={{marginTop: 4}}>급여: {item.money}원</Text>
                                                    </View>
                                                    <View style={{alignItems: "flex-end", display: "flex", justifyContent: "space-between"}}>
                                                        <Text style={{fontSize: 16}}>평가 별점: {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</Text>
                                                        <Text style={{fontSize: 16}}>다른 기업의 평가: {item.review}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    }
                    <TouchableOpacity onPress={() => setSkillModal(false)} style={{marginTop: 20, padding:15, backgroundColor:'#ddd', alignItems:'center', marginHorizontal: 20}}>
                        <Text>닫기</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    )
}

const style = StyleSheet.create({
    header: {
        height: 60,
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
        flex: 1,
    },
    skills_item: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 15,
        gap: 10,
        justifyContent: "space-between",
        alignItems: 'center'
    },
    skills_title: {
        color: "black",
        fontSize: 16,
        width: 100,
        flexShrink: 1
    },
    job_card: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        margin: 15,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    }
});

const modal_style = StyleSheet.create({
    container: {
        backgroundColor: "#eee",
        justifyContent: "center",
        display: "flex",
        flex: 1,
        width: "100%",
        height: "100%"
    },
    title: {
        fontSize: 30,
        alignSelf: "center"
    },
    input_container: {
        width: "100%",
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 20
    },
    input: {
        marginTop: 10,
        backgroundColor: "#fff",
        borderWidth: 1,
        paddingLeft: 10,
        fontSize: 18,
        height: 50
    },
    request_button: {
        backgroundColor: "orange",
        padding: 10,
        marginHorizontal: 30,
        borderWidth: 1,
        borderColor: "orange"
    }
});