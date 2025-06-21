from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler, EulerAncestralDiscreteScheduler
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
from io import BytesIO
from PIL import Image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    num_steps: int = 15  # Reduced steps for faster generation
    guidance_scale: float = 7.0

# Initialize the model - using a smaller, more efficient model
model_id = "runwayml/stable-diffusion-v1-5"  # More efficient model
logger.info(f"Initializing model from {model_id}")

# Configure for M1 Mac
if torch.backends.mps.is_available():
    device = "mps"
    torch_dtype = torch.float32  # MPS requires float32
else:
    device = "cpu"
    torch_dtype = torch.float32
logger.info(f"Using device: {device}")

# Load model with memory optimizations
pipeline = StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch_dtype,
    safety_checker=None,
    requires_safety_checking=False,
    use_safetensors=True  # Faster loading
)

# Use Euler Ancestral scheduler - faster than DPM++
pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(
    pipeline.scheduler.config,
    use_karras_sigmas=True
)

# Memory and speed optimizations
pipeline.enable_attention_slicing(slice_size=1)  # More aggressive slicing
pipeline.enable_vae_tiling()  # Better memory usage
pipeline.enable_vae_slicing()

# Move to device
pipeline = pipeline.to(device)
logger.info("Model initialization complete")

@app.post("/generate")
async def generate_image(request: GenerateRequest):
    try:
        logger.info(f"Generating image with prompt: {request.prompt}")
        
        # Generate with memory-efficient settings
        with torch.inference_mode():
            image = pipeline(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                num_inference_steps=request.num_steps,
                guidance_scale=request.guidance_scale,
                height=512,
                width=512,
            ).images[0]
        
        # Optimize image before sending
        buffered = BytesIO()
        image.save(buffered, format="JPEG", quality=85)  # Slightly reduced quality for faster transfer
        img_str = base64.b64encode(buffered.getvalue()).decode()
        logger.info("Image generation successful")
        return {"image": img_str}
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 