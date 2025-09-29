import Groq from "groq-sdk";
import { z } from "zod";
import dotenv from "dotenv";


dotenv.config();


const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

//Defining a scema with zod
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    description: z.string(),
    in_stock: z.boolean(),
    tags: z.array(z.string()).default([])
});

const systemPrompt = `You are a product catalog assistant. When asked about products, always respond with 
valid JSON objects that match this structure.
{
    id:"string",
    name:"string",
    price: number,
    description: "string",
    in_stock: boolean,
    tags: ["string]
}. Yur respond should only contain the JSON object and nothing else.`



async function getStructuredResponse() {
    try {
        const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_format: { 'type': 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: `Tell me about popular smartphone products. `,
                }
            ]
        });

        const responseContent = completion.choices[0].message.content;
        const jsonData = JSON.parse(responseContent || " ");
        const validateData = ProductSchema.parse(jsonData) //LLM output ko validate kraaynege
        console.log(JSON.stringify(validateData, null, 2));
        return validateData;
    } catch (error) {
        if(error instanceof z.ZodError){
            console.log("Schema Validate Failed");
        }else if(error instanceof SyntaxError){
            console.og("JSON parsing failed");
        }else{
            console.log("Error", error);
        }
    }

}



getStructuredResponse();