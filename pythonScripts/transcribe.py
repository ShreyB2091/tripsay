import openai
import os
import sys
import base64
from dotenv import load_dotenv

load_dotenv('../.env.local')
openai.api_key = os.getenv('OPENAI_API_KEY')
base64_audio = sys.argv[1]

wav_file = open("/tmp/recording.mp3", "wb")
decode_string = base64.b64decode(base64_audio)
wav_file.write(decode_string)

audio_file = open("/tmp/recording.mp3", 'rb')
transcript = openai.Audio.transcribe("whisper-1", audio_file)

print(transcript["text"])