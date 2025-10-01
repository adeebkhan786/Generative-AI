import Groq from "groq-sdk";
import dotenv from "dotenv";


dotenv.config();


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });



async function main() {
    const completion = await groq.chat.completions.create({
        // temperature: 1,
        // top_p:0.2,
        // stop:'ga',    
        // max_completion_tokens: 1000,
        // frequency_penalty: 1,
        // presence_penalty:1,
        response_format: { 'type': 'json_object' },
        model: process.env.MODEL,
        messages: [
            {
                role: 'system',
                content: `You are an interview grader assistant. Your task is to generate candidate evaluation score.
                Output must be following JSON structure: 
                { 
                    "confidence": number (1-10 scale),
                    "accuracy": number (1-10 scale),
                    "pass": boolean (true or false)
                }
                    The response must:
                    1. Include all fields shown above 
                    2. Use only the exact field names shown
                    3. Follow the exact data types specified
                    4. Contain Only the JSON Object and nothing else`,
            },
            {
                role: 'user',
                content: `Q: What does === do in javascript?
                A: It checks strict equality-both value and type must match.
                
                Q: how do you create a promise that resolves after 1 second?
                A: const p= new Promise(r => setTimeout(r, 1000));
                
                Q: What is Hoisting?
                A: Javascript moves declarations (but not initilizations)  to top of their scope befor code runs.
                
                Q: Why use let instead of var?
                A: let is blocked-scope, avoiding the function scope quirks and re-declaration issues of var.`,
            }
        ]
    });

    console.log(completion.choices[0].message.content)
}



main();