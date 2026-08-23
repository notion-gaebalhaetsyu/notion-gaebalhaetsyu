import { db } from './client';
import { doc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';

export async function toggleFavorite(userId: string, widgetId: string, isFavorited: boolean) {
  const favId = `${userId}_${widgetId}`;
  const now = new Date().toISOString();

  if (isFavorited) {
    await setDoc(doc(db, 'favorites', favId), {
      user_id: userId,
      widget_id: widgetId,
      created_at: now,
    });
    await updateDoc(doc(db, 'widgets', widgetId), {
      like_count: increment(1),
    });
  } else {
    await deleteDoc(doc(db, 'favorites', favId));
    await updateDoc(doc(db, 'widgets', widgetId), {
      like_count: increment(-1),
    });
  }
}
