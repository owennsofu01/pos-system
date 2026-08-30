export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; message: string; field?: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
