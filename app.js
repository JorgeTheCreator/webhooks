/*
 * Starter Project for Messenger Platform Quick Start Tutorial
 *
 * Remix this as the starting point for following the Messenger Platform
 * quick start tutorial.
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

"use strict";

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  app = express().use(body_parser.json()), // creates express http server
  PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN,
  Messaging = require("./Messaging");

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);
      console.log("webhook: " + JSON.stringify(webhook_event.postback));
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
        console.log(
          "webhook postback " + JSON.stringify(webhook_event.postback)
        );
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED_JORGE");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get("/webhook", (req, res) => {
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = PAGE_ACCESS_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// function handleMessage(sender_psid, received_message) {
//   let response;
//   console.log("-------times--------");
//   if (received_message.quick_reply) {
//     console.log(
//       `-------------${received_message.quick_reply.payload}------------`
//     );
//     let payload = received_message.quick_reply.payload;
//     response = Messaging.genText(`Awesome so you Like ${payload}`);
//     return callSendAPI(sender_psid, response);
//   }
//   // Checks if the message contains text
//   if (received_message.text) {
//     // Create the payload for a basic text message, which
//     // will be added to the body of our request to the Send API
//     response = Messaging.genQuickReply("Whats your favorite color?", [
//       {
//         content_type: "location",
//         title: "blue",
//         image_url:
//           "https://cdn.glitch.com/5fbe4e6f-8e2c-4cc7-88c1-20da4579840b%2Fblue.png?v=1572404712863",
//         payload: "blue"
//       },
//       {
//         content_type: "location",
//         title: "red",

//         payload: "red",
//         image_url:
//           "https://cdn.glitch.com/5fbe4e6f-8e2c-4cc7-88c1-20da4579840b%2Fred.jpeg?v=1572405061036"
//       }
//     ]);
//   } else if (received_message.attachments) {
//     // Get the URL of the message attachment
//     let attachment_url = received_message.attachments[0].payload.url;
//     response = Messaging.genGenericTemplate(attachment_url, "title", null, [
//       {
//         type: "postback",
//         title: "verizon YES",
//         payload: "yes"
//       },
//       {
//         type: "postback",
//         title: "Verizon NO",
//         payload: "no"
//       }
//     ]);
//   } else if (received_message.text === "Computer") {
//     response = Messaging.genText(`hi you i love`);
//   }
//   // Send the response message
//   console.log("-------senApi--------");
//   callSendAPI(sender_psid, response);
// }

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    switch (
      received_message.text
        .replace(/[^\w\s]/gi, " ")
        .trim()
        .toLowerCase()
    ) {
      case "verizon":
        response = setRoomPreferences();
        console.log("resp----------------->>>>>>> " + response);
        break;
      case "rey":
        response = Messaging.genText("OK send me picture of Rey");
        console.log("resp----------------->>>>>>> " + response);
        break;
       case "shivil":
        response = Messaging.genText("OK send me picture of shivil");
        console.log("resp----------------->>>>>>> " + response);
        break;
      case "eric":
        response = response = Messaging.genText("Oh really? ..OK send me picture of Eric");
        console.log("resp----------------->>>>>>> " + response);
        break;
      default:
        response = {
          text: ` "${received_message.text}" ? what do you mean?`
        };

        break;
    }
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = Messaging.genGenericTemplate(
      attachment_url,
      "Is this Him?",
      null,
      [
        {
          type: "postback",
          title: "YES!",
          payload: "Yes"
        },
        {
          type: "postback",
          title: "NO!",
          payload: "No"
        }
      ]
    );
    console.log(
      "received_message.attachments[0].payload ---------" +
        JSON.stringify(received_message.attachments[0].payload)
    );
  } else {
    response = {
      text: `Sorry, I don't understand what you mean.`
    };
  }

  // Send the response message
  //console.log("response*****************" + JSON.stringify(response));
  callSendAPI(sender_psid, response);
}

// Define the template and webview
function setRoomPreferences() {
  let response = Messaging.genPostbackButton(
    "hey there, do you like working for VERIZON?",
    "YES",
    "YES",
    "NO",
    "NO"
  );

  return response;
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;
  let payloadtitle = received_postback.title;
  console.log("PAYLOAD title ---" + JSON.stringify(payloadtitle ));
  // Set the response based on the postback payload
  if (payload === "YES") {
    response = { text: "Thats awesome!..well continue working:)" };
  } else if (payload === "NO") {
    response = Messaging.genQuickReply(
      "whom if any, in the team are you having problems with?",
      [
        {
          content_type: "text",
          title: "Eric",
          payload: "<POSTBACK_PAYLOAD>"
        },
        {
          content_type: "text",
          title: "Rey",
          payload: "<POSTBACK_PAYLOAD>"
        },
        {
          content_type: "text",
          title: "shivil",
          payload: "<POSTBACK_PAYLOAD>"
        }
      ]
    );
  }else if(payloadtitle === "YES!"){
    response = { text: "By the end of the week he'll be fired!" };
  }else if(payloadtitle === "NO!"){
    response = { text: "Ok dude, just send me the correct picture" };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}
