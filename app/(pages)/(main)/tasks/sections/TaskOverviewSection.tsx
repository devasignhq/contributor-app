"use client";
import ButtonPrimary from "@/app/components/ButtonPrimary";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
// import TaskActivityCard from "../components/TaskActivityCard";
import Link from "next/link";
import { useInfiniteScroll, useToggle } from "ahooks";
import SubmitTaskModal from "../modals/SubmitTaskModal";
import RequestTimeExtensionModal from "../modals/RequestTimeExtensionModal";
import { useContext } from "react";
import { ActiveTaskContext } from "../page";
import { moneyFormat, taskStatusFormatter } from "@/app/utils/helper";
import { TaskDto, TIMELINE_TYPE } from "@/app/models/task.model";
import { FaRegClock } from "react-icons/fa6";
import { Data } from "ahooks/lib/useInfiniteScroll/types";
import { TaskAPI } from "@/app/services/task.service";
import { HiOutlineRefresh } from "react-icons/hi";

const TaskOverviewSection = () => {
    const { activeTask } = useContext(ActiveTaskContext);
    const [openSubmitTaskModal, { toggle: toggleSubmitTaskModal }] = useToggle(false);
    const [openRequestTimeExtensionModal, { toggle: toggleRequestTimeExtensionModal }] = useToggle(false);
    
    const {
        data: activities,
        loading: loadingActivities,
        loadingMore: loadingMoreActivities,
        noMore: noMoreActivities,
        loadMore: loadMoreActivities,
        reload: reloadActivities,
    } = useInfiniteScroll<Data>(
        async (currentData) => {
            const pageToLoad = currentData ? currentData.pagination.page + 1 : 1;
            
            const response = await TaskAPI.getTaskActivities(
                activeTask!.id,
                { page: pageToLoad, limit: 30 }
            );

            return { 
                list: response.data,
                pagination: response.pagination,
            };
        }, {
            isNoMore: (data) => !data?.pagination.hasMore,
            reloadDeps: [activeTask]
        }
    );

    return (
        <>
        <section className="min-w-[360px] w-[12%] h-full pt-[30px] flex flex-col">
            <div className="pl-5 pb-[30px] space-y-[30px] border-b border-dark-200">
                <div className="flex items-center justify-between">
                    <h6 className="text-headline-small text-light-100">Overview</h6>
                    <p className={`w-fit py-0.5 px-[7px] text-body-tiny font-bold ${taskStatusFormatter(activeTask!.status)[1]}`}>
                        {taskStatusFormatter(activeTask!.status)[0]}
                    </p>
                </div>
                {activeTask?.status !== "OPEN" && (
                    <div className="space-y-2.5">
                        <p className="text-body-tiny text-light-100">Project</p>
                        <div className="flex items-center gap-1">
                            <p className="text-body-large text-light-200">{activeTask?.project?.name}</p>
                            <Link href={`https://github.com/${activeTask?.project?.name}`} target="_blank">
                                <FiArrowUpRight className="text-2xl text-primary-100 hover:text-light-100" />
                            </Link>
                        </div>
                    </div>
                )}
                <div className="space-y-2.5">
                    <p className="text-body-tiny text-light-100">Bounty</p>
                    <p className="text-body-large text-light-200">{moneyFormat(activeTask?.bounty || "")} USDC</p>
                </div>
                <div className="space-y-2.5">
                    <p className="text-body-tiny text-light-100">Time Left</p>
                    <div className="flex items-center gap-5">
                        <p className="text-body-large text-light-200">{getTimeLeft(activeTask!)}</p>
                        <button 
                            onClick={toggleRequestTimeExtensionModal} 
                            className="group text-primary-100 flex items-center gap-[5px]"
                        >
                            <span className="text-button-large group-hover:text-light-100">Get Extension</span>
                            <FaRegClock className="text-2xl" />
                        </button>
                    </div>
                </div>
                {activeTask?.status !== "IN_PROGRESS" && (
                    <ButtonPrimary
                        format="SOLID"
                        text="Submit Task"
                        sideItem={<FiArrowRight />}
                        attributes={{ onClick: toggleSubmitTaskModal }}
                    />
                )}
            </div>
            <div className="pt-[30px] pl-5 flex items-center justify-between">
                <h6 className="text-headline-small text-light-100">Activities</h6>
                <button 
                    onClick={reloadActivities}
                    disabled={loadingActivities || loadingMoreActivities}
                    className={(loadingActivities || loadingMoreActivities) ? "rotate-loading" : ""}
                >
                    <HiOutlineRefresh className="text-2xl text-light-200 hover:text-light-100" />
                </button>
            </div>
            <div className="pl-5 pb-5 mt-[30px] overflow-y-auto space-y-[15px]">
                {/* {activities?.list?.map((activity) => (
                    <TaskActivityCard
                        key={activity.id}
                        issueNumber={activeTask!.issue.number}
                        activity={activity}
                        issueUrl={activeTask!.issue.url}
                    />
                ))} */}
                {(!loadingActivities) && (
                    <p className="text-body-medium text-light-100">No activity to show</p>
                )}
                {(loadingActivities && activities?.list && activities.list.length < 1) && (
                    <p className="text-body-medium text-light-100">Loading activities...</p>
                )}
                {loadingMoreActivities && (
                    <p className="text-body-medium text-light-100">Loading more activities...</p>
                )}
                {(!loadingMoreActivities && !noMoreActivities) && (
                    <button 
                        className="text-body-medium text-light-200 font-bold hover:text-light-100 pt-2.5"
                        onClick={loadMoreActivities}
                    >
                        Load More
                    </button>
                )}
            </div>
        </section>
        
        {openSubmitTaskModal && <SubmitTaskModal toggleModal={toggleSubmitTaskModal} />}
        {openRequestTimeExtensionModal && <RequestTimeExtensionModal toggleModal={toggleRequestTimeExtensionModal} />}
        </>
    );
}
 
export default TaskOverviewSection;

/**
 * Calculates the time left for a task based on its timeline, timelineType, and acceptedAt date
 * @param task - The task object containing timeline information
 * @returns Formatted string showing time left (e.g., "1 week(s) 5 day(s)", "1 week(s)", "5 day(s)")
 */
export const getTimeLeft = (task: TaskDto): string => {
    // If no timeline is set, return empty string or a default message
    if (!task.timeline || !task.timelineType) {
        return "No deadline set";
    }

    // Parse the acceptedAt date
    const acceptedAt = new Date(task.acceptedAt!);
    const now = new Date();

    // Calculate total days for the timeline
    let totalTimelineDays: number;
    
    if (task.timelineType === TIMELINE_TYPE.WEEK) {
        // Handle float values for weeks (e.g., 2.5 = 2 weeks + 5 days)
        const weeks = Math.floor(task.timeline);
        const extraDays = Math.round((task.timeline - weeks) * 10); // 0.5 * 10 = 5 days
        totalTimelineDays = (weeks * 7) + extraDays;
    } else if (task.timelineType === TIMELINE_TYPE.DAY) {
        totalTimelineDays = task.timeline;
    } else {
        return "Invalid timeline type";
    }

    // Calculate the deadline
    const deadline = new Date(acceptedAt);
    deadline.setDate(deadline.getDate() + totalTimelineDays);

    // Calculate the difference in milliseconds
    const timeDiff = deadline.getTime() - now.getTime();

    // If the deadline has passed, return overdue message
    if (timeDiff <= 0) {
        return "Overdue";
    }

    // Convert milliseconds to days
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Format the output
    return formatTimeLeft(daysLeft);
};

/**
 * Formats the number of days left into a readable string
 * @param totalDays - Total number of days left
 * @returns Formatted string (e.g., "1 week(s) 5 day(s)", "1 week(s)", "5 day(s)")
 */
const formatTimeLeft = (totalDays: number): string => {
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    const parts: string[] = [];

    if (weeks > 0) {
        parts.push(`${weeks} week${weeks !== 1 ? '(s)' : ''}`);
    }

    if (days > 0) {
        parts.push(`${days} day${days !== 1 ? '(s)' : ''}`);
    }

    // If no time left (shouldn't happen due to overdue check, but safety)
    if (parts.length === 0) {
        return "Less than 1 day";
    }

    return parts.join(' ');
};

/**
 * Alternative version that returns an object with more detailed information
 */
export const getDetailedTimeLeft = (task: TaskDto) => {
    if (!task.timeline || !task.timelineType) {
        return {
            isValid: false,
            isOverdue: false,
            totalDays: 0,
            weeks: 0,
            days: 0,
            formatted: "No deadline set",
            deadline: null
        };
    }

    const acceptedAt = new Date(task.acceptedAt!);
    const now = new Date();

    let totalTimelineDays: number;
    
    if (task.timelineType === TIMELINE_TYPE.WEEK) {
        const weeks = Math.floor(task.timeline);
        const extraDays = Math.round((task.timeline - weeks) * 10);
        totalTimelineDays = (weeks * 7) + extraDays;
    } else if (task.timelineType === TIMELINE_TYPE.DAY) {
        totalTimelineDays = task.timeline;
    } else {
        return {
            isValid: false,
            isOverdue: false,
            totalDays: 0,
            weeks: 0,
            days: 0,
            formatted: "Invalid timeline type",
            deadline: null
        };
    }

    const deadline = new Date(acceptedAt);
    deadline.setDate(deadline.getDate() + totalTimelineDays);

    const timeDiff = deadline.getTime() - now.getTime();
    const isOverdue = timeDiff <= 0;

    if (isOverdue) {
        const overdueDays = Math.ceil(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
        return {
            isValid: true,
            isOverdue: true,
            totalDays: -overdueDays,
            weeks: 0,
            days: 0,
            formatted: `Overdue by ${overdueDays} day${overdueDays !== 1 ? '(s)' : ''}`,
            deadline
        };
    }

    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(daysLeft / 7);
    const days = daysLeft % 7;

    return {
        isValid: true,
        isOverdue: false,
        totalDays: daysLeft,
        weeks,
        days,
        formatted: formatTimeLeft(daysLeft),
        deadline
    };
};

/**
 * Helper function to get the deadline date for a task
 */
export const getTaskDeadline = (task: TaskDto): Date | null => {
    if (!task.timeline || !task.timelineType) {
        return null;
    }

    const acceptedAt = new Date(task.acceptedAt!);
    let totalTimelineDays: number;
    
    if (task.timelineType === TIMELINE_TYPE.WEEK) {
        const weeks = Math.floor(task.timeline);
        const extraDays = Math.round((task.timeline - weeks) * 10);
        totalTimelineDays = (weeks * 7) + extraDays;
    } else if (task.timelineType === TIMELINE_TYPE.DAY) {
        totalTimelineDays = task.timeline;
    } else {
        return null;
    }

    const deadline = new Date(acceptedAt);
    deadline.setDate(deadline.getDate() + totalTimelineDays);
    
    return deadline;
};