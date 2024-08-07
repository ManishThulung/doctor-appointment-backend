export interface IError {
  status: number;
  fields: {
    name: {
      message: string;
    };
  };
  message: string;
  name: string;
}

class ApiError extends Error implements IError {
  public status = 500;

  public success = false;

  public fields: { name: { message: string } };

  constructor(
    msg: string,
    statusCode: number,
    success = false,
    name = "ApiError"
  ) {
    super();
    this.message = msg;
    this.status = statusCode;
    this.name = name;
    this.success = success;
  }
}

export default ApiError;
