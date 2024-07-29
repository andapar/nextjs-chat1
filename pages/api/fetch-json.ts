import { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchJsonData() {
  const res = await fetch(`${API_URL}/api/read-json`);
  if (!res.ok) {
    throw new Error('Failed to fetch JSON data');
  }
  const data = await res.json();
  return data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await fetchJsonData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
