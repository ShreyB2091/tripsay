import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  let python = spawn('python', ['pythonScripts/transcribe.py', req.body.text]);
  let dataToSend = '';
  
  for await (const data of python.stdout){
    dataToSend += data.toString();
  }

  return res.status(200).json({ result: dataToSend });

}