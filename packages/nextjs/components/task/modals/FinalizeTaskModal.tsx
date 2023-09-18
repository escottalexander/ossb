import React from "react";
import BaseModal from "./BaseModal";

interface IFinalizeTaskModal {
  onClose: () => void;
  cancelBtn: () => void;
  cancelWording: string;
  confirmBtn: () => void;
  confirmWording: string;
}

const FinalizeTaskModal: React.FC<IFinalizeTaskModal> = ({
  onClose,
  cancelBtn,
  cancelWording,
  confirmBtn,
  confirmWording,
}) => {
  return (
    <BaseModal onClose={onClose}>
      <div className="w-fit md:w-[400px] flex flex-col gap-5 items-center justify-center bg-white rounded-xl p-6">
        <div className="flex flex-col items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
          <p>
            Finalizing a task is a permanent action that pays out the address who completed the task. Are you sure you
            want to complete the task?
          </p>
        </div>
        <div className="flex flex-row items-center pb-10 px-5 sm:px-0 lg:py-auto">
          <button className="btn btn-default btn-full mx-4" onClick={cancelBtn}>
            {cancelWording}
          </button>
          <button className="btn btn-primary btn-full m-4" onClick={confirmBtn}>
            {confirmWording}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default FinalizeTaskModal;
