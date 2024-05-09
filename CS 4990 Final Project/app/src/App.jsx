import React, { useEffect, useState } from 'react';
import './App.css';
import chatLogo from './assets/chat.png';
import billychat from './assets/billychat.png';
import cow from './assets/cow.png';
import classA from './assets/LogoRelease1a.jpg';
import CPP from './assets/CPP.png';

// OpenAI API configuration
const API_KEY = "Key Here"; 
const backendEndpoint = "http://localhost:3001/semesters"; 

// Function to interact with OpenAI's API
const getCompletionFromMessages = async (messages) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages,
        temperature: 0,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching from OpenAI API:", error);
    throw new Error("OpenAI API call failed.");
  }
};

// Instructions for the OpenAI model
const instructions = `
Follow these steps to respond to the user's query about the provided data:
1. Analyze the query to understand its context and identify specific points of interest.
2. Determine if the query references specific information contained in the provided data.
3. Extract any assumptions or implied details from the query, such as dates, times, instructors, or class details.
4. Validate these assumptions against the provided data.
5. Politely correct any incorrect assumptions or errors.
6. Formulate a response that addresses the user's query using only the data provided. If the information is not found in the data, respond honestly that it's unavailable.
7. Speak as if you are an asisstant with all the knowledge of the data in your head already, do not speak as if you are looking through the dataset.
`;

// React Chatbot Component
const App = () => {
  const [messages, setMessages] = useState([
    {
      content: "Hello, I'm Billy Bronco and I'm here to help! Ask me something!",
      sender: "ChatGPT",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  // State to hold fetched class data from the backend
  const [classData, setClassData] = useState(null);

  // Function to fetch class data from the backend
  const fetchClassData = async () => {
    try {
      const response = await fetch(backendEndpoint);
      const data = await response.text(); 
      setClassData(data);
    } catch (error) {
      console.error("Error fetching class data:", error);
    }
  };

  // Fetch class data on component mount
  useEffect(() => {
    fetchClassData();
  }, []); // Empty dependency array ensures this effect only runs once on mount

  const handleSendRequest = async (userMessage) => {
    const newUserMessage = {
      content: userMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsTyping(true);

    try {
      const chatMessages = [
        { role: "system", content: instructions + "\n" + classData }, // Include instructions and fetched class data
        { role: "user", content: `####${userMessage}####` },
      ];

      const responseContent = await getCompletionFromMessages(chatMessages);

      let finalResponse;
      try {
        finalResponse = responseContent.split("####").slice(-1)[0].trim();
      } catch (error) {
        finalResponse = "Sorry, I'm having trouble right now. Please try asking another question.";
      }

      const chatGPTResponse = {
        content: finalResponse,
        sender: "ChatGPT",
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
    } catch (error) {
      const errorMessage = {
        content: "Sorry, there was an error. Please try again later.",
        sender: "ChatGPT",
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {setIsTyping(false);};
  };

  return (
    <div className="App">
      <div className="top-bar">
      <div className="top-bar-content">
      <img src={CPP} alt="Top Bar Image" style={{ height: '60px', width: 'auto' }} />
    </div>
      </div>

      {/* Horizontal green bar */}
      <div className="horizontal-green-bar">
        <div className="green-bar-content">
          <img src={chatLogo} alt="Chat Logo" height="40px" style={{ marginRight: '10px' }} />
        </div>
      </div>

      <img src={billychat} alt="" className="billychat-image" />

      {/* Vertical yellow bar on the left */}
      <div className="vertical-yellow-bar">
      <img src={cow} alt="First Image" class="yellow-bar-image" />
      <img src={classA} alt="Second Image" class="yellow-bar-image" />
      </div>

      <div className="chat-container">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.content}
            </div>
          ))}
        </div>
        {isTyping && <div className="typing-indicator">Billy is typing...</div>}

        <input
          type="text"
          className="message-input"
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendRequest(e.target.value);
              e.target.value = ''; // Reset the input field
            }
          }}
        />
      </div>

      {/* Blue bar */}
      <div className="bottom-bar">
        <div className="bottom-text">
          Cal Poly Pomona<br/>
          3801 West Temple Avenue, Pomona, CA 91768<br/>
          ©2024 California State Polytechnic University, Pomona<br/>
          All Rights Reserved
        </div>
        <div className="top-text">
          About Cal Poly Pomona &nbsp; | &nbsp; Feedback &nbsp; | &nbsp; Privacy &nbsp; | &nbsp; Accessibility &nbsp; | &nbsp; Document Readers
        </div>
      </div>
    </div>
  );
};

export default App;