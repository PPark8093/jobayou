import { cancelJob, completeJob, createJob, deleteJob, useFirebaseData } from "@/useFirebaseData"; // 수정된 함수 임포트
import { Picker } from "@react-native-picker/picker";
import { navigate } from "expo-router/build/global-state/routing";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Rating } from 'react-native-ratings';

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

export default function FirmHome() {

    // TODO: 사용자에게 작업 완료시 별점 보내기 기능?

    const auth = getAuth();
    const [searchText, setSearchText] = useState("");

    const { data, loading } = useFirebaseData("jobs");
    const [myJobs, setMyJobs] = useState<any[]>([]);

    const [addTodoModal, setAddTodoModal] = useState(false);
    const [todoName, setTodoName] = useState("");
    const [todoCatagory, setTodoCatagory] = useState("판매·홍보 지원"); // 초기값 설정
    const [todoMoney, setTodoMoney] = useState("");
    const [todoDescription, setTodoDescription] = useState("");
    const [todoDifficulty, setTodoDifficuty] = useState(0);
    const [todoLocation, setTodoLocation] = useState("");

    const [evaluateModal, setEvaluateModal] = useState(false);
    const [evaluateJob, setEvaludateJob] = useState<any>();

    useEffect(() => {
        if (!loading && data) {
            // [로직 변경] 전체 jobs 중에서 내가 올린 것만 필터링
            const filteredJobs = Object.entries(data)
                .map(([key, value]: [string, any]) => ({ id: key, ...value }))
                .filter((job) => job.firmId === auth.currentUser?.uid);
            
            setMyJobs(filteredJobs);

        } else if (!loading && !data) {
             setMyJobs([]);
        }
    }, [data, loading]);

    // [함수 변경] 공고 생성
    const onPressRequestButton = () => {
        if(!todoName || !todoMoney || !todoLocation) {
            Alert.alert("오류", "모든 내용을 입력해주세요.");
            return;
        }

        createJob(auth.currentUser?.uid, todoName, todoCatagory, todoMoney, todoDescription, todoDifficulty, todoLocation);
        
        setTodoName("");
        setTodoCatagory("판매·홍보 지원");
        setTodoMoney("");
        setAddTodoModal(false);
        setTodoDifficuty(0)
    }

    const onPressEvaluateButton = (job: any) => {
        // 작업 평가 (모달 vs 단순 확인 버튼?)
        Alert.alert("평가", "해당 작업이 완료되었습니까?", [
            { text: "아니오", onPress: () => {cancelJob(job.id)}},
            { text: "예", onPress: () => {rateAndCompleteJob(job)}},
        ])
    }

    const rateAndCompleteJob = (job: any) => {
        setEvaludateJob(job);
        setEvaluateModal(true);
    }

    const rateAndCompleteJob2 = (rating: any) => {
        // 1. 데이터가 존재하는지 먼저 확인 (안전장치)
        if (!evaluateJob || !evaluateJob.applicantId) {
            Alert.alert("오류", "지원자 정보를 찾을 수 없습니다.");
            return;
        }

        console.log("평가 점수:", rating);

        const loc = location_name.find(l => l.name === evaluateJob.location);
        console.log(true)
        
        // 2. 함수 실행
        completeJob(evaluateJob.applicantId, evaluateJob.id, rating, evaluateJob.difficulty, evaluateJob.category, loc?.countryside);
        
        // 3. 모달 닫기 및 초기화
        setEvaluateModal(false);
        setEvaludateJob(null); 
    }

    const handleDelete = (job: any) => {
        Alert.alert("삭제", "이 공고를 삭제하시겠습니까?", [
            { text: "취소" },
            { text: "예", onPress: () => {if (job.status !== 'completed' && job.status !== 'submitted') deleteJob(job.id); else Alert.alert("오류", "제출되거나 완료된 작업은 삭제할 수 없습니다!")} }
        ]);
    }

    return (
        <View style={style.container}>
            <View style={style.header}>
                <Text>기업: {auth.currentUser?.email}</Text>
                <TouchableOpacity onPress={() => {auth.signOut(); navigate("/(auth)/signin")}}>
                    <Text>로그아웃</Text>
                </TouchableOpacity>
            </View>
            <View style={style.main}>
                <TextInput value={searchText} onChangeText={setSearchText} style={style.search_bar} placeholder="검색"/>
                
                {/* 카테고리 영역 (기능상 단순 표시용이라면 유지) */}
                <View style={style.catagory_container}>
                    <Text style={style.catagory_title}>카테고리</Text>
                    <FlatList 
                        style={style.catagory_list} 
                        contentContainerStyle={{justifyContent: "center", alignItems: "center", gap: 10}} 
                        columnWrapperStyle={{gap: 11, justifyContent: "center", alignItems: "center"}} 
                        numColumns={3} 
                        data={catagory_name} 
                        renderItem={({item}) => (
                        <TouchableOpacity style={style.catagory_button}>
                            <Text>{item.name}</Text>
                        </TouchableOpacity>
                    )}/>
                </View>

                <View style={style.work_container}>
                    <Text style={style.work_title}>내가 올린 공고</Text>
                    {loading ? <Text>로딩중...</Text> : myJobs.length === 0 ? 
                        <Text style={{alignSelf: "center", marginTop: 20}}>등록된 공고가 없습니다</Text> : 
                        <FlatList 
                            style={{marginHorizontal: 30, height: "50%"}} 
                            keyExtractor={(item) => item.id} 
                            data={myJobs} 
                            renderItem={({item}) => (
                                <TouchableOpacity 
                                    style={style.job_card} 
                                    onPress={() => handleDelete(item)}
                                >
                                    <View>
                                        <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.title}</Text>
                                        <Text>분야: {item.category} | 시급: {item.money}원</Text>
                                        <Text>지역: {item.location}</Text>
                                        <Text>난이도: {item.difficulty}</Text>
                                        <Text style={{color: item.status === 'matched' || item.status === 'submitted' ?  "orange" :  item.status === 'completed' ? 'green' : 'gray'}}>
                                            {item.status === 'matched' ? "매칭 완료!" : item.status === 'submitted' ? "제출되었습니다(평가 필요)" : item.status === 'completed' ? "완료되었습니다!" : "모집중"}
                                        </Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity style={{display: item.status === 'submitted' ? "flex" : "none", flex: 1, alignItems: "flex-end", justifyContent: "center", backgroundColor: "orange", paddingHorizontal: 15, borderRadius: 5}} onPress={() => {onPressEvaluateButton(item)}}>
                                            <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>평가하기</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    }

                    <TouchableOpacity style={style.work_make_button} onPress={() => {setAddTodoModal(true)}}>
                        <Text style={style.work_make_button_text}>작업 요청하기</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal animationType="slide" transparent={false} visible={addTodoModal} onRequestClose={() => {setAddTodoModal(false)}}>
                <View style={modal_style.container}>
                    <Text style={modal_style.title}>작업 요청하기</Text>
                    <View style={modal_style.input_container}>
                        <TextInput style={modal_style.input} value={todoName} onChangeText={setTodoName} placeholder="작업 이름 (예: 전단지 배포)"/>
                        <View style={{borderWidth: 1, marginTop: 10, backgroundColor: "white"}}>
                            <Text style={{fontSize: 18, padding: 10, color: "gray"}}>카테고리</Text>
                            <Picker style={{marginHorizontal: 10}} selectedValue={todoCatagory} onValueChange={setTodoCatagory}>
                                {catagory_name.map((element) => (
                                    <Picker.Item style={{fontSize: 18}} label={element.name} value={element.name} key={element.id}/>
                                ))}
                            </Picker>
                        </View>
                        <View style={{borderWidth: 1, marginTop: 10, backgroundColor: "white"}}>
                            <Text style={{fontSize: 18, padding: 10, color: "gray"}}>지역</Text>
                            <Picker style={{marginHorizontal: 10}} selectedValue={todoLocation} onValueChange={setTodoLocation}>
                                {location_name.map((element) => (
                                    <Picker.Item style={{fontSize: 18}} label={element.name} value={element.name} key={element.id}/>
                                ))}
                            </Picker>
                        </View>
                        <TextInput style={modal_style.input} keyboardType="numeric" value={todoMoney} onChangeText={setTodoMoney} placeholder="급여 (원)"/>
                        <TextInput style={modal_style.input} multiline={true} value={todoDescription} onChangeText={setTodoDescription} placeholder="설명 (예: 제출용 이메일)"/>
                        <View style={{borderWidth: 1, marginTop: 10, backgroundColor: "white", padding: 10}}>
                            <Text style={{fontSize: 18}}>난이도</Text>
                            <Rating ratingBackgroundColor="transparent" ratingCount={5} onFinishRating={setTodoDifficuty}/>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onPressRequestButton} style={modal_style.request_button}>
                        <Text style={{color: "white", fontSize: 20, alignSelf: "center"}}>요청하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {setAddTodoModal(false)}}>
                        <Text style={{alignSelf: "center", padding: 10, fontSize: 15}}>취소</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal animationType="slide" transparent={false} visible={evaluateModal} onRequestClose={() => {setEvaluateModal(false)}}>
                <View style={modal_style.container}>
                    <Text style={modal_style.title}>사용자 평가하기</Text>
                    <View>
                        <Rating ratingBackgroundColor="transparent" ratingCount={5} onFinishRating={rateAndCompleteJob2}/>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

// 스타일은 기존과 거의 동일하지만 job_card 추가
const style = StyleSheet.create({
    // ... 기존 스타일 유지 ...
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
        justifyContent: "space-between",
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
        width: "100%"
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
    work_make_button: {
        backgroundColor: "orange",
        marginHorizontal: 30,
        marginVertical: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "orange",
        paddingVertical: 10
    },
    work_make_button_text: {
        fontSize: 20,
        color: "white",
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