const axios = require("axios");

const requestOptions = {
  method: "POST",
  url: "https://79c81afc71f71a32cc.gradio.live/run/predict",
  headers: {
    "Content-Type": "application/json",
    // "Cache-Control": "no-cache",
    // "Postman-Token": "229c18be-877d-44be-863e-6062dad91d0c",
  },
  data: {
    data: ["A cat meowing", 250, 0, 1, 10, 3],
    event_data: null,
    fn_index: 0,
    session_hash: "xxx",
  },
};

axios(requestOptions)
  .then((response) => {
    console.log(response.data);
    // Handle successful response
  })
  .catch((error) => {
    // Handle error
  });
