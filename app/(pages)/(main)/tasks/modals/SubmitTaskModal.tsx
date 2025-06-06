"use client";
import ButtonPrimary from "@/app/components/ButtonPrimary";
import PopupModalLayout from "@/app/components/PopupModalLayout";
import { FiArrowUpRight } from "react-icons/fi";

type SubmitTaskModalProps = {
    toggleModal: () => void;
};

const SubmitTaskModal = ({ toggleModal }: SubmitTaskModalProps) => {
    
    return (
        <PopupModalLayout title="Submit Task" toggleModal={toggleModal}>
            <ButtonPrimary
                format="SOLID"
                text="Submit"
                sideItem={<FiArrowUpRight />}
                attributes={{
                    onClick: () => {},
                }}
                extendedClassName="w-fit mt-5"
            />
        </PopupModalLayout>
    );
}
 
export default SubmitTaskModal;