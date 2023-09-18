import React, { Dispatch, SetStateAction } from "react";
import BaseModal from "./BaseModal";
import { AddressInput } from "~~/components/scaffold-eth";

interface IAssignTaskModal {
  assignedWorkerAddress: string;
  setAssignedWorkerAddress: Dispatch<SetStateAction<string>>;
  onClose: () => void;
  cancelBtn: () => void;
  cancelWording: string;
  assignBtn: () => void;
  assignWording: string;
}

const AssignTaskModal: React.FC<IAssignTaskModal> = ({
  assignedWorkerAddress,
  setAssignedWorkerAddress,
  onClose,
  cancelBtn,
  cancelWording,
  assignBtn,
  assignWording,
}) => {
  return (
    <BaseModal onClose={onClose}>
      <div className="w-fit md:w-[400px] flex flex-col gap-5 items-center justify-center bg-white rounded-xl p-6">
        <div className="flex flex-col items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
          <div className="form-control w-full max-w-sm">
            <label className="label">
              <span className="label-text">Enter the address for the person who you want to assign to the task</span>
            </label>
            <AddressInput
              value={assignedWorkerAddress}
              onChange={setAssignedWorkerAddress}
              placeholder="Enter address of assignd worker"
              customContainerClass="!bg-white h-12 p-1 !rounded-md"
              customInputClass="!bg-white !text-[#000000] !rounded-md"
            />
          </div>
        </div>
        <div className="flex flex-row items-center pb-10 px-5 sm:px-0 lg:py-auto">
          <button className="btn btn-default btn-full mx-4" onClick={cancelBtn}>
            {cancelWording}
          </button>
          <button className="btn btn-primary btn-full m-4" disabled={!assignedWorkerAddress} onClick={assignBtn}>
            {assignWording}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default AssignTaskModal;
