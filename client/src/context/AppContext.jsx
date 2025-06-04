import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);

  // fetch all courses
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  //calculate avearge rating
  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0;
    }
    let total = 0;
    course.courseRatings.forEach((rating) => {
      total += rating.rating;
    });
    return (total / course.courseRatings.length).toFixed(1);
  };

  // calculate course chapter time
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // calculate the course duration
  const calculateCourseDuration = (course) => {
    let totalTime = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map(
        (lecture) => (totalTime += lecture.lectureDuration)
      )
    );
    return humanizeDuration(totalTime * 60 * 1000, { units: ["h", "m"] });
  };

  //calculate number of lectures in a course
  const calculateNumberOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  // fetch user enrolled courses
  const fetchEnrolledCourses = async () => {
    setEnrolledCourses(dummyCourses);
  };

  const logToken = async () => {
    console.log(await getToken());
  };

  useEffect(() => {
    fetchAllCourses();
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (user) {
      logToken();
    }
  }, [user]);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    calculateNumberOfLectures,
    calculateChapterTime,
    calculateCourseDuration,
    enrolledCourses,
    fetchEnrolledCourses,
    isEducator,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
