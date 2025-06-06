"use client";
import ButtonPrimary from "@/app/components/ButtonPrimary";
import PopupModalLayout from "@/app/components/PopupModalLayout";
import { FiArrowRight } from "react-icons/fi";

type RequestTimeExtensionModalProps = {
    toggleModal: () => void;
};

const RequestTimeExtensionModal = ({ toggleModal }: RequestTimeExtensionModalProps) => {
    
    return (
        <PopupModalLayout title="Request Time Extension" toggleModal={toggleModal}>
            <ButtonPrimary
                format="SOLID"
                text="Send Request"
                sideItem={<FiArrowRight />}
                attributes={{
                    onClick: () => {},
                }}
                extendedClassName="w-fit mt-5"
            />
        </PopupModalLayout>
    );
}
 
export default RequestTimeExtensionModal;