import tiktoken
import sys
import json

input = sys.argv[1]
messages = json.loads(input)

encoding = tiktoken.encoding_for_model('gpt-3.5-turbo')

def num_tokens_from_messages(messages):
  num_tokens = 0
  for message in messages:
      num_tokens += 4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
      for _, value in message.items():
          num_tokens += len(encoding.encode(value))
  num_tokens += 2  # every reply is primed with <im_start>assistant
  return num_tokens

print(num_tokens_from_messages(messages))