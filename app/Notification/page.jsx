"use client"
import React, { useEffect, useState } from 'react';
import { Bell, Check, X, Trophy, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { auth, db } from '../../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Navbar from '@/components/Navbar.jsx';

const NotificationsEmptyState = () => (
  <Card className="bg-black border border-white/10">
    <CardContent className="flex flex-col items-center justify-center py-16">
      <Bell className="h-16 w-16 text-white/20 mb-6" />
      <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
      <p className="text-white/60 text-center max-w-sm">
        {`When you receive notifications about applications or updates, they'll appear here.`}
      </p>
    </CardContent>
  </Card>
);

const ErrorState = ({ message }) => (
  <Alert variant="destructive" className="bg-red-900/50 border-red-900">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {message}
    </AlertDescription>
  </Alert>
);

const Notifications = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isGitHubUser = user?.providerData?.[0]?.providerId === 'github.com';

  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');
    const q = isGitHubUser
      ? query(
          notificationsRef, 
          where('recipientId', '==', user.uid)
        )
      : query(
          notificationsRef, 
          where('founderId', '==', user.uid)
        );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        }));

        const sortedNotifications = notificationsData.sort((a, b) => 
          b.timestamp - a.timestamp
        );

        setNotifications(sortedNotifications);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setError('Unable to load notifications. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isGitHubUser]);

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Unable to mark notification as read. Please try again.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_approved':
        return <Trophy className="h-6 w-6 text-green-500" />;
      case 'application_rejected':
        return <X className="h-6 w-6 text-red-500" />;
      case 'new_application':
        return <UserPlus className="h-6 w-6 text-blue-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case 'application_approved':
        return {
          title: 'Application Approved! 🎉',
          description: `Congratulations! Your application for ${notification.roleTitle} has been approved. The founder will contact you soon.`
        };
      case 'application_rejected':
        return {
          title: 'Application Status Update',
          description: `We regret to inform you that your application for ${notification.roleTitle} was not selected at this time. Keep exploring other opportunities!`
        };
      case 'new_application':
        return {
          title: 'New Application Received',
          description: `${notification.applicantName} has applied for the ${notification.roleTitle} position. Review their application now!`
        };
      default:
        return {
          title: 'Notification',
          description: notification.message
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-white/70">
            {notifications.length > 0 
              ? 'Stay updated with your application status and new candidates'
              : 'Your notification center'}
          </p>
        </div>

        {error ? (
          <ErrorState message={error} />
        ) : notifications.length === 0 ? (
          <NotificationsEmptyState />
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const content = getNotificationContent(notification);
              
              return (
                <Card 
                  key={notification.id} 
                  className={`bg-black border ${notification.read ? 'border-white/10' : 'border-[#a6ff00]'}`}
                >
                  <CardHeader className="flex flex-row items-start space-y-0 gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white mb-1">{content.title}</CardTitle>
                      <CardDescription className="text-white/70">
                        {content.description}
                      </CardDescription>
                      <div className="flex items-center mt-4 text-sm text-white/50">
                        <span>
                          {notification.timestamp?.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-[#a6ff00] hover:text-[#a6ff00]/80"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;