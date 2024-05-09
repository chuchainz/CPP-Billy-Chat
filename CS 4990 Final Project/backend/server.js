const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// Function to format class information into a human-readable format
const formatClassInfo = (classInfo) => {
  const formattedLines = [];

  classInfo.forEach((classItem, index) => {
    formattedLines.push(`${index + 1}. ${classItem.classDetails}`);
    for (const [key, value] of Object.entries(classItem)) {
      if (key !== 'classDetails') {
        formattedLines.push(`${key}\t${value}`);
      }
    }
    formattedLines.push(''); // Blank line between classes for readability
  });

  return formattedLines.join('\n'); // Return formatted text with newline characters
};

// Function to read class data from files in a directory
const readFilesInDirectory = async (directoryPath) => {
  try {
    const files = await fs.readdir(directoryPath);
    const classData = {};

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const lines = fileContent.trim().split('\n');

      const semester = path.basename(file, '.txt');
      classData[semester] = [];

      let currentClass = null;
      lines.forEach((line) => {
        const trimmedLine = line.trim();

        if (/^\d+\./.test(trimmedLine)) {
          if (currentClass) {
            classData[semester].push(currentClass);
          }
          currentClass = {
            classDetails: trimmedLine.slice(trimmedLine.indexOf('.') + 1).trim(),
          };
        } else if (currentClass) {
          const keyValuePairs = trimmedLine.split(/\t+/);
          for (let i = 0; i < keyValuePairs.length; i += 2) {
            const key = keyValuePairs[i];
            const value = keyValuePairs[i + 1];
            if (key && value) {
              currentClass[key.trim()] = value.trim();
            }
          }
        }
      });

      if (currentClass) {
        classData[semester].push(currentClass);
      }
    }

    return classData;
  } catch (error) {
    console.error(`Error reading files from directory: ${directoryPath}`, error);
    throw error;
  }
};

// Path to the directory containing semester files
const semestersDirectory = path.join(__dirname, 'semesters');

// API endpoint to get class data for all semesters
app.get('/semesters', async (req, res) => {
  try {
    const classData = await readFilesInDirectory(semestersDirectory);

    let responseText = '';

    for (const [semester, classes] of Object.entries(classData)) {
      responseText += `\n${semester}:\n`;
      responseText += formatClassInfo(classes);
    }

    res.set('Content-Type', 'text/plain');
    res.send(responseText);
  } catch (error) {
    console.error('Error getting class data', error);
    res.status(500).send('Error getting class data');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
