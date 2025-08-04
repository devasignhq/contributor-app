"use client";
import { MessageDto, MessageType } from "@/app/models/message.model";
import useUserStore from "@/app/state-management/useUserStore";
import { formatTime } from "@/app/utils/helper";
import { FiCheckCircle } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";

type MessageBlockProps = {
    message: MessageDto;
    margin: string;
}

const MessageBlock = ({ message, margin }: MessageBlockProps) => {
    const { currentUser } = useUserStore();

    return message.type === MessageType.GENERAL ? (
        <div className={`max-w-[78%] w-fit p-[15px] space-y-2.5 ${margin} 
            ${message.userId === currentUser?.userId 
                ? "bg-dark-300 ml-auto" 
                : "bg-primary-300 mr-auto"}`
        }>
            <p className="text-body-medium text-light-100">{message.body}</p>
            <small className="text-body-tiny font-bold text-dark-200">
                {formatTime(message.createdAt.toDate().toISOString())}
            </small>
        </div>
    ):(
        <>
            {message.userId === currentUser?.userId && (
                <div className={`max-w-[78%] w-fit space-y-2.5 ml-auto ${margin}`}>
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
                <div className={`max-w-[78%] w-fit mr-auto p-2.5 bg-dark-400 border flex items-center gap-2.5 ${margin} 
                    ${message.metadata?.reason === "ACCEPTED" ? "border-indicator-100" : "border-indicator-500"}`
                }>
                    {message.metadata?.reason === "ACCEPTED" ? (
                        <FiCheckCircle className="text-2xl text-indicator-100" />
                    ):(
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