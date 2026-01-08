import os

env_path = r'e:\Delta_forge\backend\.env'
with open(env_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Filter out empty or whitespace-only lines and print them
for line in text.splitlines():
    if line.strip():
        print(f"VAL: {line.strip()}")
