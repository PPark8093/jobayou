import { get, getDatabase, onValue, push, ref, remove, set, update } from 'firebase/database';
import { useEffect, useState } from 'react';

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

// catagoryExp에 저장할 데이터 형식 --> Firebase는 Map 저장이 안됨
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
  "IT·웹 관련 업무": 0,
}

// 데이터 읽기 훅 (기존 유지)
export function useFirebaseData(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const database = getDatabase();
    const dbRef = ref(database, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      setData(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, [path]);

  return { data, loading };
}

// 유저 타입 저장 (기존 유지)
export function WriteUserInfoData(uid, type) {
  const database = getDatabase();
  set(ref(database, 'userInfo/' + uid), {
    type: type,
  })
}

export function WriteUserBadgeData(uid, badgeData) {
  const database = getDatabase();
  update(ref(database, 'userInfo/' + uid), {
    badges: badgeData
  })
}

export function WriteUserLocationData(uid, location) {
  const database = getDatabase();
  update(ref(database, 'userInfo/' + uid), {
    location: location
  })
}

// Job 관련 
export function createJob(firmUid, title, category, money, description, difficulty, location) {
  const database = getDatabase();
  const newJobRef = push(ref(database, 'jobs'));
  
  set(newJobRef, {
    firmId: firmUid,       // 누가 올렸는지
    title: title,          // 공고 제목
    category: category,    // 카테고리
    money: money,          // 금액
    status: 'recruiting',  // 상태: recruiting(모집중) | matched(매칭됨) | submitted(제출됨) | completed(완료됨)
    applicantId: "",       // 지원자 ID
    description: description,
    difficulty: difficulty,
    location: location,
    createdAt: Date.now()  // 생성 시간
  });
}

export function applyJob(jobId, applicantUid) {
  const database = getDatabase();
  
  // 해당 Job ID의 경로를 찾아 업데이트
  update(ref(database, `jobs/${jobId}`), {
    status: 'matched',      // 상태 변경
    applicantId: applicantUid // 지원자 기록
  });
}

export function deleteJob(jobId) {
    const database = getDatabase();
    remove(ref(database, `jobs/${jobId}`));
}

export function cancelJob(jobId) {
  const database = getDatabase();

  update(ref(database, `jobs/${jobId}`), {
    status: 'recruiting',
    applicantId: ''
  })
}

export function submitJob(jobId) {
  const database = getDatabase();

  update(ref(database, `jobs/${jobId}`), {
    status: 'submitted',
  })
}

export function completeJob(userUid, jobId, rating, difficulty, catagory) {
  const database = getDatabase();

  update(ref(database, `jobs/${jobId}`), {
    status: 'completed',
  });

  const userRef = ref(database, `userInfo/${userUid}`);
  
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const currentExp = userData.exp || 0;
      let currentCatagoryExp = userData.catagoryExp || {...catagory_exp_map};

      const diff_multiplier = (difficulty === 1) ? 1.0 : (difficulty === 2) ? 1.5 : (difficulty === 3) ? 2.0 : (difficulty === 4) ? 3.0 : 5.0;
      const rating_multiplier = (rating === 5) ? 1.2 : (rating === 4) ? 1.0 : (rating === 3) ? 0.8 : 0;
      const gainedExp = (100 * diff_multiplier) * rating_multiplier;
      const newTotalExp = currentExp + gainedExp;
      
      console.log(gainedExp);

      currentCatagoryExp[catagory] += gainedExp;
      console.log(currentCatagoryExp)
      
      update(userRef, {
        exp: newTotalExp,
        catagoryExp: currentCatagoryExp
      });
    }
  }).catch((error) => {
    console.error("경험치 업데이트 실패:", error);
  });

  // TODO: EXP를 catagory에 맞게 해당 카테고리에도 추가하기 --> 기초 데이터 자료가 필요함
}