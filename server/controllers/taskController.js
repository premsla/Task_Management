import asyncHandler from "express-async-handler";
import Notice from "../models/notis.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

const createTask = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets, links, description } =
      req.body;

    console.log("createTask - Received data:", {
      title,
      team,
      stage,
      date,
      priority,
      userId,
      teamType: typeof team,
      teamLength: team?.length
    });

    // Ensure the task creator is always included in the team
    let taskTeam = team || [];
    if (!taskTeam.includes(userId)) {
      taskTeam.push(userId);
    }

    console.log("createTask - Final team:", taskTeam);

    //alert users of the task
    let text = "New task has been assigned to you";
    if (taskTeam?.length > 1) {
      text = text + ` and ${taskTeam?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
        date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };
    let newLinks = null;

    if (links) {
      newLinks = links?.split(",");
    }

    const task = await Task.create({
      title,
      team: taskTeam,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
      links: newLinks || [],
      description,
    });

    await Notice.create({
      team: taskTeam,
      text,
      task: task._id,
    });

    const users = await User.find({
      _id: taskTeam,
    });

    if (users) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        await User.findByIdAndUpdate(user._id, { $push: { tasks: task._id } });
      }
    }

    console.log("Task created successfully:", {
      taskId: task._id,
      title: task.title,
      team: task.team,
      stage: task.stage,
      createdBy: userId
    });

    res
      .status(200)
      .json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

const duplicateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const task = await Task.findById(id);

    //alert users of the task
    let text = "New task has been assigned to you";
    if (team.team?.length > 1) {
      text = text + ` and ${task.team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${
        task.priority
      } priority, so check and act accordingly. The task date is ${new Date(
        task.date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const newTask = await Task.create({
      ...task,
      title: "Duplicate - " + task.title,
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.links = task.links;
    newTask.priority = task.priority;
    newTask.stage = task.stage;
    newTask.activities = activity;
    newTask.description = task.description;

    await newTask.save();

    await Notice.create({
      team: newTask.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, team, stage, priority, assets, links, description } =
    req.body;

  try {
    const task = await Task.findById(id);

    let newLinks = [];

    if (links) {
      newLinks = links.split(",");
    }

    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;
    task.links = newLinks;
    task.description = description;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const task = await Task.findById(id);

    task.stage = stage.toLowerCase();

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task stage changed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateSubTaskStage = asyncHandler(async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { status } = req.body;

    await Task.findOneAndUpdate(
      {
        _id: taskId,
        "subTasks._id": subTaskId,
      },
      {
        $set: {
          "subTasks.$.isCompleted": status,
        },
      }
    );

    res.status(200).json({
      status: true,
      message: status
        ? "Task has been marked completed"
        : "Task has been marked uncompleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, tag, date } = req.body;
  const { id } = req.params;

  try {
    const newSubTask = {
      title,
      date,
      tag,
      isCompleted: false,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const getTasks = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;
  const { stage, isTrashed, search } = req.query;

  let query = { isTrashed: isTrashed ? true : false };

  if (!isAdmin) {
    // For non-admin users, show tasks where:
    // 1. They are in the team, OR
    // 2. The team is empty (for backward compatibility with existing tasks)
    query.$or = [
      { team: { $all: [userId] } },
      { team: { $size: 0 } }
    ];
  }
  if (stage) {
    query.stage = stage;
  }

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { stage: { $regex: search, $options: "i" } },
        { priority: { $regex: search, $options: "i" } },
      ],
    };
    query = { ...query, ...searchQuery };
  }

  console.log("getTasks query:", {
    userId,
    isAdmin,
    query,
    stage,
    isTrashed,
    search
  });

  // Debug: Check all tasks in database
  const allTasks = await Task.find({}).select('title team stage isTrashed');
  console.log("All tasks in database:", allTasks.map(t => ({
    title: t.title,
    team: t.team,
    stage: t.stage,
    isTrashed: t.isTrashed
  })));

  let queryResult = Task.find(query)
    .populate({
      path: "team",
      select: "name title email",
    })
    .sort({ _id: -1 });

  const tasks = await queryResult;

  console.log("getTasks result:", {
    tasksCount: tasks.length,
    taskTitles: tasks.map(t => t.title)
  });

  res.status(200).json({
    status: true,
    tasks,
  });
});

const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch task", error);
  }
});

const postTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { type, activity } = req.body;

  try {
    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };
    task.activities.push(data);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const trashTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, isAdmin } = req.user;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    // Check if user has permission to delete this task
    if (!isAdmin && !task.team.includes(userId)) {
      return res.status(403).json({
        status: false,
        message: "You don't have permission to delete this task"
      });
    }

    task.isTrashed = true;
    await task.save();

    console.log(`Task ${id} trashed by user ${userId}`);

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    console.error("Error trashing task:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);

      resp.isTrashed = false;

      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: `Operation performed successfully.`,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    // Fetch all tasks from the database
    let taskQuery = { isTrashed: false };

    // For non-admin users, show tasks where they are in the team OR team is empty
    if (!isAdmin) {
      taskQuery.$or = [
        { team: { $all: [userId] } },
        { team: { $size: 0 } }
      ];
    }

    const allTasks = await Task.find(taskQuery)
      .populate({
        path: "team",
        select: "name role title email",
      })
      .sort({ _id: -1 });

    console.log("Dashboard stats query:", {
      userId,
      isAdmin,
      taskQuery,
      tasksFound: allTasks.length
    });

    const users = await User.find({ isActive: true })
      .select("name title role isActive createdAt")
      .limit(10)
      .sort({ _id: -1 });

    // Group tasks by stage and calculate counts
    const groupedTasks = allTasks?.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    console.log("Dashboard stats breakdown:", {
      totalTasks: allTasks.length,
      groupedTasks,
      taskStages: allTasks.map(t => ({ title: t.title, stage: t.stage, team: t.team }))
    });

    const graphData = Object.entries(
      allTasks?.reduce((result, task) => {
        const { priority } = task;
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // Calculate total tasks
    const totalTasks = allTasks.length;
    const last10Task = allTasks?.slice(0, 10);

    // Combine results into a summary object
    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupedTasks,
      graphData,
    };

    res
      .status(200)
      .json({ status: true, ...summary, message: "Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

export {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
};
