let grades = [];
let cumulativeGrades = [];
let gradePoints = {
    'A': 4.0,
    'B+': 3.5,
    'B': 3.0,
    'C+': 2.5,
    'C': 2.0,
    'D+': 1.5,
    'D': 1.0,
    'E': 0.0
};

// Function to display grades on the screen
function display(grade) {
    grades.push(grade);
    cumulativeGrades.push(grade);
    document.querySelector('.screen').value = grades.join(', ');
    calculateGPA();
    determineSemester();
    classOfHonour();
    checkAcademicYear();
    updateHighestAndLowestGrade();
}

//Function to calculate for class and display
function classOfHonour(){
    let cumulativePoints = document.getElementById('cgpa').value;
    if(cumulativePoints >=3.5)
        document.querySelector('.class').value = "FIRST CLASS HONOUR";
    else if(cumulativePoints >=3.0)
        document.querySelector('.class').value = "SECOND CLASS HONOURS(Upper Division)";
    else if(cumulativePoints >=2.5)
        document.querySelector('.class').value = "SECOND CLASS HONOURS(Lower Division)";
    else if(cumulativePoints >=2.0)
        document.querySelector('.class').value = "THEIRD CLASS HONOUR";
    else if(cumulativePoints <2.0)
        document.querySelector('.class').value = "PASS";
    
}

// Function to clear the display
function clearDisplay() {
    grades = [];
    cumulativeGrades = [];
    document.querySelector('.screen').value = '';
    document.getElementById('sgpa').value = '';
    document.getElementById('cgpa').value = '';
    document.querySelector('.class').value = '';
    updateHighestAndLowestGrade();
}

// Function to calculate and display GPA
function calculateGPA() {
    if (grades.length === 0) return;

    let totalPoints = 0;
    let ComulativePoints = 0;

    for (let grade of grades) {
        totalPoints += gradePoints[grade];
    }
    for (let cGrade of cumulativeGrades){
        ComulativePoints += gradePoints[cGrade]
    }

    const gpa = totalPoints / grades.length;
    //update SGPA
    document.getElementById('sgpa').value = gpa;

    const cgpa = ComulativePoints / cumulativeGrades.length;
    //update CGPA
    document.getElementById('cgpa').value = cgpa.toFixed(2);
}

// Function to update the semester
function updateSemester() {
    let semesterElement = document.querySelector('.semester-element-content h3');
    let semester = parseInt(semesterElement.textContent);

    if (!isNaN(semester)) {
        semesterElement.textContent = semester + 1;
    } else {
        semesterElement.textContent = 1;
    }
}
//Function to update the academic year value
function updateAcademicYear(){
    let semesterElement = document.querySelector('.semester-element-content h3');
    let semester = parseInt(semesterElement.textContent);

    let yearElement = document.querySelector('.academic-year-element-content h3');
    let year = parseInt(yearElement.textContent);

    if(!isNaN(year)){
        if(semester %2 !=0)
            yearElement.textContent = year+1;
        else
        return;
    }else{
        yearElement.textContent =1;
    }

}
function checkAcademicYear(){
    let semesterElement = document.querySelector('.semester-element-content h3');
    let semester = parseInt(semesterElement.textContent);

    let yearElement = document.querySelector('.academic-year-element-content h3');
    let year = parseInt(yearElement.textContent);

    if(!isNaN(year)){
        return;
    }else{
        yearElement.textContent =1;
    }

}

//Fucntion to determine semester
function determineSemester() {
    let semesterElement = document.querySelector('.semester-element-content h3');
    let semester = parseInt(semesterElement.textContent);

    if (!isNaN(semester)) {
        return;
    } else {
        semesterElement.textContent = 1;
    }
}
//Fucntion to update highest and lowest grade
function updateHighestAndLowestGrade(){
    if (cumulativeGrades.length===0){
        document.querySelector('.highest-grade-element-content h3').textContent = 'N/A';
        document.querySelector('.lowest-grade-element-content h3').textContent = 'N/A';
        return;
    }

    let highestGrade = cumulativeGrades[0];
    let lowestGrade = cumulativeGrades[0];

    for(let grade of cumulativeGrades){
        if (gradePoints[grade] > gradePoints[highestGrade]){
            highestGrade = grade;
        }

        if (gradePoints[grade] < gradePoints[lowestGrade]){
            lowestGrade = grade;
        }
    }

    document.querySelector('.highest-grade-element-content h3').textContent = highestGrade;
    document.querySelector('.lowest-grade-element-content h3').textContent = lowestGrade;
}
// Event listeners for buttons
document.getElementById('next').addEventListener('click', () => {
    
    updateSemester();
    updateAcademicYear();
    grades = [];
    document.querySelector('.screen').value = '';
    document.getElementById('sgpa').value = '';
    updateHighestAndLowestGrade();   
});

document.getElementById('clear').addEventListener('click', clearDisplay);
