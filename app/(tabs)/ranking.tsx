import { useFirebaseData } from '@/useFirebaseData';
import AntDesign from '@expo/vector-icons/AntDesign';
import { navigate } from "expo-router/build/global-state/routing";
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Ranking() {
    const auth = getAuth();
    const { data: allUsersData, loading } = useFirebaseData("userInfo");
    const { data: myData } = useFirebaseData("userInfo/" + auth.currentUser?.uid);

    const [rankingList, setRankingList] = useState([]);
    const [isLocal, setIsLocal] = useState(false);

    useEffect(() => {
        if (!loading && allUsersData && myData) {
            let users = Object.entries(allUsersData).map(([key, value]: [string, any]) => ({
                id: key,
                ...value
            }));

            users = users.filter(u => u.type === 'personal')

            if (isLocal) {
                users = users.filter(u => u.location === myData.location);
            }

            users.sort((a, b) => (b.exp || 0) - (a.exp || 0));
            setRankingList(users);
        }
    }, [allUsersData, loading, isLocal, myData]);

    const getMyRank = () => {
        const index = rankingList.findIndex(u => u.id === auth.currentUser?.uid);
        return index !== -1 ? index + 1 : "-";
    }

    return (
        <View style={style.container}>
            <View style={style.header}>
                <TouchableOpacity onPress={() => navigate("..")} style={style.back_btn}>
                    <AntDesign name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={style.header_title}>랭킹</Text>
            </View>

            <View style={style.tab_container}>
                <TouchableOpacity 
                    style={[style.tab, !isLocal && style.active_tab]} 
                    onPress={() => setIsLocal(false)}
                >
                    <Text style={[style.tab_text, !isLocal && style.active_text]}>전국</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[style.tab, isLocal && style.active_tab]} 
                    onPress={() => setIsLocal(true)}
                >
                    <Text style={[style.tab_text, isLocal && style.active_text]}>
                        {myData?.location ? myData.location : "내 지역"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={style.my_rank}>
                <Text style={style.my_rank_text}>나의 순위: {getMyRank()}위 ({myData?.exp || 0} EXP)</Text>
            </View>

            <FlatList 
                data={rankingList}
                keyExtractor={item => item.id}
                renderItem={({item, index}) => (
                    <View style={[style.rank_item, item.id === auth.currentUser?.uid && style.my_item]}>
                        <View style={style.rank_left}>
                            <Text style={style.rank_num}>{index + 1}</Text>
                            <View>
                                <Text style={style.rank_name}>{item.nickname || "익명"}</Text>
                                <Text style={style.rank_loc}>{item.location || "지역 미설정"}</Text>
                            </View>
                        </View>
                        <Text style={style.rank_exp}>{item.exp || 0} EXP</Text>
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
    tab_container: { flexDirection: 'row', backgroundColor: 'white' },
    tab: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
    active_tab: { borderColor: 'orange' },
    tab_text: { fontSize: 16, color: 'gray' },
    active_text: { color: 'orange', fontWeight: 'bold' },
    my_rank: { padding: 15, backgroundColor: "white", alignItems: 'center', marginBottom: 5 },
    my_rank_text: { fontSize: 16, fontWeight: 'bold', color: 'orange' },
    rank_item: { flexDirection: 'row', padding: 15, backgroundColor: 'white', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
    my_item: { backgroundColor: '#e3f2fd' },
    rank_left: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    rank_num: { fontSize: 18, fontWeight: 'bold', width: 30, textAlign: 'center' },
    rank_name: { fontSize: 16, fontWeight: 'bold' },
    rank_loc: { fontSize: 12, color: 'gray' },
    rank_exp: { fontSize: 16, color: '#333', fontWeight: 'bold' }
});