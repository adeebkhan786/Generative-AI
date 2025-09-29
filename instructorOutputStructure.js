import Instructor from "@instructor-ai/instructor";
import Groq from "groq-sdk";
import { z } from "zod";
import dotenv from "dotenv";


dotenv.config();


const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const instructor = Instructor({
    client,
    mode: 'TOOLS'
})

//Defining a scema with zod
const RecipeIngredientScema = z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string().describe("The unit of measurment, like cup, tablespoon, etc.")
});


const RecipeSchema = z.object({
    title: z.string(),
    description: z.string(),
    prep_time_minutes: z.number().int().positive(),
    cook_time_minutes: z.number().int().positive(),
    ingredients: z.array(RecipeIngredientScema),
    instructions: z.array(z.string()).describe("Step by step cooking instructions.")
})


async function getRecipe() {
    try {
        //Request structured data with automatic validations

        const recipe = await instructor.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_model: {
                name:"Recipe",
                schema: RecipeSchema,
            },
            messages: [
                {
                    role: 'user',
                    content: `Give me a recipe for chocolate chip cookies`,
                }
            ],
            max_retries: 2  //Instruction will retry if validation fails
        });

        //No need for try/catch or manual validation- instructor handles it!
        console.log(`Recipe: ${recipe.title}`);
        console.log(`Prep time: ${recipe.prep_time_minutes} minutes`);
        console.log(`Cook time: ${recipe.cook_time_minutes} minutes`);

        console.log("\nIngredients:");
        recipe.ingredients.forEach((ingredient) => {
            console.log(`- ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`)
        });

        console.log("\nInstructions:");
        recipe.instructions.forEach((step,index) =>{
            console.log(`${index + 1}. ${step}`);
        });

        return recipe;
        
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



getRecipe();