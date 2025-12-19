import { applyJob, cancelJob, submitJob, useFirebaseData, WriteUserLocationData } from "@/useFirebaseData";
import { Picker } from "@react-native-picker/picker";
import { navigate } from "expo-router/build/global-state/routing";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const catagory_name = [
    { id: 1, name: "판매·홍보 지원" },
    { id: 2, name: "디자인" },
    { id: 3, name: "배송" },
    { id: 4, name: "행사 보조" },
    { id: 5, name: "데이터 입력" },
    { id: 6, name: "번역" },
    { id: 7, name: "영상 편집" },
    { id: 8, name: "농업·현장 지원" },
    { id: 9, name: "공공·행정 보조" },
    { id: 10, name: "교육·튜터링" },
    { id: 11, name: "생활 서비스" },
    { id: 12, name: "IT·웹 관련 업무" },
]

const location_name = [
    { id: 1, name: "경상북도 영양군", countryside: true },
    { id: 2, name: "경상북도 의성군", countryside: true },
    { id: 3, name: "전라남도 고흥군", countryside: true },
    { id: 4, name: "경상북도 봉화군", countryside: true },
    { id: 5, name: "경상남도 합천군", countryside: true },
    { id: 6, name: "대구광역시 달성군", countryside: false },
    { id: 7, name: "서울특별시 서초구", countryside: false }
]

export default function PersonalHome() {

    // TODO: 취소버튼 다시 만들어야함? / 랭킹 시스템 구현

    const auth = getAuth();
    const [searchText, setSearchText] = useState("");

    const { data, loading } = useFirebaseData("jobs");
    const { data: userData, loading: userLoading} = useFirebaseData("userInfo/" + auth.currentUser?.uid)
    
    const [myAppliedJobs, setMyAppliedJobs] = useState<any[]>([]);
    const [recruitingJobs, setRecruitingJobs] = useState<any[]>([]); 

    const [catagoryModal, setCatagoryModal] = useState(false)
    const [catagoryModalTitle, setCatagoryModalTitle] = useState("")

    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [todoModal, setTodoModal] = useState(false);

    const [userLocation, setUserLocation] = useState("");
    const [locationModal, setLocationModal] = useState(false);

    useEffect(() => {
        if (!loading && data) {
            const allJobs = Object.entries(data).map(([key, value]: [string, any]) => ({ id: key, ...value }));
            
            const myJobs = allJobs.filter(job => (job.applicantId === auth.currentUser?.uid && job.status !== "completed"));
            setMyAppliedJobs(myJobs);

            const available = allJobs.filter(job => job.status === 'recruiting');
            setRecruitingJobs(available);

        } else if (!loading && !data) {
            setMyAppliedJobs([]);
            setRecruitingJobs([]);
        }
    }, [data, loading]);

    useEffect(() => {
        if (!userLoading && userData) {
            if (userData.location == null && userData.type === 'personal') {
                setLocationModal(true)
                return;
            }
            const location = userData.location;
            setUserLocation(location);
        }
    }, [userData, userLoading]);

    const getRecruitingJobsByCatagory = () => {
        let filtered = [...recruitingJobs].filter(job => job.category === catagoryModalTitle);

        // ! 핵심 기능 --> 시골 지역 위로 올리기
        filtered.sort((a, b) => {
            const locA = location_name.find(l => l.name === a.location);
            const locB = location_name.find(l => l.name === b.location);

            const isCountryA = locA ? locA.countryside : false;
            const isCountryB = locB ? locB.countryside : false;

            return Number(isCountryB) - Number(isCountryA);
        });
        return filtered;
    }

    const isCountryside = (locationName: string) => {
        const loc = location_name.find(l => l.name === locationName);
        return loc ? loc.countryside : false;
    };

    const onPressLocationModalButton = () => {
        WriteUserLocationData(auth.currentUser?.uid, userLocation);
        setLocationModal(false)
    }

    const openCatagory = (catagory: string) => {
        setCatagoryModal(true);
        setCatagoryModalTitle(catagory);
    }

    const openTodo = (jobItem: any) => {
        setSelectedJob(jobItem);
        setTodoModal(true);
    }

    const handleApply = () => {
        if (selectedJob) {
            applyJob(selectedJob.id, auth.currentUser?.uid);
            setTodoModal(false);
            setCatagoryModal(false);
            Alert.alert("성공", "작업 신청이 완료되었습니다.");
        }
    }

    const handleCancel = (job: any) => {
        Alert.alert("작업 취소", "이 작업을 취소하시겠습니까?", [
            { text: "아니오", },
            { text: "예", onPress: () => {if (job.status !== 'submitted') cancelJob(job.id); else Alert.alert("오류", "평가중인 작업은 취소할 수 없습니다!"); }}
        ]);
    }

    const handleComplete = (job: any) => {
        Alert.alert("작업 완료", "이 작업이 완료되었습니까?", [
            { text: "아니오" },
            { text: "예", onPress: () => submitJob(job)}
        ])
    }

    return (
        <View style={style.container}>
            <View style={style.header}>
                <Text>사용자: {auth.currentUser?.email}{"\n"}거주지역: {userLocation}</Text>
                <TouchableOpacity onPress={() => {auth.signOut(); navigate("/(auth)/signin")}}>
                    <Text>로그아웃</Text>
                </TouchableOpacity>
            </View>
            <View style={style.main}>
                <TextInput value={searchText} onChangeText={setSearchText} style={style.search_bar} placeholder="검색"/>
                
                <View style={style.catagory_container}>
                    <Text style={style.catagory_title}>카테고리 (일감 찾기)</Text>
                    <FlatList 
                        style={style.catagory_list} 
                        contentContainerStyle={{justifyContent: "center", alignItems: "center", gap: 10}} 
                        columnWrapperStyle={{gap: 11, justifyContent: "center", alignItems: "center"}} 
                        numColumns={3} 
                        data={catagory_name} 
                        renderItem={({item}) => (
                            <TouchableOpacity style={style.catagory_button} onPress={() => openCatagory(item.name)}>
                                <Text>{item.name}</Text>
                            </TouchableOpacity>
                    )}/>
                </View>

                <View style={style.work_container}>
                    <Text style={style.work_title}>현재 진행중인 작업</Text>
                    {loading ? <Text>로딩중...</Text> : myAppliedJobs.length === 0 ? 
                        <Text style={{alignSelf: "center", marginTop: 20}}>현재 진행중인 작업이 없습니다</Text> : 
                        <FlatList 
                            style={{marginHorizontal: 30, height: "40%"}} 
                            keyExtractor={(item) => item.id} 
                            data={myAppliedJobs} 
                            renderItem={({item}) => (
                                <TouchableOpacity style={style.job_card} onPress={() => handleCancel(item)}>
                                    <View>
                                        <Text style={{fontWeight:'bold', fontSize: 18}}>{item.title}</Text>
                                        <Text>카테고리: {item.category}</Text>
                                        <Text>시급: {item.money}원</Text>
                                        <Text>지역: {item.location}</Text>
                                        <Text>난이도: {item.difficulty}</Text>
                                        <Text style={{color: item.status !== 'submitted' ? 'green' : 'orange'}}>{item.status !== 'submitted' ? "매칭됨" : "평가중"}</Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity onPress={() => {handleComplete(item.id)}} style={{display: item.status !== 'submitted' ? "flex" : "none", flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "green", borderRadius: 5, padding: 10, marginTop: 10}}>
                                            <Text style={{fontSize: 18, color: "white", fontWeight: "bold"}}>완료하기</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                        )}/>
                    }
                </View>

                <View style={style.portfolio_container}>
                    <Text style={style.work_title}>랭킹 보기</Text>
                    <TouchableOpacity style={{padding: 10, backgroundColor: "orange"}} onPress={() => {navigate("/(tabs)/ranking")}}>
                        <Text style={{color: "white"}}>보러가기</Text>
                    </TouchableOpacity>
                </View>

                <View style={style.portfolio_container}>
                    <Text style={style.work_title}>내 포트폴리오 보기</Text>
                    <TouchableOpacity style={{padding: 10, backgroundColor: "orange"}} onPress={() => {navigate("/(tabs)/portfolio")}}>
                        <Text style={{color: "white"}}>보러가기</Text>
                    </TouchableOpacity>
                </View>

                <View style={{flex: 1}}>
                    <Text style={style.work_title}>교육 수강 및 배지 얻기</Text>
                    <TouchableOpacity style={{display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "white", marginHorizontal: 100, padding: 15}} onPress={() => navigate("/(tabs)/education")}>
                        <Text style={{fontSize: 16, fontWeight: "bold"}}>들으러가기</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal animationType="slide" transparent={false} visible={catagoryModal} onRequestClose={() => {setCatagoryModal(false)}}>
                <View style={{flex:1, padding: 20, paddingTop: 50}}>
                    <Text style={{fontSize:24, marginBottom: 20, alignSelf:'center'}}>{catagoryModalTitle}</Text>
                    
                    <FlatList
                        keyExtractor={(item) => item.id} 
                        data={getRecruitingJobsByCatagory()} // recruitingJobs.filter(job => job.category === catagoryModalTitle) 
                        ListEmptyComponent={<Text style={{alignSelf:'center'}}>현재 모집중인 공고가 없습니다.</Text>}
                        renderItem={({item}) => (
                            <TouchableOpacity style={style.job_card} onPress={() => openTodo(item)}>
                                <View>
                                    <Text style={{fontSize:18, fontWeight:'bold'}}>{item.title}</Text>
                                    <Text>급여: {item.money}원</Text>
                                    <Text>설명: {item.description}</Text>
                                    <Text>지역: {item.location}</Text>
                                    <Text>난이도: {item.difficulty}</Text>
                                </View>
                                <Text style={{fontSize: 18, fontWeight: 'bold', color: "orange"}}>{isCountryside(item.location) ? "추천 ★" : ""}</Text>
                            </TouchableOpacity>
                    )}/>

                    <TouchableOpacity onPress={() => setCatagoryModal(false)} style={{marginTop: 20, padding:15, backgroundColor:'#ddd', alignItems:'center'}}>
                        <Text>닫기</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={todoModal} onRequestClose={() => {setTodoModal(false)}}>
                <View style={modal_style.centeredView}>
                    <View style={modal_style.modalView}>
                        <Text style={modal_style.modalText}>{selectedJob?.title}</Text>
                        <Text>급여(시급): {selectedJob?.money}원</Text>
                        <Text>설명: {selectedJob?.description}</Text>
                        <Text>지역: {selectedJob?.location}</Text>
                        <Text style={{marginBottom: 20}}>난이도: {selectedJob?.difficulty}</Text>
                        
                        <TouchableOpacity style={[style.apply_button, {marginBottom: 10, width: '100%', alignItems:'center', padding:10}]} onPress={handleApply}>
                            <Text style={{color: "white", fontSize: 18}}>지원하기</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => setTodoModal(false)}>
                            <Text style={{color: "gray"}}>취소</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal animationType="slide" transparent={false} visible={locationModal} onRequestClose={() => {setLocationModal(false)}}>
                <View style={modal_style.container}>
                    <Text style={modal_style.title}>거주 지역 정하기</Text>
                    <View style={modal_style.input_container}>
                        <View style={{borderWidth: 1, marginTop: 10, backgroundColor: "white"}}>
                            <Picker style={{marginHorizontal: 10}} selectedValue={userLocation} onValueChange={setUserLocation}>
                                {location_name.map((element) => (
                                    <Picker.Item style={{fontSize: 18}} label={element.name} value={element.name} key={element.id}/>
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onPressLocationModalButton} style={modal_style.request_button}>
                        <Text style={{color: "white", fontSize: 20, alignSelf: "center"}}>정하기</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#eee",
        paddingTop: 30,
        paddingHorizontal: 10
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    main: {
        flex: 1
    },
    search_bar: {
        borderWidth : 1,
        margin: 30,
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        height: 40
    },
    catagory_container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    catagory_title: {
        fontSize: 20,
        marginBottom: 5
    },
    catagory_list: {
        width: "100%",
        paddingVertical: 10
    },
    catagory_button: {
        backgroundColor: "#fff",
        borderWidth: 1,
        height: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "30%"
    },
    work_container: {
        display: "flex",
        justifyContent: "center",
        width: "100%",
        marginTop: 20,
        flex: 1
    },
    work_title: {
        fontSize: 20,
        marginBottom: 5,
        alignSelf: "center"
    },
    portfolio_container: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10
    },
    apply_button: {
        backgroundColor: "orange"
    },
    job_card: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    }
})

const modal_style = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%'
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    },
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
})