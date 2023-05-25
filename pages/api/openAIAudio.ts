// import type { NextApiRequest, NextApiResponse } from "next"
// import { Configuration, OpenAIApi } from "openai"
// import { createReadStream } from 'fs'

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// })

// const openai = new OpenAIApi(configuration)

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const audioFile = req.file;
//   const file = req.file;
//   // console.log(typeof(audioFile));
//   // const completion = await openai.createTranscription(
//   //   audioFile,
//   //   "whisper-1"
//   // )
//   // // const completion = {
//   //   data: "Hi"
//   // }
//   // res.status(200).json({ result: completion.data })
//   const formData = new FormData();
//   formData.append('file', createReadStream(file.filepath), 'audio.wav');
//   formData.append('model', 'whisper-1');
//   const response = await fetch(
//     'https://api.openai.com/v1/audio/transcriptions',
//     {
//       method: 'POST',
//       headers: {
//         // ...formData.getHeaders(),
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: formData,
//     }
//   );
//   const { text, error } = await response.json();
//   if (response.ok) {
//     res.status(200).json({ text: text });
//   } else {
//     console.log('OPEN AI ERROR:');
//     console.log(error.message);
//     res.status(400).send(new Error());
//   }
// }


const FormData = require('form-data');
import { withFileUpload } from 'next-multiparty';
import { createReadStream } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withFileUpload(async (req : any, res : any) => {
  const file = req.file;
  if (!file) {
    res.status(400).send('No file uploaded');
    return;
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', createReadStream(file.filepath), 'audio.wav');
  formData.append('model', 'whisper-1');
  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );

  const { text, error } = await response.json();
  if (response.ok) {
    res.status(200).json({ text: text });
  } else {
    console.log('OPEN AI ERROR:');
    console.log(error.message);
    res.status(400).send(new Error());
  }
});