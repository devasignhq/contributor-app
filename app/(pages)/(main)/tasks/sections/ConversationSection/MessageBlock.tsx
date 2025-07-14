import { MessageDto } from "@/app/models/message.model";
import useUserStore from "@/app/state-management/useUserStore";
import { formatTime } from "@/app/utils/helper";

type MessageBlockProps = {
    message: MessageDto;
    largeMargin: boolean;
}

const MessageBlock = ({ message, largeMargin }: MessageBlockProps) => {
    const { currentUser } = useUserStore();

    return (
        <div className={`max-w-[78%] p-[15px] space-y-2.5 ${largeMargin ? "mb-[30px]" : "mb-2.5"} 
            ${message.userId !== currentUser?.userId 
                ? "bg-primary-300 float-left" 
                : "bg-dark-300 float-right"}`
        }>
            <p className="text-body-medium text-light-100">{message.body}</p>
            <small className="text-body-tiny font-bold text-dark-200">
                {formatTime(message.createdAt.toDate().toISOString())}
            </small>
        </div>
    )
}
 
export default MessageBlock;