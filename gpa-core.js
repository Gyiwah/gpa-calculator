(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = core;
  } else {
    root.GpaCore = core;
  }
})(typeof window === 'undefined' ? globalThis : window, function () {
  const gradePoints = Object.freeze({
    A: 4,
    'B+': 3.5,
    B: 3,
    'C+': 2.5,
    C: 2,
    'D+': 1.5,
    D: 1,
    E: 0
  });

  function averageGradePoints(courses) {
    const totalCredits = courses.reduce((total, course) => total + course.credits, 0);
    if (totalCredits === 0) return null;

    const weightedPoints = courses.reduce(
      (total, course) => total + gradePoints[course.grade] * course.credits,
      0
    );
    return weightedPoints / totalCredits;
  }

  function getClassOfHonour(gpa) {
    if (gpa >= 3.5) return 'First Class Honours';
    if (gpa >= 3) return 'Second Class Honours (Upper Division)';
    if (gpa >= 2.5) return 'Second Class Honours (Lower Division)';
    if (gpa >= 2) return 'Third Class Honours';
    return 'Pass';
  }

  return Object.freeze({ gradePoints, averageGradePoints, getClassOfHonour });
});
