import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// TODO: Eventually add more for A/b testing
const Prompts = [
  `"Please analyze the provided image for NSFW (Not Safe For Work) content. If the image contains NSFW elements, respond with 'YES' followed by a brief explanation (e.g., 'YES: explicit content'). If the image is free of NSFW content, respond with 'NO' and a short justification (e.g., 'NO: image is appropriate'). Refrain from describing the image or providing any additional details beyond the NSFW assessment."`,
];

const isURLimage = (image: string) =>
  image.startsWith("http") || image.startsWith("www");

const scanImage = async (imageUri: string) => {
  const prompt = Prompts[0];

  let userContent = imageUri;
  if (!isURLimage(imageUri)) {
    userContent = `data:image/jpeg;base64,${imageUri}`;
  }

  try {
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
    console.log(chatCompletion.choices);
    return chatCompletion.choices[0];
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      console.log(err.name); // BadRequestError
    }
  }
};

async function main() {
  scanImage(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
  );
}

main();
