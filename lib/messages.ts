import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ScheduledMessage, MessageFormData } from "@/types/message";

const MESSAGES_COLLECTION = "scheduledMessages";

export const createScheduledMessage = async (
  data: MessageFormData
): Promise<string> => {
  if (!db) throw new Error("Firebase no está inicializado");
  
  const scheduledDateTime = new Date(
    `${data.scheduledDate}T${data.scheduledTime}`
  );

  const messageData = {
    phoneNumber: data.phoneNumber,
    message: data.message,
    scheduledDate: Timestamp.fromDate(scheduledDateTime),
    type: data.type,
    status: "pending" as const,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
  return docRef.id;
};

export const getScheduledMessages = async (): Promise<ScheduledMessage[]> => {
  if (!db) throw new Error("Firebase no está inicializado");
  
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy("scheduledDate", "asc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      phoneNumber: data.phoneNumber,
      message: data.message,
      scheduledDate: data.scheduledDate.toDate(),
      type: data.type,
      status: data.status,
      createdAt: data.createdAt.toDate(),
      sentAt: data.sentAt?.toDate(),
      errorMessage: data.errorMessage,
    } as ScheduledMessage;
  });
};

export const getPendingMessages = async (): Promise<ScheduledMessage[]> => {
  if (!db) throw new Error("Firebase no está inicializado");
  
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where("status", "==", "pending"),
    orderBy("scheduledDate", "asc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      phoneNumber: data.phoneNumber,
      message: data.message,
      scheduledDate: data.scheduledDate.toDate(),
      type: data.type,
      status: data.status,
      createdAt: data.createdAt.toDate(),
      sentAt: data.sentAt?.toDate(),
      errorMessage: data.errorMessage,
    } as ScheduledMessage;
  });
};

export const updateMessageStatus = async (
  id: string,
  status: "sent" | "error",
  errorMessage?: string
): Promise<void> => {
  if (!db) throw new Error("Firebase no está inicializado");
  
  const messageRef = doc(db, MESSAGES_COLLECTION, id);
  const updateData: any = {
    status,
  };

  if (status === "sent") {
    updateData.sentAt = Timestamp.now();
  }

  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  await updateDoc(messageRef, updateData);
};

export const deleteScheduledMessage = async (id: string): Promise<void> => {
  if (!db) throw new Error("Firebase no está inicializado");
  
  await deleteDoc(doc(db, MESSAGES_COLLECTION, id));
};

export const subscribeToMessages = (
  callback: (messages: ScheduledMessage[]) => void
): (() => void) => {
  if (!db) {
    console.error("Firebase no está inicializado");
    return () => {};
  }
  
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy("scheduledDate", "asc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        phoneNumber: data.phoneNumber,
        message: data.message,
        scheduledDate: data.scheduledDate.toDate(),
        type: data.type,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        sentAt: data.sentAt?.toDate(),
        errorMessage: data.errorMessage,
      } as ScheduledMessage;
    });
    callback(messages);
  });
};
