/* eslint-disable react/no-unescaped-entities */
"use client";
import ButtonPrimary from "@/app/components/ButtonPrimary";
import RequestResponseModal from "@/app/components/RequestResponseModal";
import { TaskDto } from "@/app/models/task.model";
import { TaskAPI } from "@/app/services/task.service";
import { ROUTES } from "@/app/utils/data";
import { formatDate, moneyFormat } from "@/app/utils/helper";
import { getCurrentUser } from "@/lib/firebase";
import { useAsyncEffect, useLockFn, useToggle } from "ahooks";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";
import { RiCodeBoxLine } from "react-icons/ri";
import { toast } from "react-toastify";

const Application = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTask, setActiveTask] = useState<TaskDto | null>(null);
    const [loadingTask, setLoadingTask] = useState(true);
    const [submittingApplication, setSubmittingApplication] = useState(false);
    const [openRequestResponseModal, { toggle: toggleRequestResponseModal }] = useToggle(false);

    useAsyncEffect(useLockFn(async () => {
        const taskId = searchParams.get("taskId");
        if (!taskId) {
            setActiveTask(null);
            setLoadingTask(false);
            return;
        }

        const user = await getCurrentUser();
        if (!user) {
            router.push(ROUTES.AUTHENTICATE + `?taskId=${taskId}`);
        }

        try {
            const task = await TaskAPI.getTaskById(taskId);
            setActiveTask(task);
        } catch {
            setActiveTask(null);
        } finally {
            setLoadingTask(false);
        }
    }), [searchParams]);

    const handleTaskApplication = async () => {
        if (!activeTask?.id) {
            toast.error("Task Id not found");
            return;
        }

        setSubmittingApplication(true);

        try {
            await TaskAPI.submitTaskApplication(activeTask.id);

            toggleRequestResponseModal();
        } catch (error: any) {
            if (error?.error?.message) {
                toast.error(error.error.message);
                return
            }
            toast.error("Failed to submit task application. Please Try again.");
        } finally {
            setSubmittingApplication(false);
        }
    };
    
    return (
        <>
        <div className="w-[850px] mt-[65px] mx-auto">
            <h1 className="text-display-large text-light-100">Task Bounty</h1>
            {!searchParams.get("taskId") ? (
                <p className="text-body-medium text-light-100 mt-10">No task Id found in URL</p>
            ): (!activeTask && !loadingTask) && (
                <p className="text-body-medium text-light-100 mt-10">Task not found</p>
            )}

            {(loadingTask && !activeTask) && (
                <p className="text-body-medium text-light-100 mt-10">Loading Task...</p>
            )}

            {activeTask && !loadingTask && (
                <>
                <div className="flex items-center gap-[15px] mt-[15px] mb-[30px] text-body-medium">
                    <p>
                        <span className="text-dark-100">Created By: </span>
                        <span className="text-light-200 font-bold">{activeTask.creator?.username}</span>
                    </p>
                    <GoDotFill className="text-dark-200" />
                    <p>
                        <span className="text-dark-100">Date: </span>
                        <span className="text-light-200 font-bold">{formatDate(activeTask.createdAt)}</span>
                    </p>
                </div>
                <div className="w-full p-5 border border-primary-200 bg-dark-400 space-y-5">
                    <section className="w-full space-y-2.5">
                        <div className="w-full flex justify-between gap-2.5 text-headline-small">
                            <h5 className="text-light-100 truncate">{activeTask.issue.title}</h5>
                            <p className="text-primary-400 whitespace-nowrap">
                                {formatTimeline(activeTask)}
                            </p>
                        </div>
                        <div className="w-full flex items-center gap-2.5">
                            {activeTask.issue.labels?.length > 0 && (
                                <p className="py-0.5 px-[7px] bg-primary-300 text-body-tiny font-bold text-light-200 max-w-[35%] truncate">
                                    {activeTask.issue.labels
                                        .map(label => label.name)
                                        .map((name, index, array) => 
                                            index === array.length - 1 ? name : `${name}, `
                                        )
                                        .join('')}
                                </p>
                            )}
                            <Link 
                                href={activeTask.issue.url}
                                target="_blank" 
                                className="text-body-medium text-dark-100 underline truncate hover:text-light-200"
                            >
                                {activeTask.issue.url}
                            </Link>
                        </div>
                    </section>
                    <section className="space-y-2.5">
                        <h6 className="text-body-medium text-dark-100">Task Bounty:</h6>
                        <p className="text-primary-400">
                            <span className="text-display-large">{moneyFormat(activeTask.bounty).split(".")[0]}</span>
                            <span className="text-headline-large">.{activeTask.bounty.toString().split(".")[1] || "00"} USDC</span>
                        </p>
                    </section>
                    <p className="text-body-tiny text-light-200">
                        You’d be prompted to login with your GitHub account to accept this task if you're not authnticated. 
                        You can chat with the project maintainer and receive payouts seamlessly from the platform.
                    </p>
                    <ButtonPrimary
                        format="SOLID"
                        text={submittingApplication ? "Applying..." : "Apply for Task"}
                        sideItem={<FiArrowUpRight />}
                        attributes={{ onClick: handleTaskApplication }}
                        extendedClassName="bg-light-200"
                    />
                </div>
                </>
            )}
        </div>

        {openRequestResponseModal && (
            <RequestResponseModal 
                Icon={RiCodeBoxLine}
                title="Task Proposal Sent"
                description={`The project maintainer will get your proposal shortly. If accepted, this 
                    task will be assigned to you alone and bounty paid out upon completion.`}
                buttonTitle="Go To Tasks Page"
                // buttonTitle="Go To Bounty Explorer"
                onButtonClick={() => router.push(ROUTES.TASKS)}
            />
        )}
        </>
    )
}
 
export default Application;

function formatTimeline(task: TaskDto) {
    if (!Number.isInteger(task.timeline!)) {
        const [weeks, days] = task.timeline!.toString().split(".");
        const totalDays = (Number(weeks) * 7) + Number(days);
        return formatTimeLeft(totalDays);
    }

    return `${task.timeline} ${task.timelineType?.toLowerCase()}(s)`;
}

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