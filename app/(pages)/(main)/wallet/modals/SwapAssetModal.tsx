"use client";
import ButtonPrimary from "../../../../components/ButtonPrimary";
import PopupModalLayout from "../../../../components/PopupModalLayout";
import { SiStellar } from "react-icons/si";
import { LiaExchangeAltSolid } from "react-icons/lia";
import Image from 'next/image';
import { object, string } from 'yup';
import { useFormik } from "formik";
import MoneyInput from "@/app/components/Input/MoneyInput";
import { WalletAPI } from "@/app/services/wallet.service";
import { toast } from "react-toastify";
import { ErrorResponse } from "@/app/models/_global";
import { useXLMUSDCFromStellarDEX } from "@/app/services/horizon.service";
import { moneyFormat } from "@/app/utils/helper";

const swapAssetSchema = object({
    fromAmount: string().required("Required"),
    toAmount: string().required("Required"),
});

type SwapAssetModalProps = {
    from: "XLM" | "USDC";
    xlmBalance: string;
    usdcBalance: string;
    toggleModal: () => void;
    reloadTransactions: () => void;
};

const SwapAssetModal = ({
    from,
    xlmBalance,
    usdcBalance,
    toggleModal,
    reloadTransactions
}: SwapAssetModalProps) => {
    const formik = useFormik({
        initialValues: {
            fromAmount: "",
            toAmount: "",
        },
        validationSchema: swapAssetSchema,
        onSubmit: async (values) => {
            // Parse and clean input values
            const fromAmount = parseFloat(values.fromAmount.replace(/,/g, ""));
            const xlmBal = parseFloat(xlmBalance);
            const usdcBal = parseFloat(usdcBalance);

            // Check if user has enough balance for the swap
            if (from === "XLM" && fromAmount > xlmBal) {
                toast.error("Insufficient XLM balance for this swap.");
                return;
            }
            if (from === "USDC" && fromAmount > usdcBal) {
                toast.error("Insufficient USDC balance for this swap.");
                return;
            }

            try {
                await WalletAPI.swapAsset({
                    toAssetType: from === "XLM" ? "USDC" : "XLM",
                    amount: values.fromAmount.replace(/,/g, ""),
                    equivalentAmount: values.toAmount.replace(/,/g, ""),
                });

                toast.success("Asset swapped successfully.");
                reloadTransactions();
                toggleModal();
            } catch (err) {
                const error = err as unknown as ErrorResponse;
                if (error.error.message) {
                    toast.error(error.error.message);
                    return;
                }
                toast.error("An error occured while swapping asset. Please try again.");
            }
        },
    });

    const { xlmPriceInUsdc } = useXLMUSDCFromStellarDEX(10000, formik.isSubmitting);

    const handleAssetEquivalent = (equivalent: { field: "fromAmount" | "toAmount", value: string }) => {
        if (!xlmPriceInUsdc) return;

        const cleanValue = equivalent.value.replace(/,/g, "");
        if (isNaN(Number(cleanValue)) || cleanValue === "") {
            formik.setFieldValue((equivalent.field === "fromAmount") ? "toAmount" : "fromAmount", "");
            return;
        }

        if (from === "XLM") {
            if (equivalent.field === "fromAmount") {
                // XLM -> USDC
                const usdc = parseFloat(cleanValue) * parseFloat(xlmPriceInUsdc);
                formik.setFieldValue("toAmount", moneyFormat(usdc));
            } else {
                // USDC -> XLM
                const xlm = parseFloat(cleanValue) / parseFloat(xlmPriceInUsdc);
                formik.setFieldValue("fromAmount", moneyFormat(xlm));
            }
        } else {
            if (equivalent.field === "fromAmount") {
                // USDC -> XLM
                const xlm = parseFloat(cleanValue) / parseFloat(xlmPriceInUsdc);
                formik.setFieldValue("toAmount", moneyFormat(xlm));
            } else {
                // XLM -> USDC
                const usdc = parseFloat(cleanValue) * parseFloat(xlmPriceInUsdc);
                formik.setFieldValue("fromAmount", moneyFormat(usdc));
            }
        }
    };

    return (
        <PopupModalLayout title="Swap Asset" toggleModal={toggleModal}>
            <p className="mt-2.5 text-body-medium text-dark-100">
                Swap tokens across wallet. Only XLM balance can be withdrawn.
            </p>
            <form className="w-full" onSubmit={formik.handleSubmit}>
                {from === "XLM" ? (
                    <div className="w-full flex items-center gap-5 my-[30px]">
                        <div className="grow">
                            <label htmlFor="fromAmount" className="text-body-tiny font-bold text-light-100">Swap From:</label>
                            <div className={`w-full p-2.5 mt-[5px] bg-dark-400 border border-dark-200 text-body-medium text-light-100 font-bold 
                                flex items-center ${formik.submitCount > 0 && formik.errors.fromAmount && "border-indicator-500"}`
                            }>
                                <SiStellar className="text-2xl text-dark-100 mr-3" />
                                <span>XLM</span>
                                <MoneyInput 
                                    attributes={{
                                        id: "fromAmount",
                                        name: "fromAmount",
                                        placeholder: "0.00",
                                        className: "h-5 w-full ml-2.5 mr-3",
                                        value: formik.values.fromAmount,
                                        onBlur: formik.handleBlur,
                                        disabled: formik.isSubmitting,
                                    }}
                                    setValue={(value) => {
                                        formik.setFieldValue("fromAmount", value);
                                        handleAssetEquivalent({ field: "fromAmount", value });
                                    }}
                                />
                                <span className="text-dark-100 whitespace-nowrap">
                                    {moneyFormat(xlmBalance)}
                                </span>
                            </div>
                        </div>
                        <LiaExchangeAltSolid className="text-2xl text-primary-400 mt-[25px]" />
                        <div className="grow">
                            <label htmlFor="toAmount" className="text-body-tiny font-bold text-light-100">Swap To:</label>
                            <div className={`w-full p-2.5 mt-[5px] bg-dark-400 border border-dark-200 text-body-medium text-light-100 font-bold 
                                flex items-center ${formik.submitCount > 0 && formik.errors.toAmount && "border-indicator-500"}`
                            }>
                                <Image 
                                    src="/usdc.svg" 
                                    alt="$" 
                                    width={31.9992}
                                    height={31.9992}
                                    className="mr-3" 
                                />
                                <span>USDC</span>
                                <MoneyInput 
                                    attributes={{
                                        id: "toAmount",
                                        name: "toAmount",
                                        placeholder: "0.00",
                                        className: "h-5 w-full ml-2.5 mr-3",
                                        value: formik.values.toAmount,
                                        onBlur: formik.handleBlur,
                                        disabled: formik.isSubmitting,
                                    }}
                                    setValue={(value) => {
                                        formik.setFieldValue("toAmount", value);
                                        handleAssetEquivalent({ field: "toAmount", value });
                                    }}
                                />
                                <span className="text-dark-100 whitespace-nowrap">
                                    {moneyFormat(usdcBalance)}
                                </span>
                            </div>
                        </div>
                    </div>
                ):(
                    <div className="w-full flex items-center gap-5 my-[30px]">
                        <div className="grow">
                            <label htmlFor="fromAmount" className="text-body-tiny font-bold text-light-100">Swap From:</label>
                            <div className={`w-full p-2.5 mt-[5px] bg-dark-400 border border-dark-200 text-body-medium text-light-100 font-bold 
                                flex items-center ${formik.submitCount > 0 && formik.errors.fromAmount && "border-indicator-500"}`
                            }>
                                <Image 
                                    src="/usdc.svg" 
                                    alt="$" 
                                    width={31.9992}
                                    height={31.9992}
                                    className="mr-3" 
                                />
                                <span>USDC</span>
                                <MoneyInput 
                                    attributes={{
                                        id: "fromAmount",
                                        name: "fromAmount",
                                        placeholder: "0.00",
                                        className: "h-5 w-full ml-2.5 mr-3",
                                        value: formik.values.fromAmount,
                                        onBlur: formik.handleBlur,
                                        disabled: formik.isSubmitting,
                                    }}
                                    setValue={(value) => {
                                        formik.setFieldValue("fromAmount", value);
                                        handleAssetEquivalent({ field: "fromAmount", value });
                                    }}
                                />
                                <span className="text-dark-100 whitespace-nowrap">
                                    {moneyFormat(usdcBalance)}
                                </span>
                            </div>
                        </div>
                        <LiaExchangeAltSolid className="text-2xl text-primary-400 mt-[25px]" />
                        <div className="grow">
                            <label htmlFor="toAmount" className="text-body-tiny font-bold text-light-100">Swap To:</label>
                            <div className={`w-full p-2.5 mt-[5px] bg-dark-400 border border-dark-200 text-body-medium text-light-100 font-bold 
                                flex items-center ${formik.submitCount > 0 && formik.errors.toAmount && "border-indicator-500"}`
                            }>
                                <SiStellar className="text-2xl text-dark-100 mr-3" />
                                <span>XLM</span>
                                <MoneyInput 
                                    attributes={{
                                        id: "toAmount",
                                        name: "toAmount",
                                        placeholder: "0.00",
                                        className: "h-5 w-full ml-2.5 mr-3",
                                        value: formik.values.toAmount,
                                        onBlur: formik.handleBlur,
                                        disabled: formik.isSubmitting,
                                    }}
                                    setValue={(value) => {
                                        formik.setFieldValue("toAmount", value);
                                        handleAssetEquivalent({ field: "toAmount", value });
                                    }}
                                />
                                <span className="text-dark-100 whitespace-nowrap">
                                    {moneyFormat(xlmBalance)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <ButtonPrimary
                    format="SOLID"
                    text={formik.isSubmitting ? "Swapping Asset..." : "Swap Asset"}
                    sideItem={<LiaExchangeAltSolid />}
                    attributes={{
                        type: "submit",
                        disabled: formik.isSubmitting,
                    }}
                    extendedClassName="w-fit"
                />
            </form>
        </PopupModalLayout>
    );
}
 
export default SwapAssetModal;