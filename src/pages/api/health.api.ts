import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  res.status(200).json({ message: 'All systems up and running' });
}
