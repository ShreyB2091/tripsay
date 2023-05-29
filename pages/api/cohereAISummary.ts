import { NextApiRequest, NextApiResponse } from 'next';
import cohere from 'cohere-ai';

const api_key: string = process.env.COHERE_API_KEY as string;
cohere.init(api_key);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  const summary = await cohere.summarize({
    text: req.body.text,
    extractiveness: 'auto',
    temperature: 0.5,
    length: 'medium',
  });
  res.status(200).json({ result: summary.body.summary });
}