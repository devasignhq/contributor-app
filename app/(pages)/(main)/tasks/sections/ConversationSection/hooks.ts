import { MessageDto } from "@/app/models/message.model";
import { getTaskMessages, listenToTaskMessages } from "@/app/services/message.service";
import { useState, useEffect, useMemo, useRef } from "react";

export interface GroupedMessages {
    [dateLabel: string]: MessageDto[];
}

export const useManageMessages = (taskId: string, creatorId: string) => {
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [loading, setLoading] = useState(true);

    const groupedMessages = useMemo<GroupedMessages>(() => {
        return groupMessagesByDay(messages)
    }, [messages]);
    const orderedDateLabels = useMemo<string[]>(() => {
        return getOrderedDateLabels(groupedMessages)
    }, [groupedMessages]);

    useEffect(() => {
        if (!taskId) return;

        let unsubscribe: (() => void) | null = null;
        
        const initializeMessages = async () => {
            try {
                const initialMessages = await getTaskMessages(taskId);
                setMessages(initialMessages);
                setLoading(false);

                if (!creatorId) return;

                unsubscribe = listenToTaskMessages(
                    taskId, 
                    creatorId, 
                    (getLastContributorMessage(messages, creatorId)?.createdAt)?.toDate().toISOString() || "", 
                    (updatedMessages) => setMessages(prev => [...prev, ...updatedMessages])
                );
            } catch (error) {
                console.error('Failed to load messages:', error);
                setLoading(false);
            }
        };

        initializeMessages();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [creatorId, taskId]);

    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }, [orderedDateLabels]);

    return {
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
        return dateB.getTime() - dateA.getTime();
    });
};

const getLastContributorMessage = (messages: MessageDto[], creatorId: string) => {
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].userId === creatorId) {
            return messages[i];
        }
    }
    return null;
};