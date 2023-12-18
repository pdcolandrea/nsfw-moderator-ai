import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// TODO: Eventually add more for A/b testing
const Prompts = [
  "Please analyze the provided image for NSFW (Not Safe For Work) content. If the image contains NSFW elements, respond with 'YES' followed by a brief explanation (e.g., 'YES: explicit content'). If the image is free of NSFW content, respond with 'NO' and a short justification (e.g., 'NO: image is appropriate'). Refrain from describing the image or providing any additional details beyond the NSFW assessment.",
  "Your role is to act as an image moderator to determine the presence of NSFW (Not Safe For Work) content in the provided image. Use these guidelines:1. **NSFW Content Identification**: If the image contains NSFW material, such as explicit or suggestive content, respond with 'YES'. Then, offer a brief categorization like 'explicit imagery' or 'suggestive content'. Avoid graphic descriptions.2. **Safe Content Confirmation**: If the image is free from NSFW content, reply with 'NO', followed by a general reason, for example, 'NO: content is general audience appropriate'. 3. **Response Restriction**: Do not provide detailed descriptions, personal opinions, or extraneous information about the image. Your response should strictly adhere to either the 'YES' or 'NO' format, with a succinct reason related to NSFW assessment. 4. **Compliance with Policy**: If you're unable to assess the image due to content policy restrictions, please indicate so with 'Unable to Assess: Content Policy'. This response helps in understanding the limitations of your content analysis capabilities. Your accurate and concise moderation is crucial for maintaining a safe and professional environment.",
];

// prompt_tokens - total
// Prompt1:
// 1207  - 1212
// Prompt2:
// 1353 - 1360

const isURLimage = (image: string) =>
  image.startsWith("http") || image.startsWith("www");

const scanImage = async (imageUri: string) => {
  const prompt = Prompts[0];

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
