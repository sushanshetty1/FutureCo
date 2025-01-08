import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const NotificationBell = ({ userId, onClick }) => {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasUnread(snapshot.size > 0);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-white hover:text-[#a6ff00]"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {hasUnread && (
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
      )}
    </Button>
  );
};

export default NotificationBell;