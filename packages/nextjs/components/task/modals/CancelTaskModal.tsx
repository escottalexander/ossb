import React from "react";
import BaseModal from "./BaseModal";

interface ICancelTaskModal {
  onClose: () => void;
  cancelBtn: () => void;
  cancelWording: string;
  confirmBtn: () => void;
  confirmWording: string;
}

const CancelTaskModal: React.FC<ICancelTaskModal> = ({
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
            Cancelling a task is a permanent action that will refund all funders and make the task incompletable. Are
            you sure you want to cancel the task?
          </p>
        </div>
        <div className="flex flex-row items-center pb-10 px-5 sm:px-0 lg:py-auto">
          <button className="btn btn-default btn-full mx-4" onClick={cancelBtn}>
            {cancelWording}
          </button>
          <button className="btn btn-error btn-full m-4" onClick={confirmBtn}>
            {confirmWording}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default CancelTaskModal;
