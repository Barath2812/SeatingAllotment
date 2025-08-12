class SeatingAllocator {
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static interleaveDepartments(students) {
    // Group students by department
    const departmentGroups = {};
    students.forEach(student => {
      if (!departmentGroups[student.department]) {
        departmentGroups[student.department] = [];
      }
      departmentGroups[student.department].push(student);
    });

    // Shuffle each department group
    Object.keys(departmentGroups).forEach(dept => {
      departmentGroups[dept] = this.shuffleArray(departmentGroups[dept]);
    });

    // Get the departments and their lengths
    const departments = Object.keys(departmentGroups);
    const maxLength = Math.max(...departments.map(dept => departmentGroups[dept].length));

    // Interleave students from different departments
    const interleaved = [];
    for (let i = 0; i < maxLength; i++) {
      departments.forEach(dept => {
        if (departmentGroups[dept][i]) {
          interleaved.push(departmentGroups[dept][i]);
        }
      });
    }

    return interleaved;
  }

  static allocateSeats(students, halls) {
    if (!students || students.length === 0) {
      throw new Error('No students provided for seating allocation');
    }

    if (!halls || halls.length === 0) {
      throw new Error('No halls provided for seating allocation');
    }

    // Interleave students by department
    const interleavedStudents = this.interleaveDepartments(students);

    const seatingPlan = [];
    let studentIndex = 0;
    let currentRow = 1;
    let currentBench = 1;

    // Sort halls by name for consistent allocation
    const sortedHalls = [...halls].sort((a, b) => a.hallName.localeCompare(b.hallName));

    for (const hall of sortedHalls) {
      const benchesInHall = Math.ceil(hall.capacity / 2); // Each bench has 2 seats
      let benchesAllocated = 0;

      while (benchesAllocated < benchesInHall && studentIndex < interleavedStudents.length - 1) {
        const student1 = interleavedStudents[studentIndex];
        const student2 = interleavedStudents[studentIndex + 1];

        // Ensure students are from different departments
        if (student1.department === student2.department) {
          // Find next student from different department
          let nextIndex = studentIndex + 2;
          while (nextIndex < interleavedStudents.length && 
                 interleavedStudents[nextIndex].department === student1.department) {
            nextIndex++;
          }

          if (nextIndex < interleavedStudents.length) {
            // Swap students
            [interleavedStudents[studentIndex + 1], interleavedStudents[nextIndex]] = 
            [interleavedStudents[nextIndex], interleavedStudents[studentIndex + 1]];
          } else {
            // If no different department student found, skip this bench
            studentIndex += 2;
            currentBench++;
            benchesAllocated++;
            continue;
          }
        }

        const seatAllocation = {
          examId: 'FINAL_EXAM_2024',
          hallName: hall.hallName,
          row: currentRow,
          bench: currentBench,
          seat1: {
            studentId: student1._id || student1.id,
            rollNumber: student1.rollNumber,
            department: student1.department
          },
          seat2: {
            studentId: student2._id || student2.id,
            rollNumber: student2.rollNumber,
            department: student2.department
          }
        };

        seatingPlan.push(seatAllocation);
        studentIndex += 2;
        currentBench++;
        benchesAllocated++;

        // Move to next row after every 10 benches (adjust as needed)
        if (currentBench % 10 === 0) {
          currentRow++;
        }
      }

      // Reset row and bench for next hall
      currentRow = 1;
      currentBench = 1;
    }

    return seatingPlan;
  }

  static validateSeatingPlan(seatingPlan) {
    const errors = [];
    const departmentPairs = new Set();

    seatingPlan.forEach((allocation, index) => {
      const { seat1, seat2 } = allocation;
      
      // Check if students are from same department on same bench
      if (seat1.department === seat2.department) {
        errors.push(`Bench ${index + 1}: Students from same department (${seat1.department}) on same bench`);
      }

      // Check for duplicate students
      const pairKey = `${seat1.rollNumber}-${seat2.rollNumber}`;
      if (departmentPairs.has(pairKey)) {
        errors.push(`Duplicate student pair found: ${seat1.rollNumber} and ${seat2.rollNumber}`);
      }
      departmentPairs.add(pairKey);
    });

    return errors;
  }
}

module.exports = SeatingAllocator;
