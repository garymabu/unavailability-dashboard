import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import readXLSXData from '@base/utils/fileManipulation.utils';
import { ServiceDependency } from '@base/interface/model/serviceDependency';

const SHEET_NAME = 'CMDBBaseMVP';
const RELATIONS_SHEET = 'CMDBRelacao';

async function fetchAvailibilityByCSV() {
  const csvFilePath = path.join(process.cwd(), 'public', `${SHEET_NAME}.xlsx`);
  const relationsPage = await readXLSXData<ServiceDependency>(
    csvFilePath,
    RELATIONS_SHEET
  );
  return relationsPage;
}

async function fetchServiceAvailibilityTree(): Promise<ServiceDependency[]> {
  return fetchAvailibilityByCSV();
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  // Get the CSV file path in the public folder
  try {
    const data = await fetchServiceAvailibilityTree();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
}
