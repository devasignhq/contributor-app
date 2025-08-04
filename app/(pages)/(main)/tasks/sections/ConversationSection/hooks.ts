import { MessageDto, MessageType } from "@/app/models/message.model";
import { MessageAPI } from "@/app/services/message.service";
import useUserStore from "@/app/state-management/useUserStore";
import { useEffectOnce } from "@/app/utils/hooks";
import { useState, useEffect, useMemo, useRef, useContext } from "react";
import { ActiveTaskContext } from "../../contexts/ActiveTaskContext";

export interface GroupedMessages {
    [dateLabel: string]: MessageDto[];
}

export const useManageMessages = (taskId: string, creatorId: string) => {
    const { currentUser } = useUserStore();
    const { activeTask, setActiveTask } = useContext(ActiveTaskContext);
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [loading, setLoading] = useState(true);

    const groupedMessages = useMemo<GroupedMessages>(() => {
        return groupMessagesByDay(messages)
    }, [messages]);
    const orderedDateLabels = useMemo<string[]>(() => {
        return getOrderedDateLabels(groupedMessages)
    }, [groupedMessages]);

    useEffectOnce(() => {
        if (!taskId || !creatorId || !currentUser) return;

        let unsubscribeFromTaskMessages: (() => void) | null = null;
        let unsubscribeFromExtensionRequests: (() => void) | null = null;
        
        const initializeMessages = async () => {
            try {
                const initialMessages = await MessageAPI.getTaskMessages(taskId);
                setMessages(initialMessages);
                setLoading(false);

                unsubscribeFromTaskMessages = MessageAPI.listenToTaskMessages(
                    taskId, 
                    creatorId, 
                    (getLastUserMessage(initialMessages, creatorId)?.createdAt)?.toDate().toISOString() || "", 
                    (updatedMessages) => {
                        if (updatedMessages.length > 0) {
                            const latestMessage = updatedMessages[updatedMessages.length - 1];
                            setMessages(prev => [...prev, latestMessage]);

                            if (latestMessage?.type === MessageType.TIMELINE_MODIFICATION &&
                                latestMessage?.metadata?.reason === "ACCEPTED"
                            ) {
                                setActiveTask({ 
                                    ...activeTask!,
                                    timeline: latestMessage?.metadata?.requestedTimeline,
                                    timelineType: latestMessage?.metadata?.timelineType,
                                    updatedAt: latestMessage?.createdAt?.toDate()?.toISOString()
                                })
                            }
                        }
                    }
                );
                unsubscribeFromExtensionRequests = MessageAPI.listenToExtensionRequests(
                    taskId, 
                    currentUser.userId, 
                    (getLastUserMessage(initialMessages, currentUser.userId)?.createdAt)?.toDate().toISOString() || "",
                    (updatedMessages) => {
                        if (updatedMessages.length > 0) {
                            setMessages(prev => [...prev, updatedMessages[updatedMessages.length - 1]]);
                        }
                    }
                );
            } catch (error) {
                console.error('Failed to load messages:', error);
                setLoading(false);
            }
        };

        initializeMessages();

        return () => {
            if (unsubscribeFromTaskMessages) unsubscribeFromTaskMessages();
            if (unsubscribeFromExtensionRequests) unsubscribeFromExtensionRequests();
        };
    }, [creatorId, currentUser, taskId]);

    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }, [groupedMessages.length, messages.length]);

    return {
        messageBoxRef,
        messages,
        groupedMessages,
        orderedDateLabels,
        loadingInitialMessages: loading,
        setMessages
    };
};

export const formatDateLabel = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Reset time to midnight for accurate day comparison
    const messageDate = new Date(date);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const messageMidnight = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    // Calculate days difference
    const timeDiff = todayMidnight.getTime() - messageMidnight.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
        return "Today";
    } else if (daysDiff === 1) {
        return "Yesterday";
    } else if (daysDiff >= 2 && daysDiff <= 6) {
        // Return day name for 2-6 days ago
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return dayNames[messageDate.getDay()];
    } else {
        // Return formatted date for 7+ days ago
        const day = messageDate.getDate();
        const month = messageDate.toLocaleString('en-US', { month: 'long' });
        const year = messageDate.getFullYear();
        
        // Add ordinal suffix to day
        const getOrdinalSuffix = (day: number): string => {
            if (day >= 11 && day <= 13) {
                return 'th';
            }
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        
        return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
    }
};

export const groupMessagesByDay = (messages: MessageDto[]): GroupedMessages => {
  const grouped: GroupedMessages = {};
  
    messages.forEach(message => {
        // Handle both ISO string and Timestamp formats
        const messageDate = message.createdAt.toDate();
        
        const dateLabel = formatDateLabel(messageDate);
        
        if (!grouped[dateLabel]) {
            grouped[dateLabel] = [];
        }
        
        grouped[dateLabel].push(message);
    });
    
    return grouped;
};

export const getOrderedDateLabels = (groupedMessages: GroupedMessages): string[] => {
  const labels = Object.keys(groupedMessages);
  
    // Custom sort function to maintain chronological order
    return labels.sort((a, b) => {
        // Get the first message from each group to determine the actual date
        const messagesA = groupedMessages[a];
        const messagesB = groupedMessages[b];
        
        if (!messagesA.length || !messagesB.length) return 0;
        
        const dateA = messagesA[0].createdAt.toDate();
        const dateB = messagesB[0].createdAt.toDate();
        
        // Sort newest first (descending)
        return dateA.getTime() - dateB.getTime();
    });
};

const getLastUserMessage = (messages: MessageDto[], userId: string) => {
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].userId === userId) {
            return messages[i];
        }
    }
    return null;
};