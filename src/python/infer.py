# src/python/infer.py

import sys
import json
from PIL import Image
import torch
import clip
from llama_cpp import Llama

def get_image_embedding(image_path):
    model, preprocess = clip.load("ViT-B/32", device="cpu")
    image = preprocess(Image.open(image_path)).unsqueeze(0)
    with torch.no_grad():
        embedding = model.encode_image(image)
    return embedding.cpu().numpy().tolist()[0]  # 1D list

def run_llm(embedding, prompt):
    llm = Llama(model_path="src/python/models/phi-2-1.3b-int4.gguf", n_ctx=2048, n_threads=4)
    # 임베딩을 문자열로 변환하여 프롬프트에 포함
    embedding_str = ','.join([str(x) for x in embedding[:32]])  # (임베딩 전체는 너무 길어 일부만 사용)
    full_prompt = f"{prompt}\nImage embedding: [{embedding_str}, ...]\n"
    output = llm(full_prompt, max_tokens=128, stop=["\n\n"])
    return output['choices'][0]['text']

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python infer.py <image_path>")
        sys.exit(1)
    image_path = sys.argv[1]
    prompt = (
        "Given the image embedding, extract:\n"
        "Color: (e.g., Red)\n"
        "Category: (e.g., Knit)\n"
        "Attributes: (e.g., V-neck, Long sleeves)\n"
        "Filename: (e.g., red_knit_vneck)\n"
        "Output in English, lowercase, 2-3 words for filename separated by underscores."
    )
    embedding = get_image_embedding(image_path)
    result = run_llm(embedding, prompt)
    print(result)