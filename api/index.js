import express, { text } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { GoogleGenAI } from "@google/genai";
import { routes } from './routes/routes.js';
import bodyParser from 'body-parser';
import { stripeWebhook } from './webhooks/stripeWebhook.js';
import { globalErrorHandler } from './middlewares/globalErrorHandler.js';

dotenv.config();
const app = express();



app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://fullstack-ecommerce-fe-lnwd-au6sb4ey8.vercel.app",

      "http://localhost:3000"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));



app.use(cookieParser(process.env.COOKIE_KEY));
app.post('/stripe-webhook', bodyParser.raw({ type: '*/*' }), stripeWebhook);


app.use(express.json()); 
app.use(routes);
app.use(globalErrorHandler)

const ai = new GoogleGenAI({
  genKey: process.env.GEMINI_API_KEY
})

async function main() {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  const response1 = await chat.sendMessage({
    message: "I have 2 dogs in my house.",
  });
  console.log("Chat response 1:", response1.text);

  const response2 = await chat.sendMessage({
    message: "How many paws are in my house?",
  });
  console.log("Chat response 2:", response2.text);
}

// await main();

const userSessionId = {}

app.post("/chat", async (req, res) => {
  let { session ,message } = req.body;

  if(!userSessionId[session]){
    userSessionId[session] = []
  }

  const history = userSessionId[session];

  try {
    // Crear chat con historial recibido
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
       config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
      history
    });

    // Enviar mensaje
    const stream = await chat.sendMessageStream({ message });

    let reply = "";
    for await (const chunk of stream) {
      reply += chunk.text;
    }

    // Crear historial actualizado manualmente
    history.push(
       { role: "user", parts: [{ text: message }] },
       { role: "model", parts: [{ text: reply }] }
    )
  
    res.json({
      reply,
      history: history
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error con Gemini" });
  }
});

app.listen(3030, () => console.log("Server ready on port 3030....."));