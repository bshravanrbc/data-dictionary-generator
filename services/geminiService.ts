import { DataDictionary, ChatMessage } from "../types";

const API_BASE_URL = 'http://localhost:8000';

export const generateDataDictionary = async (dataSample: string): Promise<DataDictionary> => {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: dataSample }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to generate dictionary');
  }

  return await response.json();
};

export const chatWithDataDictionary = async (
  dictionary: DataDictionary,
  userMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dictionary,
      message: userMessage,
      history
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to get chat response');
  }

  const data = await response.json();
  return data.response;
};
