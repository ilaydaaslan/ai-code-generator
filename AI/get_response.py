import sys
import io
import os

os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

model_id = "Qwen/Qwen2.5-Coder-1.5B-Instruct"

def run_cpu_nlp():
    if len(sys.argv) < 2:
        return

    user_query = sys.argv[1]
    
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        dtype=torch.float32,
        device_map={"": "cpu"}
    )

    messages = [
        {"role": "system", "content": "Sen yerel bir yazılım uzmanısın. Türkçe konuş. Sadece kod ve kısa açıklamalar ver."},
        {"role": "user", "content": user_query}
    ]
    
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    model_inputs = tokenizer([text], return_tensors="pt")

    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=256,
        temperature=0.3,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    
    response_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]

    response = tokenizer.batch_decode(response_ids, skip_special_tokens=True)[0]
    print(response)

if __name__ == "__main__":
    run_cpu_nlp()