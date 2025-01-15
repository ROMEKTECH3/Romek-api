const express = require("express");
const axios = require("axios");
const EventSource = require("eventsource");

const app = express();
const session_hash = Math.random().toString(36).slice(2);

const animagine = {
  request: async (prompt) => {
    const data = JSON.stringify({
      data: [
        prompt,
        "",
        807244162,
        512,
        512,
        7,
        28,
        "Euler a",
        "896 x 1152",
        "(None)",
        "Standard v3.1",
        false,
        0.55,
        1.5,
        true,
      ],
      event_data: null,
      fn_index: 5,
      trigger_id: null,
      session_hash: session_hash, // Use the generated session_hash
    });

    const config = {
      method: "POST",
      url: "https://cagliostrolab-animagine-xl-3-1.hf.space/queue/join?ref=huntscreens.com",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json",
      },
      data: data,
    };

    const api = await axios.request(config);
    return api.data;
  },

  cekStatus: () => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(
        "https://cagliostrolab-animagine-xl-3-1.hf.space/queue/data?session_hash=" +
          session_hash
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.msg === "process_completed") {
          resolve(data);
          eventSource.close();
        } else if (data.msg === "error") {
          reject(data);
          eventSource.close();
        } else {
          console.log("Event:", data);
        }
      };

      eventSource.onerror = (err) => {
        reject(err);
        eventSource.close();
      };
    });
  },

  create: async (prompt) => {
    try {
      const postResponse = await animagine.request(prompt);
      const statusResponse = await animagine.cekStatus();
      return statusResponse;
    } catch (error) {
      console.error("Error:", error);
    }
  },
};

// Define API route
app.get("/generate", async (req, res) => {
  const prompt = req.query.prompt || "Default anime character";
  const response = await animagine.create(prompt);
  res.json(response);
});

// Export the app as a serverless function
module.exports = app;
