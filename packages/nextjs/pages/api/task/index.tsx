import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "~~/lib/dbConnect";
import Task, { TaskDocument } from "~~/models/Task";
import { ITask } from "~~/types/task";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Connect to the database
  await dbConnect();
  if (req.method === "GET") {
    const Tasks: TaskDocument[] = await Task.find({});
    return res.status(200).json(Tasks);
  } else if (req.method === "POST") {
    return await create(req, res);
  } else if (req.method === "PUT") {
    return await update(req, res);
  } else {
    return res.status(405).json({ message: "Method not allowed." });
  }

  async function create(req: NextApiRequest, res: NextApiResponse) {
    try {
      // get data from request
      const { title, creator, description, tags, reviewer, reviewerPercentage, approvedWorker } = req.body;

      // Validate the required fields
      if (!title || !creator || !description || !reviewer) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Create a new Task using the Task model
      const newTask = new Task({
        title,
        creator,
        description,
        tags,
        reviewer,
        reviewerPercentage,
        approvedWorker,
        creationTime: new Date(),
        approved: false,
        canceled: false,
        complete: false,
      } as ITask);

      // Save the Task to the database
      await newTask.save();

      // Respond with the created Task
      res.status(201).json(newTask);
    } catch (error: any) {
      console.error("Error creating the Task:", error);
      res.status(500).json({ message: "An unexpected error occurred while creating the Task." });
    }
    return res;
  }

  async function update(req: NextApiRequest, res: NextApiResponse) {
    try {
      // get data from request
      const { taskId, title, creator, description, tags, reviewer, reviewerPercentage, approvedWorker } = req.body;

      // Validate the required fields
      if (!taskId || !title || !creator || !description || !reviewer) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Get existing task
      const task = await Task.findOne({ _id: taskId });

      task.title = title;
      task.creator = creator;
      task.description = description;
      task.tags = tags;
      task.reviewer = reviewer;
      task.reviewerPercentage = reviewerPercentage;
      task.approvedWorker = approvedWorker;

      // Save the Task to the database
      await task.save();

      // Respond with the created Task
      res.status(201).json(task);
    } catch (error: any) {
      console.error("Error creating the Task:", error);
      res.status(500).json({ message: "An unexpected error occurred while creating the Task." });
    }
    return res;
  }
}
