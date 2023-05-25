import { spawn } from 'child_process';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const argument = JSON.stringify(req.body.messages);
  
  let python = spawn('python', ['pythonScripts/tokenCounter.py', argument]);
  let dataToSend = '';

  for await (const data of python.stdout){
    dataToSend += data.toString();
  }
  return res.status(200).json({ result: dataToSend });
}