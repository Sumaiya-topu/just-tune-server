const express = require("express");
const jsonServer = require("json-server");
const axios = require("axios");
const fs = require("fs/promises");
const cors = require("cors");
const app = express();
const port = 5000; // Replace with your desired port number

const BASE_URL = "https://f58f7318a06fcebfbb.gradio.live/";
// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const jsonServerRouter = jsonServer.router("db.json");
app.use("/json-server", jsonServerRouter);
app.use(cors());
// Define a sample route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

async function downloadFile(url, filename) {
  const response = await axios.get(url, { responseType: "blob" });
  const fileData = Buffer.from(response.data, "binary");
  await fs.writeFile(filename, fileData);
}

app.post("/generate-audio", async (req, res) => {
  const reqData = req.body;

  const requestOptions = {
    method: "POST",
    url: `${BASE_URL}/run/predict`,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      data: [
        reqData.text,
        parseInt(reqData.top_k),
        parseFloat(reqData.top_p),
        parseFloat(reqData.temperature),
        parseFloat(reqData.duration),
        parseFloat(reqData.cfg_coef),
      ],
      event_data: null,
      fn_index: 0,
      session_hash: "xxx",
    },
  };

  const response = await axios(requestOptions);

  const audioURL = response.data.data[0].name;
  console.log(audioURL.split("/"));

  // Extract the ID from the URL
  const audioId = audioURL.split("/")[3];

  // Generate the filename
  const filename = `audios/${audioId}.wav`;

  const fileUrl = `${BASE_URL}/file=${audioURL}`;
  await downloadFile(fileUrl, filename);

  const finalData = {
    ...reqData,
    audioURL: `/media/${filename}`,
  };

  jsonServerRouter.db.get("audioData").push(finalData).write();
  res.status(200);
  res.json({ message: "Audio Generated successfully", data: finalData });
});

app.get("/media/audios/:filename", async (req, res) => {
  // Get the filename from the request
  const filename = req.params.filename;

  // Get the path to the uploaded file
  const filePath = `./audios/${filename}`;

  // Send the file to the client
  res.status(200);
  res.sendFile(filePath, { root: __dirname });
});

app.get("/audio-data", (req, res) => {
  // Retrieve all data from the JSON server
  const audioData = jsonServerRouter.db.get("audioData").value();

  // Respond with the retrieved data
  res.status(200);
  res.json(audioData);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
