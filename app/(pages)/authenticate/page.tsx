/* eslint-disable @next/next/no-img-element */
"use client";
import ButtonPrimary from "@/app/components/ButtonPrimary";
import { ErrorResponse } from "@/app/models/_global";
import { UserAPI } from "@/app/services/user.service";
import useUserStore from "@/app/state-management/useUserStore";
import { ROUTES } from "@/app/utils/data";
import { auth, githubProvider } from "@/lib/firebase";
import { signInWithPopup, getAdditionalUserInfo } from "@firebase/auth";
import { useRequest, useLockFn } from "ahooks";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGithub } from "react-icons/fa6";
import { toast } from "react-toastify";

const Account = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setCurrentUser } = useUserStore();

    const onUserSuccess = () => {
        const taskId = searchParams.get("taskId");
        if (!taskId) {
            return router.push(ROUTES.TASKS);
        }
        
        router.push(ROUTES.APPLICATION + `?taskId=${taskId}`);
    };

    const { loading: creatingUser, run: createUser } = useRequest(
        useLockFn((gitHubUsername: string) => UserAPI.createUser({ gitHubUsername })), 
        {
            manual: true,
            onSuccess: (data, params) => {
                toast.success("User created successfully.");

                if (data && "userId" in data) {
                    setCurrentUser({ ...data, username: params[0] });
                }
                if (data && "message" in data) {
                    setCurrentUser({ ...data.user, username: params[0] });
                    toast.warn(data.message);
                }

                onUserSuccess();
            },
            onError: () => toast.error("Failed to create user.")
        }
    );

    const { loading: fetchingUser, run: getUser } = useRequest(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useLockFn((gitHubUsername: string) => UserAPI.getUser(
            { view: "basic", setWallet: "true" }
        )), 
        {
            manual: true,
            cacheKey: "user-object",
            onSuccess: (data, params) => {
                if (data && "userId" in data) {
                    setCurrentUser({ ...data, username: params[0] });
                }
                if (data && "message" in data) {
                    setCurrentUser({ ...data.user, username: params[0] });
                    toast.warn(data.message);
                }

                onUserSuccess();
            },
            onError: (err, params) => {
                const error = err as unknown as ErrorResponse;
                if (error.error.name === "NotFoundError") {
                    createUser(params[0]);
                }
            }
        }
    );

    const handleGitHubAuth = async () => {
        try {
            const result = await signInWithPopup(auth, githubProvider);
            const additionalInfo = getAdditionalUserInfo(result);
            getUser(additionalInfo!.username!);
        } catch (error) {
            toast.error("GitHub sign-in failed. Please try again.");
            console.error(error);
        }
    };

    return (
        <main className="h-full w-full flex">
            <section className="h-full w-[42%] text-light-100">
                <div className="h-full w-full pl-[16%] pt-5">
                    <img src="/davasign-logo.svg" alt="DevAsign" className="h-auto w-auto" />
                    <div className="pt-[105px]">
                        <h1 className="text-display-large text-light-100">Get Started</h1>
                        <p className="text-body-medium text-dark-100 pt-[42px] pb-10">
                            Login with GitHub to accept task bounty. You can chat with <br />
                            the project maintainer and receive payouts seamlessly from <br />
                            the DevAsign.
                        </p>
                        <ButtonPrimary
                            format="SOLID"
                            text={
                                creatingUser
                                    ? "Saving User..." 
                                    : fetchingUser
                                        ? "Loading User..."
                                        : "Continue with GitHub"
                            }
                            sideItem={<FaGithub />}
                            attributes={{ 
                                onClick: handleGitHubAuth,
                                disabled: creatingUser || fetchingUser, 
                            }}
                            extendedClassName="w-[264px]"
                        />
                    </div>
                </div>
            </section>
            <section className="h-full w-[58%] auth-gradient grid place-content-center">
                <div>
                    <div className="flex items-center gap-2.5 justify-center">
                        <img src="/davasign-logo.svg" alt="DevAsign" className="h-auto w-auto" />
                        <img src="/x.svg" alt="X" className="h-auto w-auto" />
                        <img src="/scf-logo.svg" alt="Stellar Community Fund" className="h-auto w-auto" />
                    </div>
                    <p className="text-body-medium text-light-100 text-center mt-[30px]">
                        Backed by Stellar Community Fund (SCF). <br />
                        We’re the infrastructure powering fair compensation for open-source contribution.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Account;