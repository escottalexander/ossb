import React, { Dispatch, SetStateAction } from "react";
import BaseModal from "./BaseModal";

interface IApproveWorkModal {
  approvedWorkerAddress: string;
  setApprovedWorkerAddress: Dispatch<SetStateAction<string>>;
  taskIndex: number; // This prop is used internally but not displayed in the UI
  onClose: () => void;
  cancelBtn: () => void;
  cancelWording: string;
  approveBtn: () => void;
  approveWording: string;
}

const ApproveWorkModal: React.FC<IApproveWorkModal> = ({
  approvedWorkerAddress,
  setApprovedWorkerAddress,
  taskIndex, // This prop is used internally but not displayed in the UI
  onClose,
  cancelBtn,
  cancelWording,
  approveBtn,
  approveWording,
}) => {
  taskIndex;
  return (
    <BaseModal onClose={onClose}>
      <div className="w-fit md:w-[400px] flex flex-col gap-5 items-center justify-center bg-white rounded-xl p-6">
        <div className="flex flex-col items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
          <div className="form-control w-full max-w-sm">
            <label className="label">
              <span className="label-text">Worker Address</span>
            </label>
            <input
              type="text"
              value={approvedWorkerAddress}
              onChange={e => setApprovedWorkerAddress(e.currentTarget.value)}
              placeholder="Enter address of approved worker"
              className="input input-bordered focus:outline-none w-full max-w-sm rounded-md"
            />
          </div>
        </div>
        <div className="flex flex-col items-center pb-10 px-5 sm:px-0 lg:py-auto">
          <button className="btn btn-primary btn-full m-4" disabled={!approvedWorkerAddress} onClick={approveBtn}>
            {approveWording}
          </button>
          <button className="btn btn-default btn-full mx-4" onClick={cancelBtn}>
            {cancelWording}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ApproveWorkModal;
