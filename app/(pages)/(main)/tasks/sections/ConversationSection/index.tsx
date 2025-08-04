"use client";
import Image from "next/image";
import { MessageType } from "@/app/models/message.model";
import { useContext, useRef, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import { HiPlus } from "react-icons/hi";
import { createMessage } from "@/app/services/message.service";
import { toast } from "react-toastify";
import { ActiveTaskContext } from "../../contexts/ActiveTaskContext";
import { useManageMessages } from "./hooks";
import MessageBlock from "./MessageBlock";
import useUserStore from "@/app/state-management/useUserStore";

const ConversationSection = () => {
    const { currentUser } = useUserStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { activeTask } = useContext(ActiveTaskContext);
    const [body, setBody] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [sendingMessage, setSendingMessage] = useState(false);

    const {
        messageBoxRef,
        messages,
        groupedMessages,
        orderedDateLabels,
        loadingInitialMessages,
        setMessages
    } = useManageMessages(activeTask!.id, activeTask!.creator?.userId || "");

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    const addNewMessage = async () => {
        setSendingMessage(true);

        try {
            const newMessage = await createMessage({
                userId: currentUser!.userId,
                taskId: activeTask!.id,
                type: MessageType.GENERAL,
                body,
            });

            setMessages(prev => [...prev, newMessage]);
            setBody("");
            setAttachments([]);
        } catch {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSendingMessage(false);
        }
    };

    return (
        <div className="grow border-x border-dark-200 flex flex-col">
            {loadingInitialMessages ? (
                <div className="grow grid place-content-center text-body-medium text-light-100">
                    <p>Loading Messages...</p>
                </div>
            ):(
                <div 
                    ref={messageBoxRef} 
                    className={`px-5 mb-[30px] overflow-y-auto ${orderedDateLabels.length < 1 ? "grow grid place-content-center" : "h-fit mt-auto"}`}
                >
                    {orderedDateLabels.length < 1 ? (
                        <div className="space-y-2.5 text-center">
                            <Image 
                                src="/mdi_greeting.png" 
                                alt="" 
                                width={24}
                                height={24}
                                className="mx-auto"
                            />
                            <h6 className="text-body-large text-light-100">Say “Hi” to the project maintainer</h6>
                            <p className="text-body-tiny text-dark-100">
                                Ask questions when you have one and the PM will 
                                <br /> get it via email even while offline.
                            </p>
                        </div>
                    ):(
                        orderedDateLabels.map((dateLabel) => (
                            <div key={dateLabel} className="w-full">
                                <div className="w-fit sticky top-2.5 px-[15px] py-[3px] my-5 mx-auto bg-dark-500 border border-primary-200 text-body-medium text-light-200">
                                    {dateLabel}
                                </div>
                                <div className="w-full flex flex-col">
                                    {groupedMessages[dateLabel].map((message, index) => (
                                        <MessageBlock
                                            key={message.id}
                                            message={message}
                                            margin={
                                                messages[messages.length - 1].id === message.id
                                                    ? "mb-0"
                                                    : groupedMessages[dateLabel][index + 1]?.userId !== message.userId
                                                        ? "mb-[30px]"
                                                        : "mb-2.5"
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            <div className="w-full px-5 mb-[30px]">
                <div className={`py-[15px] pl-5 pr-2.5 border border-dark-100 space-y-5 ${sendingMessage && "animate-pulse"}`}>
                    <textarea 
                        ref={textareaRef}
                        onInput={adjustHeight}
                        placeholder="Write message and send to PM..."
                        className="w-full resize-none text-light-100 min-h-[20px]"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={loadingInitialMessages || sendingMessage}
                    />
                    <div className="flex items-center justify-between">
                        <button 
                            className="flex items-center gap-[5px] text-primary-100 text-button-large font-extrabold hover:text-light-100"
                            onClick={() => {}}
                            disabled={loadingInitialMessages || sendingMessage}
                        >
                            <span>Upload File</span>
                            <HiPlus className="text-2xl" />
                        </button>
                        <button 
                            className="h-[30px] w-[30px] text-dark-500 bg-primary-400 hover:bg-light-100 grid place-items-center"
                            onClick={addNewMessage}
                            disabled={loadingInitialMessages || sendingMessage || (!body.trim() && attachments.length < 1)}
                        >
                            <FiArrowUp className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default ConversationSection;