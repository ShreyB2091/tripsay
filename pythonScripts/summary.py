from transformers import pipeline
import sys

text = sys.argv[1]

summarizer = pipeline(task = "summarization", max_length = 256)
summary = summarizer(text)

print(summary[0]['summary_text'])