import { AxiosError, AxiosResponse } from 'axios';

interface AxiosSuccessResponse<T = any> {
  status: number;
  data: T;
  message?: string;
}

interface AxiosErrorResponse {
  status: number;
  message: string;
  error: any;
}

export class AxiosHelper {
  static extractErrorData(error: AxiosError, key?: string): AxiosErrorResponse {
    const result = {
      status: error.response?.status || 500,
      message:
        (error.response?.data as any)?.message ||
        error?.message ||
        'An error occurred',
      error: error.response?.data || error,
    };

    console.log(`AxiosHelper:${key} - Error data:`, result);

    return result;
  }

  static extractSuccessData<T = any>(
    response: AxiosResponse<T>,
  ): AxiosSuccessResponse<T> {
    return {
      status: response.status,
      data: response.data,
      message: (response.data as any)?.message,
    };
  }

  static checkResponseSuccess(response: AxiosResponse) {
    if (![200, 201].includes(response.status)) {
      return false;
    }
    return true;
  }
}
