import { adminDb } from './admin';
import { db } from './client';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  increment,
} from 'firebase/firestore';
import { 
  Widget, 
  Category, 
  CreatorProfile, 
  DbUser, 
  WidgetStatus, 
  UserRole,
  CohortInvite,
} from './types';

// 타임아웃 헬퍼 (지연 방지용)
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

// 인메모리 캐시 (SSR 렌더링 가속화)
let cachedCategories: { data: Category[]; expiry: number } | null = null;

// ==========================================
// 1. 카테고리 (Categories)
// ==========================================

export async function getCategories(): Promise<Category[]> {
  const defaultCategories: Category[] = [
    { id: 'cat_cohort_1', name: '개발했슈 1기', slug: 'cohort-1', display_order: 1 }
  ];

  const now = Date.now();
  if (cachedCategories && cachedCategories.expiry > now) {
    return cachedCategories.data;
  }

  const fetchPromise = (async () => {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('categories').orderBy('display_order', 'asc').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        }
      } else {
        const q = query(collection(db, 'categories'), orderBy('display_order', 'asc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        }
      }
      return defaultCategories;
    } catch (error) {
      console.warn('getCategories warning/timeout:', error);
      return defaultCategories;
    }
  })();

  const categories = await withTimeout(fetchPromise, 2500, defaultCategories);
  const result = categories.length > 0 ? categories : defaultCategories;
  cachedCategories = { data: result, expiry: now + 60000 }; // 1분 캐싱
  return result;
}

// ==========================================
// 2. 위젯 (Widgets)
// ==========================================

export interface GetWidgetsOptions {
  status?: WidgetStatus | 'all';
  categorySlug?: string;
  searchQuery?: string;
  sortBy?: 'latest' | 'popular';
  limitCount?: number;
  creatorProfileId?: string;
}

export async function getWidgets(options: GetWidgetsOptions = {}): Promise<Widget[]> {
  const {
    status = 'published',
    categorySlug,
    searchQuery,
    sortBy = 'latest',
    limitCount,
    creatorProfileId,
  } = options;

  try {
    // 1. 카테고리, 위젯, 제빵사 프로필을 병렬(Promise.all)로 동시 조회
    const fetchWidgetsPromise = (async (): Promise<Widget[]> => {
      try {
        if (adminDb) {
          let q: FirebaseFirestore.Query = adminDb.collection('widgets');

          if (status !== 'all') {
            q = q.where('status', '==', status);
          }

          if (creatorProfileId) {
            q = q.where('creator_profile_id', '==', creatorProfileId);
          }

          const snap = await q.get();
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Widget));
        } else {
          let constraints: any[] = [];

          if (status !== 'all') {
            constraints.push(where('status', '==', status));
          }

          if (creatorProfileId) {
            constraints.push(where('creator_profile_id', '==', creatorProfileId));
          }

          const q = query(collection(db, 'widgets'), ...constraints);
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Widget));
        }
      } catch (err) {
        console.warn('Widgets fetch warning:', err);
        return [];
      }
    })();

    const [categories, rawWidgetsList, creatorProfiles] = await Promise.all([
      getCategories(),
      withTimeout(fetchWidgetsPromise, 3000, []),
      getAllCreatorProfiles(),
    ]);

    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const categoryBySlug = categories.find(c => c.slug === categorySlug);
    const creatorMap = new Map(creatorProfiles.map(cp => [cp.id, cp]));

    let rawWidgets = rawWidgetsList;

    // 카테고리 필터링 (메모리 필터링)
    if (categorySlug && categorySlug !== 'all') {
      if (categoryBySlug) {
        rawWidgets = rawWidgets.filter(w => w.category_id === categoryBySlug.id);
      }
    }

    // 검색어 필터링
    if (searchQuery && searchQuery.trim() !== '') {
      const lowerQ = searchQuery.toLowerCase().trim();
      rawWidgets = rawWidgets.filter(w => 
        (w.name && w.name.toLowerCase().includes(lowerQ)) ||
        (w.short_description && w.short_description.toLowerCase().includes(lowerQ)) ||
        (w.tags && w.tags.some(t => t.toLowerCase().includes(lowerQ)))
      );
    }

    // 정렬
    if (sortBy === 'popular') {
      rawWidgets.sort((a, b) => {
        const scoreA = (a.like_count || 0) * 2 + (a.copy_count || 0);
        const scoreB = (b.like_count || 0) * 2 + (b.copy_count || 0);
        return scoreB - scoreA;
      });
    } else {
      // latest
      rawWidgets.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    if (limitCount && limitCount > 0) {
      rawWidgets = rawWidgets.slice(0, limitCount);
    }

    // 관계 데이터 조인
    return rawWidgets.map(widget => {
      const cat = categoryMap.get(widget.category_id);
      const creator = creatorMap.get(widget.creator_profile_id);

      return {
        ...widget,
        categories: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : widget.categories || { name: '기타' },
        creator_profiles: creator ? { id: creator.id, nickname: creator.nickname, character_image_url: creator.character_image_url } : widget.creator_profiles || { nickname: '제빵사' },
      };
    });
  } catch (error) {
    console.error('getWidgets error:', error);
    return [];
  }
}

export async function getWidgetBySlug(slug: string): Promise<Widget | null> {
  try {
    const fetchWidgetPromise = (async (): Promise<Widget | null> => {
      try {
        if (adminDb) {
          const snap = await adminDb.collection('widgets').where('slug', '==', slug).limit(1).get();
          if (!snap.empty) {
            return { id: snap.docs[0]!.id, ...snap.docs[0]!.data() } as Widget;
          }
        } else {
          const q = query(collection(db, 'widgets'), where('slug', '==', slug), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            return { id: snap.docs[0]!.id, ...snap.docs[0]!.data() } as Widget;
          }
        }
        return null;
      } catch (err) {
        console.warn('getWidgetBySlug fetch warning:', err);
        return null;
      }
    })();

    const [widget, categories, creatorProfiles] = await Promise.all([
      withTimeout(fetchWidgetPromise, 3000, null),
      getCategories(),
      getAllCreatorProfiles()
    ]);

    if (!widget) return null;

    const cat = categories.find(c => c.id === widget.category_id);
    const creator = creatorProfiles.find(cp => cp.id === widget.creator_profile_id);

    return {
      ...widget,
      categories: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : { name: '기타' },
      creator_profiles: creator ? { id: creator.id, nickname: creator.nickname, character_image_url: creator.character_image_url } : { nickname: '제빵사' },
    };
  } catch (error) {
    console.error('getWidgetBySlug error:', error);
    return null;
  }
}

export async function getWidgetById(id: string): Promise<Widget | null> {
  try {
    const fetchWidgetPromise = (async (): Promise<Widget | null> => {
      try {
        if (adminDb) {
          const snap = await adminDb.collection('widgets').doc(id).get();
          if (snap.exists) {
            return { id: snap.id, ...snap.data() } as Widget;
          }
        } else {
          const snap = await getDoc(doc(db, 'widgets', id));
          if (snap.exists()) {
            return { id: snap.id, ...snap.data() } as Widget;
          }
        }
        return null;
      } catch (err) {
        console.warn('getWidgetById fetch warning:', err);
        return null;
      }
    })();

    const [widget, categories, creatorProfiles] = await Promise.all([
      withTimeout(fetchWidgetPromise, 3000, null),
      getCategories(),
      getAllCreatorProfiles()
    ]);

    if (!widget) return null;

    const cat = categories.find(c => c.id === widget.category_id);
    const creator = creatorProfiles.find(cp => cp.id === widget.creator_profile_id);

    return {
      ...widget,
      categories: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : { name: '기타' },
      creator_profiles: creator ? { id: creator.id, nickname: creator.nickname, character_image_url: creator.character_image_url } : { nickname: '제빵사' },
    };
  } catch (error) {
    console.error('getWidgetById error:', error);
    return null;
  }
}

export async function deleteWidget(id: string): Promise<boolean> {
  try {
    if (adminDb) {
      await adminDb.collection('widgets').doc(id).delete();
    } else {
      await deleteDoc(doc(db, 'widgets', id));
    }
    return true;
  } catch (error) {
    console.error('deleteWidget error:', error);
    return false;
  }
}

// ==========================================
// 3. 제빵사 프로필 (Creator Profiles)
// ==========================================

export async function getAllCreatorProfiles(): Promise<CreatorProfile[]> {
  const fetchPromise = (async () => {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('creator_profiles').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as CreatorProfile));
      } else {
        const snap = await getDocs(collection(db, 'creator_profiles'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as CreatorProfile));
      }
    } catch (error) {
      console.warn('getAllCreatorProfiles warning:', error);
      return [];
    }
  })();

  return await withTimeout(fetchPromise, 2500, []);
}

export async function getCreatorProfileByUserId(userId: string): Promise<CreatorProfile | null> {
  const fetchPromise = (async () => {
    try {
      const key = userId.toLowerCase().trim();
      if (adminDb) {
        // 1. Direct doc lookup by email or id
        const directSnap = await adminDb.collection('creator_profiles').doc(key).get();
        if (directSnap.exists) {
          return { id: directSnap.id, ...directSnap.data() } as CreatorProfile;
        }
        // 2. Query by user_id
        const snapByUserId = await adminDb.collection('creator_profiles').where('user_id', '==', userId).limit(1).get();
        if (!snapByUserId.empty) {
          return { id: snapByUserId.docs[0]!.id, ...snapByUserId.docs[0]!.data() } as CreatorProfile;
        }
        // 3. Query by email
        const snapByEmail = await adminDb.collection('creator_profiles').where('email', '==', key).limit(1).get();
        if (!snapByEmail.empty) {
          return { id: snapByEmail.docs[0]!.id, ...snapByEmail.docs[0]!.data() } as CreatorProfile;
        }
      } else {
        // 1. Direct doc lookup by email or id
        const directSnap = await getDoc(doc(db, 'creator_profiles', key));
        if (directSnap.exists()) {
          return { id: directSnap.id, ...directSnap.data() } as CreatorProfile;
        }
        // 2. Query by user_id
        const qUserId = query(collection(db, 'creator_profiles'), where('user_id', '==', userId), limit(1));
        const snapByUserId = await getDocs(qUserId);
        if (!snapByUserId.empty) {
          return { id: snapByUserId.docs[0]!.id, ...snapByUserId.docs[0]!.data() } as CreatorProfile;
        }
        // 3. Query by email
        const qEmail = query(collection(db, 'creator_profiles'), where('email', '==', key), limit(1));
        const snapByEmail = await getDocs(qEmail);
        if (!snapByEmail.empty) {
          return { id: snapByEmail.docs[0]!.id, ...snapByEmail.docs[0]!.data() } as CreatorProfile;
        }
      }
      return null;
    } catch (error) {
      console.warn('getCreatorProfileByUserId warning:', error);
      return null;
    }
  })();

  return await withTimeout(fetchPromise, 2500, null);
}

export async function getCreatorByNickname(nickname: string): Promise<CreatorProfile | null> {
  const fetchPromise = (async () => {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('creator_profiles').where('nickname', '==', nickname).limit(1).get();
        if (!snap.empty) {
          return { id: snap.docs[0]!.id, ...snap.docs[0]!.data() } as CreatorProfile;
        }
      } else {
        const q = query(collection(db, 'creator_profiles'), where('nickname', '==', nickname), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return { id: snap.docs[0]!.id, ...snap.docs[0]!.data() } as CreatorProfile;
        }
      }
      return null;
    } catch (error) {
      console.warn('getCreatorByNickname warning:', error);
      return null;
    }
  })();

  return await withTimeout(fetchPromise, 2500, null);
}

// ==========================================
// 4. 유저 (Users)
// ==========================================

export async function getUserProfile(userIdOrEmail: string): Promise<DbUser | null> {
  try {
    const key = userIdOrEmail.toLowerCase().trim();
    if (adminDb) {
      // 1. Direct doc lookup by email or id
      let docSnap = await adminDb.collection('users').doc(key).get();
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as DbUser;
      }
      // 2. Fallback search by uid
      const snapByUid = await adminDb.collection('users').where('uid', '==', userIdOrEmail).limit(1).get();
      if (!snapByUid.empty) {
        return { id: snapByUid.docs[0].id, ...snapByUid.docs[0].data() } as DbUser;
      }
    } else {
      let docRef = doc(db, 'users', key);
      let docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DbUser;
      }
      const q = query(collection(db, 'users'), where('uid', '==', userIdOrEmail), limit(1));
      const snapByUid = await getDocs(q);
      if (!snapByUid.empty) {
        return { id: snapByUid.docs[0].id, ...snapByUid.docs[0].data() } as DbUser;
      }
    }
    return null;
  } catch (error) {
    console.error('getUserProfile error:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<DbUser[]> {
  try {
    if (adminDb) {
      const snap = await adminDb.collection('users').orderBy('created_at', 'desc').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DbUser));
    } else {
      const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DbUser));
    }
  } catch (error) {
    console.error('getAllUsers error:', error);
    return [];
  }
}

// ==========================================
// 5. 관심 위젯 (Favorites)
// ==========================================

export async function getUserFavorites(userId: string): Promise<Widget[]> {
  try {
    let favoriteWidgetIds: string[] = [];

    if (adminDb) {
      const snap = await adminDb.collection('favorites').where('user_id', '==', userId).get();
      favoriteWidgetIds = snap.docs.map(d => d.data().widget_id);
    } else {
      const q = query(collection(db, 'favorites'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      favoriteWidgetIds = snap.docs.map(d => d.data().widget_id);
    }

    if (favoriteWidgetIds.length === 0) return [];

    const allWidgets = await getWidgets({ status: 'all' });
    return allWidgets.filter(w => favoriteWidgetIds.includes(w.id));
  } catch (error) {
    console.error('getUserFavorites error:', error);
    return [];
  }
}

export async function checkIsFavorited(userId: string, widgetId: string): Promise<boolean> {
  try {
    const favId = `${userId}_${widgetId}`;
    if (adminDb) {
      const docSnap = await adminDb.collection('favorites').doc(favId).get();
      return docSnap.exists;
    } else {
      const docSnap = await getDoc(doc(db, 'favorites', favId));
      return docSnap.exists();
    }
  } catch (error) {
    console.error('checkIsFavorited error:', error);
    return false;
  }
}

// ==========================================
// 6. 통계 / 카운터 업데이트
// ==========================================

export async function incrementWidgetViewCount(widgetId: string) {
  try {
    if (adminDb) {
      await adminDb.collection('widgets').doc(widgetId).update({
        view_count: (await import('firebase-admin')).firestore.FieldValue.increment(1),
      });
    } else {
      await updateDoc(doc(db, 'widgets', widgetId), {
        view_count: increment(1),
      });
    }
  } catch (e) {
    console.error('incrementWidgetViewCount error:', e);
  }
}

export async function incrementWidgetCopyCount(widgetId: string, userId?: string | null) {
  try {
    const now = new Date().toISOString();
    if (adminDb) {
      const adminModule = await import('firebase-admin');
      await adminDb.collection('widgets').doc(widgetId).update({
        copy_count: adminModule.firestore.FieldValue.increment(1),
      });
      await adminDb.collection('widget_events').add({
        widget_id: widgetId,
        user_id: userId || null,
        event_type: 'copy_embed',
        created_at: now,
      });
    } else {
      await updateDoc(doc(db, 'widgets', widgetId), {
        copy_count: increment(1),
      });
      await addDoc(collection(db, 'widget_events'), {
        widget_id: widgetId,
        user_id: userId || null,
        event_type: 'copy_embed',
        created_at: now,
      });
    }
  } catch (e) {
    console.error('incrementWidgetCopyCount error:', e);
  }
}

export async function toggleFavorite(userId: string, widgetId: string, isFavorited: boolean) {
  try {
    const favId = `${userId}_${widgetId}`;
    const now = new Date().toISOString();

    if (isFavorited) {
      // 추가
      if (adminDb) {
        const adminModule = await import('firebase-admin');
        await adminDb.collection('favorites').doc(favId).set({
          user_id: userId,
          widget_id: widgetId,
          created_at: now,
        });
        await adminDb.collection('widgets').doc(widgetId).update({
          like_count: adminModule.firestore.FieldValue.increment(1),
        });
      } else {
        await setDoc(doc(db, 'favorites', favId), {
          user_id: userId,
          widget_id: widgetId,
          created_at: now,
        });
        await updateDoc(doc(db, 'widgets', widgetId), {
          like_count: increment(1),
        });
      }
    } else {
      // 제거
      if (adminDb) {
        const adminModule = await import('firebase-admin');
        await adminDb.collection('favorites').doc(favId).delete();
        await adminDb.collection('widgets').doc(widgetId).update({
          like_count: adminModule.firestore.FieldValue.increment(-1),
        });
      } else {
        await deleteDoc(doc(db, 'favorites', favId));
        await updateDoc(doc(db, 'widgets', widgetId), {
          like_count: increment(-1),
        });
      }
    }
  } catch (e) {
    console.error('toggleFavorite error:', e);
    throw e;
  }
}

// ==========================================
// 8. 초대 코드 관리 (Cohort Invites)
// ==========================================

export async function getAllCohortInvites(): Promise<CohortInvite[]> {
  try {
    if (adminDb) {
      const snap = await adminDb.collection('cohort_invites').get();
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CohortInvite, 'id'>),
      }));
    } else {
      const snap = await getDocs(collection(db, 'cohort_invites'));
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CohortInvite, 'id'>),
      }));
    }
  } catch (e) {
    console.error('getAllCohortInvites error:', e);
    return [];
  }
}

export async function createCohortInvite(invite: Omit<CohortInvite, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...invite,
      email: invite.email.toLowerCase().trim(),
      nickname: invite.nickname.trim(),
      code: invite.code.trim(),
      cohort: invite.cohort?.trim() || '개발했슈 1기',
      role: invite.role || 'provider',
      is_used: false,
      used_by: null,
      used_at: null,
      created_at: now,
    };

    if (adminDb) {
      await adminDb.collection('cohort_invites').doc(payload.email).set(payload, { merge: true });
      return { success: true, id: payload.email };
    } else {
      await setDoc(doc(db, 'cohort_invites', payload.email), payload, { merge: true });
      return { success: true, id: payload.email };
    }
  } catch (e: any) {
    console.error('createCohortInvite error:', e);
    return { success: false, error: e.message || '초대 코드 등록 실패' };
  }
}

export async function deleteCohortInvite(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (adminDb) {
      await adminDb.collection('cohort_invites').doc(id).delete();
    } else {
      await deleteDoc(doc(db, 'cohort_invites', id));
    }
    return { success: true };
  } catch (e: any) {
    console.error('deleteCohortInvite error:', e);
    return { success: false, error: e.message || '초대 코드 삭제 실패' };
  }
}

