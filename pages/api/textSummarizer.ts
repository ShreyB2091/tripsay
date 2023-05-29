import { spawn } from 'child_process';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  let python = spawn('python', ['pythonScripts/summary.py', req.body.text]);
  let dataToSend = '';
  for await (const data of python.stdout){
    dataToSend += data.toString();
  }
  return res.status(200).json({ result: dataToSend });
}