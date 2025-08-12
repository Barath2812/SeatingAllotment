const XLSX = require('xlsx');

class ExcelParser {
  static parseStudentFile(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const students = data.map((row, index) => {
        // Handle different possible column names
        const rollNo = row['Roll No'] || row['RollNo'] || row['Roll Number'] || row['RollNumber'] || row['Roll_No'];
        const name = row['Name'] || row['Student Name'] || row['StudentName'];
        const department = row['Department'] || row['Dept'] || row['Branch'];
        const email = row['Email'] || row['Email Address'] || row['EmailAddress'];
        const phone = row['Phone'] || row['Phone Number'] || row['PhoneNumber'] || row['Mobile'];

        if (!rollNo || !name || !department || !email) {
          throw new Error(`Missing required fields in row ${index + 2}: Roll No, Name, Department, Email are required`);
        }

        return {
          rollNumber: rollNo.toString().trim(),
          name: name.toString().trim(),
          department: department.toString().trim(),
          email: email.toString().trim().toLowerCase(),
          phone: phone ? phone.toString().trim() : ''
        };
      });

      return students;
    } catch (error) {
      throw new Error(`Error parsing student Excel file: ${error.message}`);
    }
  }

  static parseHallFile(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const halls = data.map((row, index) => {
        // Handle different possible column names
        const hallName = row['Hall Name'] || row['HallName'] || row['Name'] || row['Hall'];
        const capacity = row['Capacity'] || row['Seats'] || row['Total Seats'] || row['TotalSeats'];

        if (!hallName || !capacity) {
          throw new Error(`Missing required fields in row ${index + 2}: Hall Name and Capacity are required`);
        }

        const capacityNum = parseInt(capacity);
        if (isNaN(capacityNum) || capacityNum <= 0) {
          throw new Error(`Invalid capacity value in row ${index + 2}: ${capacity}`);
        }

        return {
          hallName: hallName.toString().trim(),
          capacity: capacityNum
        };
      });

      return halls;
    } catch (error) {
      throw new Error(`Error parsing hall Excel file: ${error.message}`);
    }
  }
}

module.exports = ExcelParser;
