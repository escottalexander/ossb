import { Dispatch, SetStateAction, useState } from "react";
import { AddressInput } from "../../../scaffold-eth";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { contactMethods } from "~~/constants";

type DefineTaskProps = {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
  approvedWorker: string;
  setApprovedWorker: Dispatch<SetStateAction<string>>;
  assignWorker: boolean;
  setAssignWorker: Dispatch<SetStateAction<boolean>>;
  reviewer: string;
  setReviewer: Dispatch<SetStateAction<string>>;
  reviewerTakesCut: boolean;
  setReviewerTakesCut: Dispatch<SetStateAction<boolean>>;
  reviewerPercentage: number;
  setReviewerPercentage: Dispatch<SetStateAction<number>>;
  contactInfo: { method: string; value: string }[] | undefined;
  setContactInfo: Dispatch<SetStateAction<{ method: string; value: string }[] | undefined>>;
  defineTaskDone: () => void;
};

export const DefineTask = ({
  title,
  setTitle,
  description,
  setDescription,
  tags,
  setTags,
  reviewerPercentage,
  setReviewerPercentage,
  approvedWorker,
  setApprovedWorker,
  assignWorker,
  setAssignWorker,
  reviewer,
  setReviewer,
  reviewerTakesCut,
  setReviewerTakesCut,
  contactInfo,
  setContactInfo,
  defineTaskDone,
}: DefineTaskProps) => {
  const [currentSelectedContactMethod, setCurrentSelectedContactMethod] = useState(contactMethods[0]);
  const [currentSelectedContactMethodValue, setCurrentSelectedContactMethodValue] = useState("");
  const [contactInvalid, setContactInvalid] = useState(false);
  const checkEmail = (email: string) => {
    return /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/.test(email);
  };

  const verifyContactMethod = () => {
    const method = currentSelectedContactMethod.name;
    const value = currentSelectedContactMethodValue.trim();
    // Verify validity of method, trim input
    if (method == "Email" && !checkEmail(value)) {
      // mark email as invalid
      setContactInvalid(true);
      return;
    }
    const exists = contactInfo?.find(i => `${i.method}:${i.value}` == `${method}:${value}`);
    if (exists) {
      setCurrentSelectedContactMethod(contactMethods[0]);
      setCurrentSelectedContactMethodValue("");
      return;
    }
    const newContactInfo = (contactInfo || []).concat({
      method,
      value,
    });
    setContactInfo(newContactInfo);
    setCurrentSelectedContactMethod(contactMethods[0]);
    setCurrentSelectedContactMethodValue("");
  };

  const removeContactMethod = (contactMethod: { method: string; value: string }) => {
    const { method, value } = contactMethod;
    const newContactInfo = contactInfo?.filter(i => `${i.method}:${i.value}` != `${method}:${value}`);
    setContactInfo(newContactInfo);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl mb-10">Create Task</h1>
      <div className="form-control w-full max-w-sm">
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.currentTarget.value)}
          placeholder="Write a descriptive title"
          className="input input-bordered focus:outline-none w-full max-w-sm rounded-md"
        />
      </div>
      <div className="form-control w-full max-w-sm">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.currentTarget.value)}
          placeholder="Write thorough description of the task you want fulfilled"
          className="textarea textarea-bordered focus:outline-none w-full max-w-sm rounded-md"
        />
      </div>
      <div className="form-control w-full max-w-sm">
        <label className="label">
          <span className="label-text">Tags</span>
        </label>
        <input
          type="text"
          value={tags.join(", ")}
          onChange={e => {
            const tags = e.currentTarget.value.split(",");
            tags.forEach((t, i) => (tags[i] = t.trim()));
            setTags(tags);
          }}
          placeholder="Add several tags that will help someone find your task"
          className="input input-bordered focus:outline-none w-full max-w-sm rounded-md"
        />
      </div>
      <div className="join">
        <div className="form-control w-1/3 max-w-sm">
          <label className="label">
            <span className="label-text">Contact Method</span>
          </label>
          <select
            value={currentSelectedContactMethod.name}
            onChange={e => {
              const val = contactMethods.find(m => m.name == e.currentTarget.value);
              if (val) {
                setCurrentSelectedContactMethod(val);
              }
            }}
            placeholder="Select the token you are using"
            className={`input input-bordered focus:outline-none w-full max-w-sm rounded-md`}
          >
            {contactMethods.map(method => (
              <option key={method.name} value={method.name}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control w-1/2 max-w-sm">
          <label className="label">
            <span className="label-text">Value</span>
          </label>
          <input
            type="text"
            value={currentSelectedContactMethodValue}
            onChange={e => {
              setCurrentSelectedContactMethodValue(e.currentTarget.value);
            }}
            placeholder={currentSelectedContactMethod.descriptor}
            className={`input input-bordered focus:outline-none w-full max-w-sm rounded-md ${
              contactInvalid ? "input-error" : ""
            }`}
          />
        </div>
        <div className="form-control w-1/6 max-w-sm mt-9">
          <button className="btn btn-full rounded-l-lg" onClick={verifyContactMethod}>
            Add
          </button>
        </div>
      </div>
      <div className="bg-white p-6 w-full max-w-sm rounded-md m-4">
        {contactInfo && contactInfo.length > 0 && (
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Contact Method</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contactInfo.map(i => (
                <tr key={`${i.method}:${i.value}`}>
                  <td>{`${i.method}`}</td>
                  <td>{`${i.value}`}</td>
                  <td>
                    <button className="btn btn-sm rounded-md" onClick={() => removeContactMethod(i)}>
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {(!contactInfo || !contactInfo.length) && <p className="text-center">No contact methods selected</p>}
      </div>
      <div className="form-control w-full max-w-sm">
        <label className="label">
          <span className="label-text">Reviewer Address</span>
        </label>
        <AddressInput
          name="Reviewer Address"
          value={reviewer || ""}
          placeholder="Address of the person who is able to approve the fulfillment of the task"
          onChange={setReviewer}
          customContainerClass="!bg-white h-12 p-1 !rounded-md"
          customInputClass="!bg-white !text-[#000000] !rounded-md"
        />
      </div>
      <div className="form-control w-full max-w-sm">
        <label className="label cursor-pointer">
          <span className="label-text">Will the reviewer take a cut of the funding?</span>
        </label>
        <input
          type="checkbox"
          className="toggle"
          checked={reviewerTakesCut}
          onChange={() => setReviewerTakesCut(!reviewerTakesCut)}
        />
      </div>
      {reviewerTakesCut ? (
        <div className="form-control w-full max-w-sm">
          <label className="label">
            <span className="label-text">Reviewer Percentage</span>
          </label>
          <input
            type="text"
            value={reviewerPercentage}
            onChange={e => {
              const val = parseInt(e.currentTarget.value || "0", 10);
              if (val >= 0 && val <= 100) {
                setReviewerPercentage(val);
              }
            }}
            placeholder="Percentage of task to pay out to reviewer"
            className="input input-bordered focus:outline-none w-1/3 max-w-sm rounded-md"
          />
        </div>
      ) : (
        ""
      )}
      <div className="form-control w-full max-w-sm">
        <label className="label cursor-pointer">
          <span className="label-text">Is there someone already assigned to the task?</span>
        </label>
        <input
          type="checkbox"
          className="toggle"
          checked={assignWorker}
          onChange={() => setAssignWorker(!assignWorker)}
        />
      </div>
      {assignWorker ? (
        <div className="form-control w-full max-w-sm">
          <label className="label">
            <span className="label-text">Assignee Address</span>
          </label>
          <AddressInput
            name="Assignee Address"
            value={approvedWorker || ""}
            placeholder="Address of the person who is assigned to this task"
            onChange={setApprovedWorker}
            customContainerClass="!bg-white h-12 p-1 !rounded-md"
            customInputClass="!bg-white !text-[#000000] !rounded-md"
          />
        </div>
      ) : (
        ""
      )}
      <div className="form-control w-full max-w-sm m-10">
        <button className="btn btn-full" onClick={defineTaskDone} disabled={!title || !description || !reviewer}>
          Next
        </button>
      </div>
    </div>
  );
};
