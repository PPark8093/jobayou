import { useFirebaseData, WriteUserIntroductionTextData } from '@/useFirebaseData';
import AntDesign from '@expo/vector-icons/AntDesign';
import { navigate } from "expo-router/build/global-state/routing";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

export default function Portfolio() {

    // TODO: 레벨 기준 표 추가?

    const auth = getAuth();
    const { data: userData, loading: userLoading} = useFirebaseData("userInfo/" + auth.currentUser?.uid)
    const [userExp, setUserExp] = useState(0);
    const [catagoryExp, setCatagoryExp] = useState({...catagory_exp_map});
    const [countrysideExp, setCountrysideExp] = useState(0);

    const { data, loading } = useFirebaseData("jobs");
    const [myCompletedJobs, setMyCompletedJobs] = useState<any[]>([]);

    const [introductionText, setIntroductonText] = useState("");
    const [showChangeIntroductionText, setShowChangeIntroductionText] = useState(false);

    useEffect(() => {
        if (!loading && data) {
            const allJobs = Object.entries(data).map(([key, value]: [string, any]) => ({ id: key, ...value }));
            const myJobs = allJobs.filter(job => (job.applicantId === auth.currentUser?.uid && job.status === "completed"));
            setMyCompletedJobs(myJobs);
        } else if (!loading && !data) {
            setMyCompletedJobs([]);
        }
    }, [data, loading]);

    useEffect(() => {
        if (userData && !userLoading) {
            setUserExp(userData.exp);
            setCatagoryExp(Object.entries(userData.catagoryExp));
            setCountrysideExp(userData.countrysideExp);
            setIntroductonText(userData.introductionText || "");
        }
    }, [userData, userLoading])

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

    const currentProgress = getLevelProgress(userExp);
    const currentCountrysideProgress = getLevelProgress(countrysideExp);

    const onChangeIntroductionText = (text: string) => {
        setShowChangeIntroductionText(true);
        setIntroductonText(text);
    }

    const onPressChangeIntroductionText = () => {
        setShowChangeIntroductionText(false);
        WriteUserIntroductionTextData(auth.currentUser?.uid, introductionText);
    }

    return (
        <View style={{flex: 1}}> 
            <View style={style.header}>
                <TouchableOpacity onPress={() => {navigate("..")}} style={{position: "absolute", top: 10, left: 10}}>
                    <AntDesign name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={style.header_title}>포트폴리오</Text>
            </View>
            
            <View style={style.main}>
                <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={{fontSize: 25, fontWeight: "bold", marginBottom: 10}}>현재 레벨: Lv.{currentProgress * 10}</Text>
                    <Progress.Bar width={200} height={26} style={{marginBottom: 10}} progress={currentProgress - 0.1} borderRadius={0}/>
                </View>

                <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={{fontSize: 25, fontWeight: "bold", marginBottom: 10}}>지방 공헌 경험치</Text>
                    <Progress.Bar width={200} height={26} style={{marginBottom: 10}} progress={currentCountrysideProgress - 0.1} borderRadius={0}/>
                </View>
                
                <Text style={{fontSize: 25, fontWeight: "bold", marginBottom: 10}}>카테고리별 숙련도</Text>
                <View style={{ marginBottom: 20 }}>
                    {catagory_name.map((item) => {
                        const expValue = userData?.catagoryExp?.[item.name] || 0;
                        
                        return (
                            <View key={item.id} style={style.skills_item}>
                                <Text style={style.skills_title}>{item.name}</Text>
                                <Progress.Bar 
                                    progress={getLevelProgress(expValue) - 0.1} 
                                    width={200} 
                                    height={26}
                                    borderRadius={0} 
                                />
                            </View>
                        );
                    })}
                </View>

                <TouchableOpacity style={{backgroundColor: "orange", alignItems: "center", padding: 15, marginTop: 10, borderRadius: 8}}>
                    <Text style={{color: "white", fontSize: 20, fontWeight: "bold"}}>이력서 생성하기</Text>
                </TouchableOpacity>
                
                <View style={{marginVertical: 10}}>
                    <Text style={{fontSize: 25, fontWeight: "bold", marginBottom: 10}}>한줄 소개</Text>
                    <TextInput style={{backgroundColor: "white", borderWidth: 1, fontSize: 18}} value={introductionText} onChangeText={(text) => onChangeIntroductionText(text)} placeholder='한줄 소개'/>
                    <TouchableOpacity style={{display: showChangeIntroductionText ? "flex" : "none"}} onPress={onPressChangeIntroductionText}>
                        <Text style={{fontSize: 15, fontWeight: "bold"}}>변경내용 저장하기</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{fontSize: 25, fontWeight: "bold", marginVertical: 10, marginTop: 30}}>수행 완료한 업무들</Text>
                
                {loading ? <Text>로딩중...</Text> : myCompletedJobs.length === 0 ? 
                    <Text style={{alignSelf: "center", marginTop: 20, marginBottom: 50}}>수행한 작업이 없습니다</Text> : 
                    <View style={{paddingBottom: 50}}>
                        {myCompletedJobs.map((item) => (
                             <TouchableOpacity 
                                key={item.id}
                                style={style.job_card}
                            >
                                <View>
                                    <Text style={{fontWeight:'bold', fontSize: 16}}>{item.title}</Text>
                                    <Text style={{color: 'gray', marginTop: 4}}>{item.category}</Text>
                                    <Text style={{marginTop: 4}}>급여: {item.money}원</Text>
                                    <Text>평가: {item.review}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                }
            </View>
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
    }
})