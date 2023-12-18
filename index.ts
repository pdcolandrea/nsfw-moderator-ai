import OpenAI from "openai";
import { prompt } from "./prompts";

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
    console.log(`Starting prompt on: ${userContent.substring(0, 20)}...`);
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

async function main() {
  const response = await scanImage(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
  );
  console.log({ response });
}

main();
