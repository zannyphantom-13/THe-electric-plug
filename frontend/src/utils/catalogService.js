import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// ─── DEFAULTS ────────────────────────────────────────────────────────────────
export const DEFAULT_CATEGORIES = [
  { name: 'Smartphones',      order: 0 },
  { name: 'Laptops',          order: 1 },
  { name: 'Televisions',      order: 2 },
  { name: 'Audio',            order: 3 },
  { name: 'Gaming',           order: 4 },
  { name: 'Accessories',      order: 5 },
  { name: 'Home Appliances',  order: 6 },
];

export const DEFAULT_BRANDS = [
  { name: 'Apple',     order: 0 },
  { name: 'Samsung',   order: 1 },
  { name: 'Sony',      order: 2 },
  { name: 'LG',        order: 3 },
  { name: 'HP',        order: 4 },
  { name: 'Dell',      order: 5 },
  { name: 'Lenovo',    order: 6 },
  { name: 'Xiaomi',    order: 7 },
  { name: 'Hisense',   order: 8 },
  { name: 'Tecno',     order: 9 },
];

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const categoriesRef = () => collection(db, 'categories');

export function listenToCategories(callback) {
  const q = query(categoriesRef(), orderBy('order', 'asc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addCategory(data) {
  return addDoc(categoriesRef(), { ...data, createdAt: new Date() });
}

export async function updateCategory(id, data) {
  return updateDoc(doc(db, 'categories', id), data);
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, 'categories', id));
}

// ─── BRANDS ──────────────────────────────────────────────────────────────────
const brandsRef = () => collection(db, 'brands');

export function listenToBrands(callback) {
  const q = query(brandsRef(), orderBy('order', 'asc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addBrand(data) {
  return addDoc(brandsRef(), { ...data, createdAt: new Date() });
}

export async function updateBrand(id, data) {
  return updateDoc(doc(db, 'brands', id), data);
}

export async function deleteBrand(id) {
  return deleteDoc(doc(db, 'brands', id));
}
