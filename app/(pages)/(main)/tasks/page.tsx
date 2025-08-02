"use client";
import TaskOverviewSection from "./sections/TaskOverviewSection";
import ConversationSection from "./sections/ConversationSection";
import { TaskDto } from "@/app/models/task.model";
import { useState } from "react";
import { useAsyncEffect, useInfiniteScroll, useLockFn } from "ahooks";
import { TaskAPI } from "@/app/services/task.service";
import { FiFilePlus } from "react-icons/fi";
import { useCustomSearchParams } from "@/app/utils/hooks";
import { Data } from "ahooks/lib/useInfiniteScroll/types";
import TaskCard from "./components/TaskCard";
import { HiOutlineRefresh } from "react-icons/hi";
import { PaginationResponse } from "@/app/models/_global";
import { ActiveTaskContext } from "./contexts/ActiveTaskContext";
import { useUnauthenticatedUserCheck } from "@/lib/firebase";

const Tasks = () => {
    useUnauthenticatedUserCheck();
    const { searchParams, updateSearchParams } = useCustomSearchParams();
    const [activeTask, setActiveTask] = useState<TaskDto | null>(null);
    const [loadingTask, setLoadingTask] = useState(false);

    const {
        data: tasks,
        loading: loadingTasks,
        loadingMore: loadingMoreTasks,
        noMore: noMoreTasks,
        loadMore: loadMoreTasks,
        reload: reloadTasks,
    } = useInfiniteScroll<Data>(
        async (currentData) => {
            const pageToLoad = currentData ? (currentData.pagination as PaginationResponse).currentPage + 1 : 1;

            const response = await TaskAPI.getTasks(
                {
                    role: "contributor",
                    detailed: true, // TODO: Remove and select what to show based on role (backend)
                    page: pageToLoad,
                    limit: 30,
                },
            );

            if (!searchParams.get("taskId") && !activeTask && response.data.length > 0) {
                updateSearchParams({ taskId: response.data[0].id });
            }

            return {
                list: response.data,
                pagination: response.pagination,
            };
        },
        {
            isNoMore: (data) => !data?.pagination.hasMore,
            reloadDeps: []
        }
    );

    useAsyncEffect(useLockFn(async () => {
        const taskId = searchParams.get("taskId");
        if (!taskId) {
            setActiveTask(null);
            return;
        }

        setLoadingTask(true);

        try {
            const task = await TaskAPI.getTaskById(taskId);
            setActiveTask(task);
        } catch {
            setActiveTask(null);
        } finally {
            setLoadingTask(false);
        }
    }), [searchParams]);

    return (
        <div className="h-[calc(100dvh-123px)] flex">
            <ActiveTaskContext.Provider value={{ activeTask, setActiveTask }}>
                {(tasks?.list && tasks.list.length < 1 && !loadingTasks) ? (
                    <div className="grow grid place-content-center">
                        <div className="min-w-[336px] w-[10%] mx-auto">
                            <FiFilePlus className="text-[44px] text-primary-400 mx-auto" />
                            <h2 className="text-headline-medium text-light-100 my-2.5 text-center">
                                No Active Task
                            </h2>
                            <p className="text-body-medium text-dark-100 mb-[30px] text-center">
                                Tasks will show up here when a bounty is assigned to you.
                                {/* Visit explorer page and apply to open bounties you can handle. */}
                            </p>
                            {/* <ButtonPrimary
                                format="OUTLINE"
                                text="Go To Bounty Explorer"
                                attributes={{
                                    onClick: () => router.push(ROUTES.EXPLORER),
                                }}
                                extendedClassName="w-fit mx-auto"
                            /> */}
                        </div>
                    </div>
                ) : (
                    <>
                        <section className="min-w-[366px] w-[12%] h-full flex flex-col">
                            <div className="py-[30px] pr-5 flex items-center justify-between">
                                <h3 className="text-headline-small text-light-100 ">Active Tasks</h3>
                                <button
                                    onClick={reloadTasks}
                                    disabled={loadingTasks || loadingMoreTasks}
                                    className={(loadingTasks || loadingMoreTasks) ? "rotate-loading" : ""}
                                >
                                    <HiOutlineRefresh className="text-2xl text-light-200 hover:text-light-100" />
                                </button>
                            </div>
                            <div className="grow pr-5 pb-5 overflow-y-auto space-y-[15px]">
                                {loadingTasks ? (
                                    <div className="flex justify-center py-4">
                                        <span className="text-body-medium text-light-100">Loading tasks...</span>
                                    </div>
                                ):(
                                    tasks?.list?.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            active={(activeTask?.id || searchParams.get("taskId")) === task.id}
                                            onClick={() => updateSearchParams({ taskId: task.id })}
                                        />
                                    ))
                                )}
                                {(tasks?.list && tasks.list.length < 1 && !loadingTasks) && (
                                    <div className="flex justify-center py-4">
                                        <span className="text-body-medium text-light-100">No tasks found</span>
                                    </div>
                                )}
                                {loadingMoreTasks && (
                                    <div className="flex justify-center pt-2.5">
                                        <span className="text-body-medium text-light-100">Loading more tasks...</span>
                                    </div>
                                )}
                                {(!loadingTasks && !loadingMoreTasks && !noMoreTasks) && (
                                    <button
                                        className="text-body-medium text-light-200 font-bold hover:text-light-100 pt-2.5"
                                        onClick={loadMoreTasks}
                                    >
                                        Load More
                                    </button>
                                )}
                            </div>
                        </section>

                        {((loadingTask || loadingTasks) && !activeTask) && (
                            <section className="grow border-l border-dark-200 grid place-content-center">
                                <p className="text-body-medium text-light-100">
                                    {loadingTask ? "Loading task..." : "Waiting for active tasks to load..."}
                                </p>
                            </section>
                        )}

                        {!loadingTask && activeTask && (
                            <>
                                <ConversationSection />
                                <TaskOverviewSection />
                            </>
                        )}
                    </>
                )}
            </ActiveTaskContext.Provider>
        </div>
    );
}

export default Tasks;