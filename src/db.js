import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// This wrapper mimics the window.storage API used in the artifact
// so the App.jsx code works without any changes.
// private data -> "private" collection
// shared data  -> "public" collection

const storage = {
  async get(key, shared) {
    const col = shared ? "public" : "private";
    const ref = doc(db, col, key);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Not found: " + key);
    return { key, value: snap.data().value, shared: !!shared };
  },

  async set(key, value, shared) {
    const col = shared ? "public" : "private";
    const ref = doc(db, col, key);
    await setDoc(ref, { value, _key: key, _updated: new Date().toISOString() });
    return { key, value, shared: !!shared };
  },

  async delete(key, shared) {
    const col = shared ? "public" : "private";
    const ref = doc(db, col, key);
    await deleteDoc(ref);
    return { key, deleted: true, shared: !!shared };
  },

  async list(prefix, shared) {
    const col = shared ? "public" : "private";
    const ref = collection(db, col);
    const snap = await getDocs(ref);
    const keys = [];
    snap.forEach(d => {
      if (!prefix || d.id.startsWith(prefix)) keys.push(d.id);
    });
    return { keys, prefix: prefix || "", shared: !!shared };
  }
};

export default storage;
