"use client";
import { MessageDto, MessageType } from "@/app/models/message.model";
import { MessageAPI } from "@/app/services/message.service";
import useUserStore from "@/app/state-management/useUserStore";
import { formatTime } from "@/app/utils/helper";
import { useRef, useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";

type MessageBlockProps = {
    message: MessageDto;
    margin: string;
    setMessages: React.Dispatch<React.SetStateAction<MessageDto[]>>;
}

const MessageBlock = ({ message, margin, setMessages }: MessageBlockProps) => {
    const { currentUser } = useUserStore();
    const messageRef = useRef<HTMLDivElement>(null);

    // Mark message as read when it comes into view
    useEffect(() => {
        // Only mark messages as read if they're not from the current user and haven't been read yet
        if (!messageRef.current || message.userId === currentUser?.userId || message.read) {
            return;
        }

        const observer = new IntersectionObserver(
            async (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    try {
                        await MessageAPI.markMessageAsRead(message.id);
                        // Update local state to reflect the read status
                        setMessages(prev => prev.map(msg =>
                            msg.id === message.id ? { ...msg, read: true } : msg
                        ));
                    } catch (error) {
                        console.error('Failed to mark message as read:', error);
                    }
                    // Stop observing once marked as read
                    observer.disconnect();
                }
            },
            {
                threshold: 0.5, // Mark as read when 50% of the message is visible
                rootMargin: '0px 0px -50px 0px' // Add some margin to ensure message is well within view
            }
        );

        observer.observe(messageRef.current);

        return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.userId]);

    return message.type === MessageType.GENERAL ? (
        <div 
            ref={messageRef}
            className={`max-w-[78%] w-fit p-[15px] space-y-2.5 ${margin} 
                ${message.userId === currentUser?.userId 
                    ? "bg-dark-300 ml-auto" 
                    : "bg-primary-300 mr-auto"}`
            }
        >
            <p className="text-body-medium text-light-100">{message.body}</p>
            <small className="text-body-tiny font-bold text-dark-200">
                {formatTime(message.createdAt.toDate().toISOString())}
            </small>
        </div>
    ) : (
        <>
            {message.userId === currentUser?.userId && (
                <div 
                    ref={messageRef}
                    className={`max-w-[78%] w-fit space-y-2.5 ml-auto ${margin}`}
                >
                    <div className="max-w-full w-fit p-[15px] ml-auto bg-dark-400 border border-dark-300 space-y-5">
                        <p className="text-body-medium text-light-100">
                            You requested for an extension of{" "}
                            {message.metadata?.requestedTimeline}{" "}
                            {message.metadata?.timelineType.toLowerCase()}(s).
                        </p>
                        {!message.metadata?.reason && (
                            <small className="text-body-tiny font-bold text-dark-200">
                                {formatTime(message.createdAt.toDate().toISOString())}
                            </small>
                        )}
                    </div>
                    {message.metadata?.reason && (
                        <div className="max-w-full w-fit p-[15px] ml-auto bg-dark-400 border border-dark-300 space-y-2.5">
                            <p className="text-body-medium text-light-100">{message.metadata?.reason}</p>
                            <small className="text-body-tiny font-bold text-dark-200">
                                {formatTime(message.createdAt.toDate().toISOString())}
                            </small>
                        </div>
                    )}
                </div>
            )}
            {message.userId !== currentUser?.userId && (
                <div 
                    ref={messageRef}
                    className={`max-w-[78%] w-fit mr-auto p-2.5 bg-dark-400 border flex items-center gap-2.5 ${margin} 
                        ${message.metadata?.reason === "ACCEPTED" ? "border-indicator-100" : "border-indicator-500"}`
                    }
                >
                    {message.metadata?.reason === "ACCEPTED" ? (
                        <FiCheckCircle className="text-2xl text-indicator-100" />
                    ) : (
                        <MdOutlineCancel className="text-2xl text-indicator-500" />
                    )}
                    <p className="text-body-medium text-dark-100">
                        {message.metadata?.reason === "ACCEPTED" 
                            ? `Timeline extended by ${message.metadata?.requestedTimeline} ${message.metadata?.timelineType.toLowerCase()}(s).` 
                            : `Your ${message.metadata?.requestedTimeline} ${message.metadata?.timelineType.toLowerCase()}(s) extension request was rejected.`
                        }
                    </p>
                </div>
            )}
        </>
    );
}
 
export default MessageBlock;