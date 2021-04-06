import { NextApiRequest, NextApiResponse } from 'next';

export default function Posts(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).send({
    ok: true,
  });
}
