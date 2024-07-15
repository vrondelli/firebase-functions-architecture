import { Firestore } from 'firebase-admin/firestore';

export const clearCollection = async (db: Firestore, collectionPath: string) => {
  const collectionRef = db.collection(collectionPath);
  const querySnapshot = await collectionRef.get();
  const batch = db.batch();
  
  querySnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

export const mockRequest = (body: any) => {
  return {
    body,
  } as any;
};

export const mockResponse = () => {
  const res = {statusCode: 200, body: {}} as any;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: any) => {
    res.body = body;
    return res;
  };
  res.send = (body: any) => {
    res.body = body;
    return res;
  }
  return (res as any);
};