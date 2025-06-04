import { clerkClient } from "@clerk/express";
import Course from "../models/course.js";
import { v2 as cloudinary } from "cloudinary";
import { purchase } from "../models/purchase.js";

//update user role to educator

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth().userId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });

    res.json({ success: true, message: "You can now publish courses" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// add new course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    if (!imageFile) {
      return res.json({ success: false, message: "Thumbnail not attached" });
    }
    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    const newCourse = await Course.create(parsedCourseData);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;

    await newCourse.save();
    res.json({ success: true, message: "Course added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get educator courses
export const getEductaorCourses = async (req, res) => {
  try {
    const educator = req.auth().userId;
    const courses = await Course.find({ educator });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//get educator dashboard data (total earnings, no of students, courses)
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth().userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    const courseIds = courses.map((course) => course._id);

    // calculate total earnings
    const purchases = await purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    //collect unique enrolled students ids with their course titles
    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find(
        {
          _id: { $in: course.enrolledStudents },
        },
        "name imageUrl"
      );
      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle.student,
        });
      });
    }

    res.json({
      success: true,
      dashboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get enrolled students with purchase data
export const getEnrolledStudentsData = async () => {
  try {
    const educator = req.auth().userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await purchase
      .find({
        courseId: { $in: courseIds },
        status: "completed",
      })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
