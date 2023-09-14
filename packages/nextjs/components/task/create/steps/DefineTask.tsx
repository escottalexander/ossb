import { Dispatch, SetStateAction } from "react";
import { AddressInput } from "../../../scaffold-eth";

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
  defineTaskDone,
}: DefineTaskProps) => {
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
