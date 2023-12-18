import OpenAI from "openai";
import { prompt, prompts } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const isURLimage = (image: string) =>
  image.startsWith("http") || image.startsWith("www");

const scanImage = async (imageUri: string) => {
  let userContent = imageUri;
  if (!isURLimage(imageUri)) {
    userContent = `data:image/jpeg;base64,${imageUri}`;
  }

  try {
    console.log(`Starting prompt on: ${userContent.substring(0, 40)}...`);
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: userContent,
                detail: "low",
              },
            },
          ],
        },
      ],
    });
    console.log(chatCompletion.usage);

    return chatCompletion.choices[0].message;
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      console.log(err.name);
    } else {
      console.error("non openai error", err);
    }

    return false;
  }
};

const scanMessage = async (message: string) => {
  try {
    console.log(`Starting prompt on: ${message.substring(0, 40)}...`);
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: prompts[2],
        },
      ],
    });
    console.log(chatCompletion.usage);
    return chatCompletion.choices[0].message;
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      console.log(err.name);
    } else {
      console.error("non openai error", err);
    }

    return false;
  }
};

async function main() {
  // TODO: COMMAND LINE ARGUMENTS
  const response = await scanImage(
    "https://threedtreasury-nsfw-resin-miniatures.com/cdn/shop/products/nsfw-mary-jane-resin-figure-by-ca-3d-art-462931.jpg?v=1695832595"
  );
  console.log({ response });
}

main();
