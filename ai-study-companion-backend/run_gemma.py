from transformers import AutoProcessor, AutoModelForMultimodalLM
import torch

MODEL_ID = "google/gemma-4-31B-it"

print(f"🔄 Loading model {MODEL_ID} (This requires ~62GB of RAM/VRAM)...")

try:
    # Load processor
    processor = AutoProcessor.from_pretrained(MODEL_ID)
    
    # Load model
    model = AutoModelForMultimodalLM.from_pretrained(
        MODEL_ID,
        dtype="auto",
        device_map="auto"
    )
    print("✅ Model loaded successfully!")

    # Prompt
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Write a short joke about saving RAM."},
    ]

    print("💬 Processing input...")
    # Process input
    inputs = processor.apply_chat_template(
        messages,
        tokenize=True,
        return_dict=True,
        return_tensors="pt",
        add_generation_prompt=True,
        enable_thinking=False
    ).to(model.device)
    input_len = inputs["input_ids"].shape[-1]

    print("🧠 Generating output...")
    # Generate output
    outputs = model.generate(**inputs, max_new_tokens=1024)
    response = processor.decode(outputs[0][input_len:], skip_special_tokens=False)

    # Parse output
    parsed = processor.parse_response(response, prefix=inputs["input_ids"])
    print("\n🤖 Response:\n", parsed)

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\n⚠️ Note: Running a 31B parameter model locally is extremely heavy and will crash on standard laptop hardware.")
